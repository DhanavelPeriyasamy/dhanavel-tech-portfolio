import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = [
  "index.html", "about.html", "skills.html", "projects.html",
  "experience.html", "certificates.html", "contact.html", "resume.html",
  "projects/hospital-analytics.html",
  "projects/student-performance.html",
  "projects/restaurant-database.html"
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replaceAll("/", "-").replace(".html", ""), resolve(__dirname, page)]))
    }
  }
});