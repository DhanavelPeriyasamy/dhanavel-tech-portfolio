# Dhanavel Tech — The Data Series

A cinematic, interactive React portfolio for **Dhanavel Periyasamy**, inspired by the streaming-series presentation style of the reference portfolio shared by the owner. This is a separately maintained personal adaptation; it does not include the reference creator's personal images or resume.

## Features
- Five-second cinematic opening with skip option
- Recruiter, Data Analyst and Project Explorer profile views
- Animated hero, timeline, project details, skills and certificate sections
- Project detail popups with repository links and synthetic-data limitations
- Resume preview and download slot
- Responsive dark, electric-blue visual design

## Tech stack
React 18 · Vite · TypeScript-ready JSX · Framer Motion · CSS

## Run locally
```bash
npm install
npm run dev
```

## Build for deployment
```bash
npm run build
npm run preview
```

Deploy as a **Vite static site** on Vercel or Netlify. Build command: `npm run build`; output folder: `dist`.

## Add your personal assets
1. Upload your resume to `public/assets/Dhanavel_Periyasamy_Resume.pdf`. The resume modal is configured to preview and download this file.
2. Replace `public/assets/dhanavel-portrait.svg` with your approved portrait (or update the image path in `src/App.tsx`). The current SVG is only a temporary visual placeholder.

## Portfolio information
- Education: B.E. Computer Science and Engineering, Karpagam Institute of Technology, CGPA 8.0.
- Experience: Business Analyst at Tea Party (Jan–Oct 2026); Data Analytics training at Besant Technologies (Sep 2025–present).
- Projects: Hospital Analytics Dashboard, Student Performance Tracking System, Restaurant Management Database.
- Six certificates: Infosys Springboard, IBM/Coursera, Meta/Coursera and HackerRank.

## Data integrity notes
The three project datasets are synthetic demonstrations. Hospital readmission flags are randomly assigned and are not validated 30-day readmission measures; no occupancy KPI is claimed without daily census data. Student support indicators are review prompts, not predictive labels. Restaurant contribution is an estimate, not audited profit, and excludes several operating costs. No numerical business impact is claimed for Tea Party because measured values were not provided.

## Not yet implemented
The current site is a public portfolio presentation. Secure visitor registration, email OTP, Google sign-in, admin approval workflow, visitor analytics, contact-message storage and protected phone-number visibility are **not active**. These require a properly configured backend and security testing before production use. The phone number is intentionally not displayed publicly.
