import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

const ADMIN_EMAIL = "dhanavelperiyasamy.cse@gmail.com";
const COOKIE_NAME = "dt_session";
const TOKEN_TTL = 24 * 60 * 60 * 1000;

let clientPromise;
let indexesReady;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(env("MONGODB_URI"));
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  const db = client.db("dhanaveltech");
  if (!indexesReady) {
    indexesReady = Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("users").createIndex({ username: 1 }, { unique: true }),
      db.collection("users").createIndex({ emailVerificationExpires: 1 }, { expireAfterSeconds: 0 }),
      db.collection("users").createIndex({ resetExpires: 1 }, { expireAfterSeconds: 0 }),
      db.collection("auth_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    ]);
  }
  await indexesReady;
  return db;
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function cookieOptions() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; ${cookieOptions()}`);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function tokenHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function makeToken() {
  return randomBytes(32).toString("hex");
}

function getCookie(req, name) {
  const raw = req.headers.cookie || "";
  const item = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
}

function safeUser(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    organisationName: user.organisationName,
    professionalRole: user.professionalRole,
    location: user.location,
    role: user.role,
    emailVerified: Boolean(user.emailVerified)
  };
}

async function sendEmail(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env("EMAIL_FROM"),
      to: [to],
      subject,
      html
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Email provider error:", detail);
    throw new Error("Email could not be sent. Please try again later.");
  }
}

function appUrl(path) {
  return env("APP_URL").replace(/\/$/, "") + path;
}

async function limit(db, key, max = 8) {
  const now = new Date();
  const id = tokenHash(key + ":" + Math.floor(now.getTime() / 600000));
  const result = await db.collection("auth_limits").findOneAndUpdate(
    { _id: id, expiresAt: { $gt: now } },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 11 * 60000) } },
    { upsert: true, returnDocument: "after" }
  );
  const count = result?.count ?? result?.value?.count ?? max + 1;
  return count <= max;
}

function requireSameOrigin(req) {
  const origin = req.headers.origin;
  if (origin && origin !== env("APP_URL").replace(/\/$/, "")) {
    const error = new Error("Request origin not allowed.");
    error.status = 403;
    throw error;
  }
}

async function currentUser(req, db) {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env("SESSION_SECRET"));
    const { ObjectId } = await import("mongodb");
    if (!ObjectId.isValid(payload.sub)) return null;
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.sub), emailVerified: true });
    return user || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const path = (req.url || "").split("?")[0].replace(/\/$/, "");
    const method = req.method || "GET";

    if (method === "GET" && path === "/api/health") {
      const db = await getDb();
      await db.command({ ping: 1 });
      return sendJson(res, 200, { ok: true, service: "Dhanavel Tech API", database: "connected" });
    }

    if (method !== "GET") requireSameOrigin(req);
    const db = await getDb();
    const users = db.collection("users");
    const body = req.body || {};

    if (method === "POST" && path === "/api/register") {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      if (!(await limit(db, "register:" + ip, 5))) return sendJson(res, 429, { error: "Too many attempts. Please try again later." });

      const fullName = String(body.fullName || "").trim();
      const username = String(body.username || "").trim().toLowerCase();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const organisationName = String(body.organisationName || "").trim();
      const professionalRole = String(body.professionalRole || "").trim();
      const location = String(body.location || "").trim();

      if (!fullName || !/^[a-z0-9_]{3,24}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          password.length < 12 || password.length > 128 || !organisationName || !professionalRole || !location) {
        return sendJson(res, 400, { error: "Complete all fields. Username must be 3–24 letters, numbers or underscores; password must be at least 12 characters." });
      }

      const existing = await users.findOne({ $or: [{ email }, { username }] });
      if (existing) return sendJson(res, 409, { error: "An account with that email or username already exists." });

      const verifyToken = makeToken();
      const passwordHash = await bcrypt.hash(password, 12);
      const role = email === ADMIN_EMAIL ? "super_admin" : "visitor";
      const now = new Date();
      await users.insertOne({
        fullName, username, email, passwordHash, organisationName, professionalRole, location,
        role, emailVerified: false, emailVerificationTokenHash: tokenHash(verifyToken),
        emailVerificationExpires: new Date(now.getTime() + TOKEN_TTL), createdAt: now, updatedAt: now
      });

      const link = appUrl("/api/verify-email?token=" + encodeURIComponent(verifyToken));
      await sendEmail(email, "Verify your Dhanavel Tech account",
        `<p>Hello ${fullName.replace(/[&<>"]/g, "")},</p><p>Verify your email to activate your Dhanavel Tech account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours. If you did not register, ignore this email.</p>`);
      return sendJson(res, 201, { message: "Account created. Check your email for the verification link." });
    }

    if (method === "GET" && path === "/api/verify-email") {
      const token = new URL(req.url, "https://local.invalid").searchParams.get("token") || "";
      if (!token) return sendJson(res, 400, { error: "Verification link is invalid or expired." });
      const user = await users.findOne({
        emailVerificationTokenHash: tokenHash(token),
        emailVerificationExpires: { $gt: new Date() }
      });
      if (!user) return sendJson(res, 400, { error: "Verification link is invalid or expired. Please register again or request a new link." });
      await users.updateOne({ _id: user._id }, {
        $set: { emailVerified: true, updatedAt: new Date() },
        $unset: { emailVerificationTokenHash: "", emailVerificationExpires: "" }
      });
      const session = jwt.sign({ sub: String(user._id) }, env("SESSION_SECRET"), { expiresIn: "7d" });
      setSessionCookie(res, session);
      res.statusCode = 302;
      res.setHeader("Location", appUrl("/?verified=1"));
      return res.end();
    }

    if (method === "POST" && path === "/api/login") {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      if (!(await limit(db, "login:" + ip, 10))) return sendJson(res, 429, { error: "Too many attempts. Please try again later." });
      const identifier = String(body.identifier || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = await users.findOne({ $or: [{ email: identifier }, { username: identifier }] });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return sendJson(res, 401, { error: "Invalid username/email or password." });
      }
      if (!user.emailVerified) return sendJson(res, 403, { error: "Please verify your email before signing in." });
      const session = jwt.sign({ sub: String(user._id) }, env("SESSION_SECRET"), { expiresIn: "7d" });
      setSessionCookie(res, session);
      return sendJson(res, 200, { user: safeUser(user) });
    }

    if (method === "GET" && path === "/api/me") {
      const user = await currentUser(req, db);
      if (!user) return sendJson(res, 401, { error: "Please sign in." });
      return sendJson(res, 200, { user: safeUser(user) });
    }

    if (method === "POST" && path === "/api/logout") {
      clearSessionCookie(res);
      return sendJson(res, 200, { message: "Signed out." });
    }

    if (method === "POST" && path === "/api/forgot-password") {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      if (!(await limit(db, "forgot:" + ip, 5))) return sendJson(res, 429, { error: "Too many attempts. Please try again later." });
      const email = String(body.email || "").trim().toLowerCase();
      const user = await users.findOne({ email });
      if (user && user.emailVerified) {
        const resetToken = makeToken();
        await users.updateOne({ _id: user._id }, { $set: {
          resetTokenHash: tokenHash(resetToken),
          resetExpires: new Date(Date.now() + 60 * 60 * 1000)
        }});
        const link = appUrl("/reset-password?token=" + encodeURIComponent(resetToken));
        await sendEmail(email, "Reset your Dhanavel Tech password",
          `<p>We received a password reset request.</p><p><a href="${link}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, ignore this email.</p>`);
      }
      return sendJson(res, 200, { message: "If a verified account exists for that email, a password reset link has been sent." });
    }

    if (method === "POST" && path === "/api/reset-password") {
      const token = String(body.token || "");
      const password = String(body.password || "");
      if (!token || password.length < 12 || password.length > 128) {
        return sendJson(res, 400, { error: "A valid reset token and a password of at least 12 characters are required." });
      }
      const user = await users.findOne({ resetTokenHash: tokenHash(token), resetExpires: { $gt: new Date() } });
      if (!user) return sendJson(res, 400, { error: "Reset link is invalid or expired." });
      const passwordHash = await bcrypt.hash(password, 12);
      await users.updateOne({ _id: user._id }, {
        $set: { passwordHash, updatedAt: new Date() },
        $unset: { resetTokenHash: "", resetExpires: "" }
      });
      clearSessionCookie(res);
      return sendJson(res, 200, { message: "Password updated. Please sign in." });
    }

    return sendJson(res, 404, { error: "API route not found." });
  } catch (error) {
    console.error("Dhanavel Tech API error:", error);
    const status = Number(error?.status) || 500;
    return sendJson(res, status, { error: status === 500 ? "Something went wrong. Please try again later." : error.message });
  }
}
