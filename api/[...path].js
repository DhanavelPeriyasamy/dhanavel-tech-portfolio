import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

const ADMIN_EMAIL = "dhanavelperiyasamy.cse@gmail.com";
const COOKIE = "dt_session";
const VERIFY_MS = 24 * 60 * 60 * 1000;
let clientPromise;
let indexesPromise;

const env = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};
const hash = (value) => createHash("sha256").update(value).digest("hex");
const randomToken = () => randomBytes(32).toString("hex");
const appUrl = (path = "") => env("APP_URL").replace(/\/$/, "") + path;

async function dbConnect() {
  if (!clientPromise) clientPromise = new MongoClient(env("MONGODB_URI")).connect();
  const client = await clientPromise;
  const db = client.db("dhanaveltech");
  if (!indexesPromise) {
    indexesPromise = Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("users").createIndex({ username: 1 }, { unique: true }),
      db.collection("auth_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("visitors").createIndex({ createdAt: -1 })
    ]).catch((error) => { indexesPromise = null; throw error; });
  }
  await indexesPromise;
  return db;
}
function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
function cookie(res, token, clear = false) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE}=${clear ? "" : encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : 604800}${secure}`);
}
function readCookie(req) {
  const item = (req.headers.cookie || "").split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "="));
  return item ? decodeURIComponent(item.slice(COOKIE.length + 1)) : "";
}
function publicUser(u) {
  return { id: String(u._id), fullName: u.fullName, username: u.username, email: u.email,
    organisationName: u.organisationName, professionalRole: u.professionalRole,
    location: u.location, role: u.role, emailVerified: !!u.emailVerified };
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
async function mail(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("EMAIL_FROM"), to: [to], subject, html })
  });
  if (!response.ok) {
    console.error("Email provider error:", await response.text());
    throw new Error("Email delivery failed.");
  }
}
async function rateLimit(db, key, max) {
  const now = new Date();
  const id = hash(key + ":" + Math.floor(now.getTime() / 600000));
  try {
    const doc = await db.collection("auth_limits").findOneAndUpdate(
      { _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 11 * 60000) } },
      { upsert: true, returnDocument: "after" }
    );
    return (doc?.count ?? doc?.value?.count ?? max + 1) <= max;
  } catch (e) { if (e.code === 11000) return true; throw e; }
}
function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin || origin !== env("APP_URL").replace(/\/$/, "")) {
    const e = new Error("Request origin not allowed."); e.status = 403; throw e;
  }
}
async function sessionUser(req, db) {
  try {
    const payload = jwt.verify(readCookie(req), env("SESSION_SECRET"));
    if (!ObjectId.isValid(payload.sub)) return null;
    const u = await db.collection("users").findOne({ _id: new ObjectId(payload.sub), emailVerified: true });
    if (!u || (u.sessionVersion || 0) !== (payload.sv || 0)) return null;
    return u;
  } catch { return null; }
}
function createSession(res, user) {
  const token = jwt.sign({ sub: String(user._id), sv: user.sessionVersion || 0 }, env("SESSION_SECRET"), { expiresIn: "7d" });
  cookie(res, token);
}
export default async function handler(req, res) {
  try {
    const url = new URL(req.url || "/", "https://internal.invalid");
    const path = url.pathname.replace(/\/$/, "") || "/";
    const method = req.method || "GET";
    if (method === "OPTIONS") { res.statusCode = 204; return res.end(); }
    if (method !== "GET") checkOrigin(req);
    const db = await dbConnect();
    const users = db.collection("users");
    const body = req.body || {};

    if (method === "GET" && path === "/api/health") {
      await db.command({ ping: 1 });
      return json(res, 200, { ok: true, service: "Dhanavel Tech API", database: "connected" });
    }

    if (method === "POST" && path === "/api/register") {
      const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
      if (!(await rateLimit(db, "register:" + ip, 5))) return json(res, 429, { error: "Too many attempts. Try again later." });
      const fullName = String(body.fullName || "").trim();
      const username = String(body.username || "").trim().toLowerCase();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const organisationName = String(body.organisationName || "").trim();
      const professionalRole = String(body.professionalRole || "").trim();
      const location = String(body.location || "").trim();
      if (!fullName || fullName.length > 100 || !/^[a-z0-9_]{3,24}$/.test(username) ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
          password.length < 12 || password.length > 128 || !organisationName ||
          !professionalRole || !location || organisationName.length > 120 ||
          professionalRole.length > 100 || location.length > 120) {
        return json(res, 400, { error: "Complete all fields. Username: 3–24 letters, numbers or underscores. Password: 12–128 characters." });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const token = randomToken();
      const now = new Date();
      try {
        await users.insertOne({ fullName, username, email, passwordHash, organisationName,
          professionalRole, location, role: "visitor", emailVerified: false, sessionVersion: 0,
          emailVerificationTokenHash: hash(token), emailVerificationExpires: new Date(now.getTime() + VERIFY_MS),
          createdAt: now, updatedAt: now });
      } catch (e) {
        if (e.code === 11000) return json(res, 409, { error: "That email or username is already registered." });
        throw e;
      }
      const link = appUrl("/api/verify-email?token=" + encodeURIComponent(token));
      try {
        await mail(email, "Verify your Dhanavel Tech account",
          `<p>Hello ${escapeHtml(fullName)},</p><p>Verify your email to activate your account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours.</p>`);
      } catch {
        await users.deleteOne({ email, emailVerified: false });
        return json(res, 503, { error: "We could not send the verification email. Please try again shortly." });
      }
      return json(res, 201, { message: "Account created. Check your inbox for the verification link." });
    }

    if (method === "GET" && path === "/api/verify-email") {
      const token = url.searchParams.get("token") || "";
      if (!token) return json(res, 400, { error: "Verification link is invalid or expired." });
      const user = await users.findOne({ emailVerificationTokenHash: hash(token), emailVerificationExpires: { $gt: new Date() } });
      if (!user) return json(res, 400, { error: "Verification link is invalid or expired. Please register again." });
      const role = user.email === ADMIN_EMAIL ? "super_admin" : "visitor";
      await users.updateOne({ _id: user._id }, { $set: { emailVerified: true, role, updatedAt: new Date() },
        $unset: { emailVerificationTokenHash: "", emailVerificationExpires: "" } });
      createSession(res, { ...user, role });
      res.statusCode = 302; res.setHeader("Location", appUrl("/?verified=1")); return res.end();
    }

    if (method === "POST" && path === "/api/login") {
      const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
      if (!(await rateLimit(db, "login:" + ip, 10))) return json(res, 429, { error: "Too many attempts. Try again later." });
      const identifier = String(body.identifier || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = await users.findOne({ $or: [{ email: identifier }, { username: identifier }] });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) return json(res, 401, { error: "Invalid username/email or password." });
      if (!user.emailVerified) return json(res, 403, { error: "Please verify your email using the link we sent you." });
      createSession(res, user);
      return json(res, 200, { user: publicUser(user) });
    }

    if (method === "GET" && path === "/api/me") {
      const user = await sessionUser(req, db);
      if (!user) return json(res, 401, { error: "Please sign in." });
      return json(res, 200, { user: publicUser(user) });
    }

    if (method === "POST" && path === "/api/logout") {
      cookie(res, "", true); return json(res, 200, { message: "Signed out." });
    }

    if (method === "POST" && path === "/api/forgot-password") {
      const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
      if (!(await rateLimit(db, "forgot:" + ip, 5))) return json(res, 429, { error: "Too many attempts. Try again later." });
      const email = String(body.email || "").trim().toLowerCase();
      const user = await users.findOne({ email, emailVerified: true });
      if (user) {
        const token = randomToken();
        await users.updateOne({ _id: user._id }, { $set: { resetTokenHash: hash(token), resetExpires: new Date(Date.now() + 3600000) } });
        const link = appUrl("/?reset=" + encodeURIComponent(token));
        await mail(email, "Reset your Dhanavel Tech password", `<p>Use this link to reset your password:</p><p><a href="${link}">Reset password</a></p><p>This link expires in one hour.</p>`);
      }
      return json(res, 200, { message: "If a verified account exists, a password reset link has been sent." });
    }

    if (method === "POST" && path === "/api/reset-password") {
      const token = String(body.token || "");
      const password = String(body.password || "");
      if (!token || password.length < 12 || password.length > 128) return json(res, 400, { error: "Use a valid reset link and a password of at least 12 characters." });
      const user = await users.findOne({ resetTokenHash: hash(token), resetExpires: { $gt: new Date() } });
      if (!user) return json(res, 400, { error: "Reset link is invalid or expired." });
      await users.updateOne({ _id: user._id }, { $set: { passwordHash: await bcrypt.hash(password, 12), sessionVersion: (user.sessionVersion || 0) + 1, updatedAt: new Date() },
        $unset: { resetTokenHash: "", resetExpires: "" } });
      cookie(res, "", true); return json(res, 200, { message: "Password updated. Please sign in again." });
    }

    if (method === "GET" && path === "/api/private/contact") {
      const user = await sessionUser(req, db);
      if (!user) return json(res, 401, { error: "Verified sign-in required." });
      return json(res, 200, { phone: "+91 6369099225" });
    }

    if (method === "GET" && path === "/api/admin/summary") {
      const user = await sessionUser(req, db);
      if (!user || user.role !== "super_admin" || user.email !== ADMIN_EMAIL) return json(res, 403, { error: "Super Admin access required." });
      const [totalUsers, verifiedUsers, recentVisitors] = await Promise.all([
        users.countDocuments(), users.countDocuments({ emailVerified: true }),
        db.collection("visitors").find({}, { projection: { ip: 0 } }).sort({ createdAt: -1 }).limit(20).toArray()
      ]);
      return json(res, 200, { totalUsers, verifiedUsers, recentVisitors });
    }

    return json(res, 404, { error: "API route not found." });
  } catch (error) {
    console.error("Dhanavel Tech API error:", error);
    return json(res, Number(error.status) || 500, { error: error.status ? error.message : "Something went wrong. Please try again later." });
  }
}