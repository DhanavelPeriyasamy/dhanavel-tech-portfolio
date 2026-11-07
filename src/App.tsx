import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';

const EMAIL='dhanavelperiyasamy.cse@gmail.com';
const projects=[
 {id:'hospital',title:'Hospital Analytics Dashboard',year:'2025 – Present',tag:'POWER BI · HEALTHCARE',tools:['Power BI','Excel','SQL'],desc:'An interactive healthcare dashboard exploring encounter volume, patient flow, department workload, length of stay and discharge turnaround.',details:['Built Power BI dashboard views using cleaned data and analysed 10,000+ records across Excel and SQL workflows.','Demonstration data: 1,800 fictional patients, six departments and 6,500 encounters.','Readmission flags are randomly assigned and are not validated 30-day readmission measures. No occupancy KPI is claimed without daily census data.'],url:'https://github.com/DhanavelPeriyasamy/hospital-analytics-dashboard',tone:'blue'},
 {id:'student',title:'Student Performance Tracking System',year:'2025 – Present',tag:'EXCEL · EDUCATION',tools:['Excel','Pivot Tables','Charts','Formulas'],desc:'An Excel-based system for reviewing academic performance, attendance and subject trends across terms.',details:['Created term-wise and subject-wise views with spreadsheet formulas, Pivot Tables and charts.','Demonstration data: around 900 fictional students, three terms and five subjects.','Support indicators are review prompts, not predictive labels.'],url:'https://github.com/DhanavelPeriyasamy/student-performance-analytics',tone:'green'},
 {id:'restaurant',title:'Restaurant Management Database',year:'2025',tag:'MYSQL · BUSINESS ANALYTICS',tools:['MySQL','Joins','Subqueries','SQL'],desc:'A database project exploring restaurant orders, customers, menu items and sales performance.',details:['Designed and queried data covering orders, customers and menu items.','Demonstration data: 3,200 fictional orders, 700 customers and eight menu items.','Estimated contribution is not audited profit and excludes labour, rent, tax, waste and other operating costs.'],url:'https://github.com/DhanavelPeriyasamy/restaurant-management-analytics',tone:'gold'}
];
const certificates=[
 ['Full Stack Web Development','Infosys Springboard','QR-code certificate; verification link can be added from the certificate.',''],
 ['Back-End Apps with Node.js & Express','IBM / Coursera','Verified certificate','https://www.coursera.org/account/accomplishments/verify/7R3MBQTQWBH5'],
 ['Introduction to Front-End Development','Meta / Coursera','Verified certificate','https://www.coursera.org/account/accomplishments/verify/STCEHNTRJXDR'],
 ['Python (Basics)','HackerRank','Verified certificate','https://www.hackerrank.com/certificates/860558505fb0'],
 ['SQL (Advanced)','HackerRank','Verified certificate','https://www.hackerrank.com/certificates/81325ecadf8b'],
 ['Problem Solving (Intermediate)','HackerRank','Verified certificate','https://www.hackerrank.com/certificates/0d78613826c4']
];
const skillGroups=[
 ['DATA ANALYTICS','Data Cleaning & Preparation','Exploratory Data Analysis','Basic Statistics','Business Insights','Data Visualization','Data Modeling'],
 ['PROGRAMMING & DATABASES','Python','Pandas','NumPy','Matplotlib','MySQL (Joins & Subqueries)','MongoDB basics'],
 ['BI & TOOLS','Microsoft Excel','Advanced Excel','Power BI','Tableau','Git','VS Code'],
 ['WEB TECHNOLOGIES','HTML','CSS','JavaScript'],
 ['PROFESSIONAL SKILLS','Attention to detail','Communication','Adaptability','Team collaboration','Documentation & report writing']
];
const journey=[
 ['2018 – 2019','SSLC','Government Higher Secondary School','83%'],
 ['2020 – 2021','HSC','Government Higher Secondary School','86.13%'],
 ['2021 – 2025','B.E. Computer Science & Engineering','Karpagam Institute of Technology · Anna University','CGPA 8.0'],
 ['Sep 2025 – Present','Data Analytics Training','Besant Technologies · Velachery','Advanced Excel · SQL · Python · Power BI · Statistics · Data Cleaning'],
 ['Jan – Oct 2026','Business Analyst','Tea Party · Pochampalli, Krishnagiri','Sales · Inventory · Food cost · Reporting']
];
const profiles=[{id:'recruiter',name:'Recruiter',sub:'Experience, resume and strengths',symbol:'◈'},{id:'analyst',name:'Data Analyst',sub:'Projects, tools and dashboards',symbol:'▦'},{id:'explorer',name:'Project Explorer',sub:'Explore the work in detail',symbol:'⌘'}];
function App(){
 const [stage,setStage]=useState<'opening'|'login'|'register'|'pending'|'profiles'|'home'>('opening');
 const [profile,setProfile]=useState('recruiter');
 const [active,setActive]=useState('home');
 const [selected,setSelected]=useState<typeof projects[number]|null>(null);
 const [resume,setResume]=useState(false);
 const [email,setEmail]=useState('');
 const [otp,setOtp]=useState('');
 const [otpSent,setOtpSent]=useState(false);
 const [authMessage,setAuthMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [userId,setUserId]=useState('');
 const [registration,setRegistration]=useState({full_name:'',company:'',job_title:'',reason:'',linkedin_url:''});
 const [pendingName,setPendingName]=useState('');
 const resolveUser=async(user:{id:string;email?:string})=>{
  if(!supabase)return;
  setUserId(user.id);
  const {data:roleData}=await supabase.from('dt_user_roles').select('role').eq('user_id',user.id).maybeSingle();
  if(roleData?.role==='super_admin'){setStage('profiles');return;}
  const {data:access}=await supabase.from('dt_visitor_access').select('status,full_name').eq('user_id',user.id).maybeSingle();
  if(access?.status==='approved'){setStage('profiles');return;}
  if(access?.status==='pending'){setPendingName(access.full_name||'');setStage('pending');return;}
  if(access?.status==='rejected'){setAuthMessage('Your access request was declined. Please contact the portfolio owner.');await supabase.auth.signOut();setStage('login');return;}
  setStage('register');
 };
 const sendOtp=async()=>{
  if(!supabase){setAuthMessage('Authentication is not configured. Please try again later.');return;}
  if(!email.trim()){setAuthMessage('Enter your email address first.');return;}
  setBusy(true);setAuthMessage('');
  const {error}=await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:true}});
  setBusy(false);
  if(error){setAuthMessage(error.message);return;}
  setOtpSent(true);setAuthMessage('A six-digit verification code has been sent to your email.');
 };
 const verifyOtp=async()=>{
  if(!supabase)return;
  setBusy(true);setAuthMessage('');
  const {data,error}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:otp.trim(),type:'email'});
  setBusy(false);
  if(error){setAuthMessage(error.message);return;}
  if(data.user)await resolveUser(data.user);
 };
 const googleLogin=async()=>{
  if(!supabase){setAuthMessage('Authentication is not configured.');return;}
  const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
  if(error)setAuthMessage(error.message);
 };
 const submitRegistration=async()=>{
  if(!supabase||!userId)return;
  if(!registration.full_name.trim()||!registration.company.trim()||!registration.job_title.trim()||!registration.reason.trim()){setAuthMessage('Please complete your name, company, job title and reason for access.');return;}
  setBusy(true);setAuthMessage('');
  const {error}=await supabase.from('dt_visitor_access').insert({user_id:userId,...registration,status:'pending'});
  setBusy(false);
  if(error){setAuthMessage(error.message);return;}
  setPendingName(registration.full_name);setStage('profiles');
 };
 useEffect(()=>{if(stage!=='opening')return;const t=window.setTimeout(()=>setStage('login'),5000);return()=>window.clearTimeout(t)},[stage]);
 useEffect(()=>{
  if(!supabase)return;
  // Keep the login screen as the mandatory first step on every fresh page load.
  // Only process a newly completed sign-in (OTP or Google OAuth), not a restored session.
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_IN'&&session?.user)resolveUser(session.user);
  });
  return()=>subscription.unsubscribe();
 },[]);

 const enter=(id:string)=>{setProfile(id);setStage('home');window.scrollTo({top:0,behavior:'smooth'})};
 const jump=(id:string)=>{setActive(id);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})};
 return <div className="app-shell">
  <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
  <AnimatePresence mode="wait">
   {stage==='opening'&&<motion.section className="opening" key="opening" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.04}} transition={{duration:.7}}>
    <div className="opening-grid"/><motion.div className="opening-mark" initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.3,duration:1}}>
     <span className="eyebrow">A PERSONAL DATA STORY</span><div className="monogram">DT<span>.</span></div><h1>DHANAVEL <em>TECH</em></h1><p>DATA · INSIGHT · IMPACT</p>
    </motion.div><div className="opening-bottom"><span>SEASON 01 · THE DATA SERIES</span><div className="progress-line"><i/></div><button onClick={()=>setStage('login')}>SKIP INTRO ↗</button></div>
   </motion.section>}
   {stage==='login'&&<motion.section className="profile-screen auth-screen" key="login" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
    <span className="eyebrow">DHANAVEL TECH · SECURE ACCESS</span><h1>Access the<br/><em>portfolio.</em></h1><p className="muted">Verify your email to continue. New visitors can request access after verification.</p>
    <div className="auth-panel">
     <label>Email address</label><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
     {otpSent&&<><label>Six-digit verification code</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter email code" value={otp} onChange={e=>setOtp(e.target.value)}/></>}
     {authMessage&&<p className="auth-message">{authMessage}</p>}
     {!otpSent?<button className="primary-btn auth-action" disabled={busy} onClick={sendOtp}>{busy?'SENDING…':'SEND EMAIL CODE ↗'}</button>:<><button className="primary-btn auth-action" disabled={busy||otp.trim().length!==6} onClick={verifyOtp}>{busy?'VERIFYING…':'VERIFY & CONTINUE ↗'}</button><button className="text-button" onClick={()=>{setOtpSent(false);setOtp('');setAuthMessage('')}}>USE A DIFFERENT EMAIL</button></>}
     <div className="auth-divider"><span>OR</span></div><button className="secondary-btn google-action" onClick={googleLogin}>CONTINUE WITH GOOGLE ↗</button>
    </div><button className="text-button" onClick={()=>setStage('opening')}>↶ REPLAY OPENING</button>
   </motion.section>}
   {stage==='register'&&<motion.section className="profile-screen auth-screen" key="register" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
    <span className="eyebrow">VISITOR REGISTRATION</span><h1>Request<br/><em>access.</em></h1><p className="muted">Your email is verified. Complete your profile to get instant access to the portfolio.</p>
    <div className="auth-panel registration-panel">
     <label>Full name *</label><input value={registration.full_name} onChange={e=>setRegistration({...registration,full_name:e.target.value})} placeholder="Your full name"/>
     <label>Company *</label><input value={registration.company} onChange={e=>setRegistration({...registration,company:e.target.value})} placeholder="Company or organisation"/>
     <label>Job title *</label><input value={registration.job_title} onChange={e=>setRegistration({...registration,job_title:e.target.value})} placeholder="Your role"/>
     <label>Reason for access *</label><textarea value={registration.reason} onChange={e=>setRegistration({...registration,reason:e.target.value})} placeholder="Tell me why you would like to view the portfolio"/>
     <label>LinkedIn profile (optional)</label><input value={registration.linkedin_url} onChange={e=>setRegistration({...registration,linkedin_url:e.target.value})} placeholder="https://linkedin.com/in/..."/>
     {authMessage&&<p className="auth-message">{authMessage}</p>}
     <button className="primary-btn auth-action" disabled={busy} onClick={submitRegistration}>{busy?'SUBMITTING…':'SUBMIT & ENTER PORTFOLIO ↗'}</button>
    </div>
   </motion.section>}
   {stage==='pending'&&<motion.section className="profile-screen auth-screen" key="pending" initial={{opacity:0}} animate={{opacity:1}}>
    <span className="eyebrow">ACCESS REQUEST RECEIVED</span><h1>Thank you{pendingName?', '+pendingName.split(' ')[0]:''}.<br/><em>Almost there.</em></h1><p className="muted">Your email is verified and your visitor request is waiting for approval. You can return after the portfolio owner approves your access.</p>
    <button className="secondary-btn" onClick={async()=>{await supabase?.auth.signOut();setStage('login');setOtpSent(false);}}>SIGN OUT</button>
   </motion.section>}
   {stage==='profiles'&&<motion.section className="profile-screen" key="profiles" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
    <span className="eyebrow">DHANAVEL TECH PRESENTS</span><h1>Who's exploring<br/><em>the portfolio?</em></h1><p className="muted">Choose a view to start your experience.</p>
    <div className="profile-grid">{profiles.map(p=><button className="profile-card" key={p.id} onClick={()=>enter(p.id)}><span className="profile-symbol">{p.symbol}</span><strong>{p.name}</strong><small>{p.sub}</small><span className="profile-arrow">↗</span></button>)}</div>
    <button className="text-button" onClick={()=>setStage('opening')}>↶ REPLAY OPENING</button>
   </motion.section>}
   {stage==='home'&&<motion.div className="site" key="home" initial={{opacity:0}} animate={{opacity:1}}>
    <header className="topbar"><a className="brand" href="#home" onClick={e=>{e.preventDefault();jump('home')}}><span>DT</span> DHANAVEL TECH</a><nav>{[['about','About'],['journey','Journey'],['projects','Projects'],['skills','Skills'],['certificates','Certificates']].map(([id,label])=><button className={active===id?'active':''} key={id} onClick={()=>jump(id)}>{label}</button>)}</nav><button className="nav-resume" onClick={()=>setResume(true)}>VIEW RESUME ↗</button></header>
    <main>
     <section className="hero-section" id="home"><div className="hero-copy"><span className="eyebrow"><i className="live-dot"/> ASPIRING DATA ANALYST · CHENNAI, INDIA</span><h1>Turning data<br/>into <em>direction.</em></h1><p className="hero-lede">I'm <b>Dhanavel Periyasamy</b> — a data enthusiast working across SQL, Python, Excel and Power BI to turn complex information into clear, practical insights.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>jump('projects')}>EXPLORE MY WORK <span>↗</span></button><button className="secondary-btn" onClick={()=>setResume(true)}>VIEW RESUME</button></div><div className="hero-meta"><span>SQL <b>·</b> PYTHON <b>·</b> EXCEL <b>·</b> POWER BI</span><span>PROFILE: {profiles.find(p=>p.id===profile)?.name.toUpperCase()}</span></div></div><div className="hero-art"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="portrait-frame"><img src="/assets/dhanavel-portrait.jpg.png" alt="Dhanavel profile portrait"/></div><div className="float-chip chip-top"><span className="chip-dot"/> DATA STORYTELLER</div><div className="float-chip chip-bottom"><b>01</b><span>INSIGHT<br/>IN MOTION</span></div><div className="art-index">DT / 2026</div></div></section>
     <section className="ticker"><div>DATA CLEANING <b>✳</b> BUSINESS INTELLIGENCE <b>✳</b> SQL & PYTHON <b>✳</b> DASHBOARD DESIGN <b>✳</b> DATA STORYTELLING <b>✳</b> </div></section>
     <section className="section about-section" id="about"><div className="section-kicker">01 / THE PERSON</div><div className="section-heading"><h2>Curiosity meets<br/><em>clarity.</em></h2><p>Computer Science graduate with a practical interest in analytics, business reporting and building dashboards that make information easier to understand.</p></div><div className="about-cards"><article className="info-card"><span>EDUCATION</span><h3>B.E. Computer Science & Engineering</h3><p>Karpagam Institute of Technology · Anna University</p><b>CGPA 8.0 · 2021–2025</b></article><article className="info-card"><span>WORK EXPERIENCE</span><h3>Business Analyst</h3><p>Tea Party · Pochampalli, Krishnagiri</p><b>January – October 2026</b></article><article className="info-card"><span>CURRENT LEARNING</span><h3>Data Analytics Training</h3><p>Besant Technologies · Velachery</p><b>September 2025 – Present</b></article></div></section>
     <section className="section journey-section" id="journey"><div className="section-kicker">02 / THE TIMELINE</div><div className="section-heading"><h2>The road to<br/><em>insight.</em></h2><p>Each chapter adds a new tool, a new perspective and a stronger foundation.</p></div><div className="timeline">{journey.map((j,i)=><div className="timeline-row" key={j[1]}><div className="timeline-year">{j[0]}</div><div className="timeline-pin"><i/></div><div className="timeline-content"><span>CHAPTER 0{i+1}</span><h3>{j[1]}</h3><p>{j[2]}</p><b>{j[3]}</b></div></div>)}</div></section>
     <section className="section projects-section" id="projects"><div className="section-kicker">03 / SELECTED WORK</div><div className="section-heading"><h2>Projects with<br/><em>purpose.</em></h2><p>Practical demonstrations across healthcare, education and restaurant data. Select a project to see its scope and limitations.</p></div><div className="project-grid">{projects.map((p,i)=><motion.article className={'project-card '+p.tone} key={p.id} whileHover={{y:-8}} transition={{duration:.25}}><div className="project-visual"><span>PROJECT / 0{i+1}</span><div className="visual-glyph">{i===0?'✳':i===1?'▥':'⌘'}</div><small>{p.tag}</small></div><div className="project-info"><div className="project-year">{p.year}</div><h3>{p.title}</h3><p>{p.desc}</p><div className="tag-row">{p.tools.map(t=><span key={t}>{t}</span>)}</div><button onClick={()=>setSelected(p)}>EXPLORE PROJECT <b>↗</b></button></div></motion.article>)}</div></section>
     <section className="section skills-section" id="skills"><div className="section-kicker">04 / THE TOOLKIT</div><div className="section-heading"><h2>Tools for<br/><em>thinking.</em></h2><p>A practical toolkit across data preparation, analysis, visualization and communication.</p></div><div className="skill-grid">{skillGroups.map(([title,...items],i)=><article className="skill-card" key={title}><div className="skill-card-top"><span>0{i+1}</span><h3>{title}</h3></div><div className="skill-list">{items.map(s=><span key={s}>{s}</span>)}</div></article>)}</div><p className="small-note">Skills are listed without invented proficiency percentages.</p></section>
     <section className="section certificate-section" id="certificates"><div className="section-kicker">05 / VERIFIED LEARNING</div><div className="section-heading"><h2>Proof of<br/><em>progress.</em></h2><p>Six certificates from learning platforms and industry programs.</p></div><div className="certificate-list">{certificates.map((c,i)=><article className="certificate-row" key={c[0]}><span className="cert-number">0{i+1}</span><div><h3>{c[0]}</h3><p>{c[1]}</p></div><span className="cert-status">{c[2]}</span>{c[3]?<a href={c[3]} target="_blank" rel="noreferrer">VIEW ↗</a>:<span className="qr-note">QR CODE</span>}</article>)}</div></section>
     <section className="section contact-section" id="contact"><div className="contact-panel"><div className="section-kicker">06 / START A CONVERSATION</div><h2>Let's make data<br/><em>make sense.</em></h2><p>Open to connecting about data analytics, dashboards, reporting and entry-level opportunities.</p><a className="contact-email" href={'mailto:'+EMAIL}>{EMAIL} ↗</a><div className="social-links"><a href="https://www.linkedin.com/in/dhanavel-periyasamy-cse/" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="https://github.com/DhanavelPeriyasamy" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="https://www.instagram.com/itx_dhana_sts/" target="_blank" rel="noreferrer">INSTAGRAM ↗</a><a href="https://x.com/itx_dhana_sts" target="_blank" rel="noreferrer">X / TWITTER ↗</a></div></div></section>
    </main><footer><span>© 2026 DHANAVEL TECH</span><span>BUILT WITH CURIOSITY · POWERED BY DATA</span><button onClick={()=>setStage('profiles')}>SWITCH VIEW ↗</button></footer>
   </motion.div>}
  </AnimatePresence>
  <AnimatePresence>{selected&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.div className="project-modal" initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>✕</button><span className="eyebrow">PROJECT DETAIL / {selected.year}</span><h2>{selected.title}</h2><p>{selected.desc}</p><h3>Scope & notes</h3><ul>{selected.details.map(d=><li key={d}>{d}</li>)}</ul><div className="tag-row">{selected.tools.map(t=><span key={t}>{t}</span>)}</div><a className="primary-btn modal-link" href={selected.url} target="_blank" rel="noreferrer">OPEN GITHUB REPOSITORY ↗</a></motion.div></motion.div>}</AnimatePresence>
  <AnimatePresence>{resume&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setResume(false)}><motion.div className="resume-modal" initial={{y:25,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setResume(false)}>✕</button><span className="eyebrow">THE FULL STORY</span><h2>Resume preview</h2><p>Preview your resume before downloading.</p><div className="resume-preview"><iframe title="Dhanavel Periyasamy resume preview" src="/assets/Dhanavel_Periyasamy_Resume.pdf.pdf#toolbar=0"/></div><a className="primary-btn modal-link" href="/assets/Dhanavel_Periyasamy_Resume.pdf.pdf" download="Dhanavel_Periyasamy_Resume.pdf">DOWNLOAD RESUME ↓</a></motion.div></motion.div>}</AnimatePresence>
 </div>
}
export default App;
