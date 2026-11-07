# Dhanavel Tech — The Data Series

Personal portfolio for Dhanavel Periyasamy, built with React, Vite, TypeScript and Framer Motion.

## Features
- Responsive portfolio with opening animation and Recruiter / Data Analyst / Project Explorer views
- Project details, certificate links, education and work timeline
- Resume preview and download
- MongoDB Atlas-backed visitor registration and authentication
- Username or email sign-in, email verification and password reset
- HttpOnly session cookie, bcrypt password hashing and rate-limited auth endpoints
- Super Admin role assigned only after verification of the owner email
- Private phone endpoint requires an authenticated, verified session

## Stack
React 18 · Vite · TypeScript · Framer Motion · Vercel Functions · MongoDB Atlas · bcryptjs · JWT · Resend

## Required Vercel environment variables
- `MONGODB_URI` — MongoDB Atlas connection string for database `dhanaveltech`
- `SESSION_SECRET` — cryptographically random secret (at least 48 random bytes)
- `APP_URL` — exact deployed origin, e.g. `https://dhanavel-tech-portfolio.vercel.app`
- `RESEND_API_KEY` — Resend API key
- `EMAIL_FROM` — sender identity verified in Resend, e.g. `Dhanavel Tech <no-reply@your-verified-domain>`

Set production environment values before testing registration. Configure APP_URL to match the production deployment origin exactly. Email sending requires a sender/domain accepted by Resend.

## Local development
```bash
npm install
npm run dev
```

The API is deployed as a Vercel Node.js catch-all function at `api/[...path].js`. The browser must call it from the same origin.

## Security notes
- Never commit environment variables or secrets.
- Rotate any database password or API key that has been shared in chat or committed.
- Registration grants visitor access after email verification; it does not require manual approval.
- The Super Admin role is assigned server-side only to the verified owner email.
- The phone number is returned only by the authenticated `/api/private/contact` endpoint.
- Review Vercel logs and perform end-to-end testing before announcing the site publicly.
