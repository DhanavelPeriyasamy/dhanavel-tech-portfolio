import { useState } from "react";
import { motion } from "framer-motion";

const projects = [
  { title: "Hospital Analytics Dashboard", category: "POWER BI · HEALTHCARE", tools: ["Power BI", "Excel", "SQL"], description: "An interactive healthcare dashboard exploring encounter volume, patient flow, department workload, length of stay and discharge turnaround.", url: "https://github.com/DhanavelPeriyasamy/hospital-analytics-dashboard", number: "01", accent: "lavender" },
  { title: "Student Performance Tracking System", category: "EXCEL · EDUCATION", tools: ["Excel", "Pivot Tables", "Charts"], description: "An Excel-based system for reviewing academic performance, attendance and subject trends across terms.", url: "https://github.com/DhanavelPeriyasamy/student-performance-analytics", number: "02", accent: "rose" },
  { title: "Restaurant Management Database", category: "MYSQL · BUSINESS ANALYTICS", tools: ["MySQL", "Joins", "Subqueries"], description: "A database project exploring restaurant orders, customers, menu items and sales performance.", url: "https://github.com/DhanavelPeriyasamy/restaurant-management-analytics", number: "03", accent: "plum" }
];
const skills = [
  { name: "Data Analytics", items: ["Data Cleaning & Preparation", "Exploratory Data Analysis", "Basic Statistics", "Business Insights", "Data Visualization", "Data Modeling"] },
  { name: "Programming & Databases", items: ["Python", "Pandas", "NumPy", "Matplotlib", "MySQL", "MongoDB basics"] },
  { name: "BI & Tools", items: ["Microsoft Excel", "Advanced Excel", "Power BI", "Tableau", "Git", "VS Code"] },
  { name: "Web Technologies", items: ["HTML", "CSS", "JavaScript"] },
  { name: "Professional Skills", items: ["Attention to detail", "Communication", "Adaptability", "Team collaboration", "Report writing"] }
];
const experience = [
  { period: "JAN – OCT 2026", role: "Business Analyst", place: "Tea Party · Pochampalli, Krishnagiri", detail: "Worked with sales, inventory, food cost and reporting." },
  { period: "SEP 2025 – PRESENT", role: "Data Analytics Training", place: "Besant Technologies · Velachery", detail: "Training in Excel, SQL, Python and Power BI." },
  { period: "2021 – 2025", role: "B.E. Computer Science & Engineering", place: "Karpagam Institute of Technology · Anna University", detail: "CGPA 8.0." },
  { period: "2020 – 2021", role: "Higher Secondary Certificate", place: "Government Higher Secondary School", detail: "86.13%." },
  { period: "2018 – 2019", role: "Secondary School Leaving Certificate", place: "Government Higher Secondary School", detail: "83%." }
];
const certificates = [
  { title: "Full Stack Web Development", issuer: "Infosys Springboard", note: "QR-code certificate; verification URL not supplied." },
  { title: "Back-End Apps with Node.js & Express", issuer: "IBM / Coursera", url: "https://www.coursera.org/account/accomplishments/verify/7R3MBQTQWBH5" },
  { title: "Introduction to Front-End Development", issuer: "Meta / Coursera", url: "https://www.coursera.org/account/accomplishments/verify/STCEHNTRJXDR" },
  { title: "Python (Basics)", issuer: "HackerRank", url: "https://www.hackerrank.com/certificates/860558505fb0" },
  { title: "SQL (Advanced)", issuer: "HackerRank", url: "https://www.hackerrank.com/certificates/81325ecadf8b" },
  { title: "Problem Solving (Intermediate)", issuer: "HackerRank", url: "https://www.hackerrank.com/certificates/0d78613826c4" }
];
const nav = ["Home", "About", "Skills", "Projects", "Experience", "Contact"];
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Home");
  const [sent, setSent] = useState(false);
  const go = (name: string) => { setActive(name); setMenuOpen(false); document.getElementById(name.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); };
  const submitContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const subject = encodeURIComponent(String(form.get("subject") || "Portfolio enquiry"));
    const body = encodeURIComponent("Name: " + form.get("name") + "\nEmail: " + form.get("email") + "\n\n" + form.get("message"));
    window.location.href = "mailto:dhanavelperiyasamy.cse@gmail.com?subject=" + subject + "&body=" + body;
    setSent(true);
  };
  return <div className="portfolio">
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => setActive("Home")}><span className="brand-mark">DT</span><span>DHANAVEL <b>TECH.</b></span></a>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"}</button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}>{nav.map(n => <button key={n} className={active === n ? "nav-link active" : "nav-link"} onClick={() => go(n)}>{n}</button>)}<a className="nav-resume" href="/resume.pdf" target="_blank" rel="noreferrer">Resume ↗</a></nav>
    </header>

    <main>
      <section id="home" className="hero section-wrap">
        <div className="hero-copy">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>DATA · INSIGHT · IMPACT</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Hello, I'm<br/><em>Dhanavel Periyasamy.</em></motion.h1>
          <motion.p className="hero-lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>Aspiring Data Analyst with a Computer Science background, exploring data, building useful solutions and turning information into meaningful insights.</motion.p>
          <div className="hero-actions"><button className="button button-primary" onClick={() => go("Projects")}>Explore my work <span>↗</span></button><a className="button button-secondary" href="/resume.pdf" target="_blank" rel="noreferrer">View resume ↗</a></div>
          <div className="hero-meta"><span>BASED IN INDIA</span><span><i/> OPEN TO OPPORTUNITIES</span></div>
        </div>
        <div className="hero-art" aria-label="Dhanavel Tech monogram artwork"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="portrait-placeholder"><span>DT</span><small>DHANAVEL TECH</small></div><div className="floating-note note-one">DATA ANALYTICS</div><div className="floating-note note-two">PYTHON · SQL · POWER BI</div><div className="art-spark">✳</div></div>
      </section>

      <div className="ticker"><div>DATA ANALYTICS <b>✳</b> PYTHON <b>✳</b> SQL <b>✳</b> POWER BI <b>✳</b> EXCEL <b>✳</b> BUSINESS INSIGHTS <b>✳</b> DATA ANALYTICS <b>✳</b></div></div>

      <section id="about" className="section-wrap content-section">
        <p className="eyebrow">01 / ABOUT</p><div className="section-heading"><h2>Curious by nature.<br/><em>Driven by data.</em></h2><p>I'm Dhanavel Periyasamy, a Computer Science graduate interested in data analytics, business problem-solving and building practical technology solutions.</p></div>
        <div className="about-grid"><article className="about-feature"><span className="feature-symbol">✳</span><h3>My approach</h3><p>I enjoy understanding how things work, organizing information and finding patterns that can support better decisions. I keep learning by building projects and working with real-world-style datasets.</p></article><article className="about-stat"><strong>B.E.</strong><span>Computer Science & Engineering</span></article><article className="about-stat"><strong>8.0</strong><span>Undergraduate CGPA</span></article></div>
      </section>

      <section id="skills" className="section-wrap content-section section-tint">
        <p className="eyebrow">02 / SKILLS</p><div className="section-heading"><h2>Tools for turning<br/><em>questions into clarity.</em></h2><p>A growing toolkit across analytics, programming, databases and communication. Skill levels are intentionally not represented as percentages.</p></div>
        <div className="skills-grid">{skills.map((group, i) => <article className="skill-card" key={group.name}><div className="card-index">0{i+1}</div><h3>{group.name}</h3><div className="skill-tags">{group.items.map(item => <span key={item}>{item}</span>)}</div></article>)}</div>
      </section>

      <section id="projects" className="section-wrap content-section">
        <p className="eyebrow">03 / SELECTED WORK</p><div className="section-heading"><h2>Projects with<br/><em>a purpose.</em></h2><p>Practical projects exploring analytics, reporting and database design. Open a repository to explore the implementation.</p></div>
        <div className="projects-grid">{projects.map(p => <article className={"project-card " + p.accent} key={p.number}><div className="project-top"><span>PROJECT / {p.number}</span><span>↗</span></div><div className="project-art"><div className="chart-bars"><i/><i/><i/><i/><i/><i/></div><span className="art-label">{p.category}</span></div><div className="project-body"><p className="project-category">{p.category}</p><h3>{p.title}</h3><p>{p.description}</p><div className="skill-tags">{p.tools.map(t => <span key={t}>{t}</span>)}</div><a className="text-link" href={p.url} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a></div></article>)}</div>
      </section>

      <section id="experience" className="section-wrap content-section section-tint">
        <p className="eyebrow">04 / EXPERIENCE & EDUCATION</p><div className="section-heading"><h2>The path so<br/><em>far.</em></h2><p>Education, training and professional experience that have shaped my approach to technology and business.</p></div>
        <div className="timeline">{experience.map((item, i) => <article className="timeline-item" key={item.period}><div className="timeline-date">{item.period}</div><div className="timeline-dot"/><div className="timeline-info"><span>0{i+1}</span><h3>{item.role}</h3><b>{item.place}</b><p>{item.detail}</p></div></article>)}</div>
        <div className="certificates"><div className="cert-heading"><h3>Certifications & learning</h3><span>06 RECORDS</span></div><div className="cert-grid">{certificates.map(c => <article className="cert-card" key={c.title}><span className="cert-icon">✳</span><h4>{c.title}</h4><p>{c.issuer}</p>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">VERIFY CERTIFICATE ↗</a> : <small>{c.note}</small>}</article>)}</div></div>
      </section>

      <section id="contact" className="section-wrap contact-section">
        <div className="contact-copy"><p className="eyebrow">05 / CONTACT</p><h2>Have a question<br/>or an opportunity?<br/><em>Let's talk.</em></h2><p>I'm happy to connect about data, projects, learning and professional opportunities.</p><a className="contact-email" href="mailto:dhanavelperiyasamy.cse@gmail.com">dhanavelperiyasamy.cse@gmail.com ↗</a><div className="social-links"><a href="https://www.linkedin.com/in/dhanavel-periyasamy-cse/" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="https://www.instagram.com/itx_dhana_sts/" target="_blank" rel="noreferrer">INSTAGRAM ↗</a><a href="https://x.com/itx_dhana_sts" target="_blank" rel="noreferrer">X ↗</a></div></div>
        <form className="contact-form" onSubmit={submitContact}><label>Your name<input name="name" required placeholder="Your full name"/></label><label>Email address<input name="email" type="email" required placeholder="you@example.com"/></label><label>Subject<input name="subject" required placeholder="What would you like to discuss?"/></label><label>Message<textarea name="message" rows={4} required placeholder="Write your message..."/></label><button className="button button-primary" type="submit">Send message <span>↗</span></button>{sent && <small className="form-note">Your email app should open with your message ready to send.</small>}</form>
      </section>

      <section className="resume-strip section-wrap"><div><p className="eyebrow">WANT THE DETAILS?</p><h2>Take a closer look<br/><em>at my journey.</em></h2></div><a className="button button-primary" href="/resume.pdf" target="_blank" rel="noreferrer">View my resume ↗</a></section>
    </main>
    <footer className="site-footer"><a className="brand" href="#home"><span className="brand-mark">DT</span><span>DHANAVEL <b>TECH.</b></span></a><p>Designed with curiosity. Built with purpose.</p><span>© {new Date().getFullYear()} DHANAVEL PERIYASAMY</span></footer>
  </div>;
}
export default App;
