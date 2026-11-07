import streamlit as st
from pathlib import Path

st.set_page_config(page_title="Dhanavel Tech | Data Analyst", page_icon="📊", layout="wide")
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Manrope:wght@600;700;800&display=swap');
.stApp{background:#f5f8fd;color:#10233f}
h1,h2,h3{font-family:Manrope,sans-serif;color:#10233f}
.hero{padding:2.5rem;border-radius:24px;background:linear-gradient(120deg,#0c1b32,#123b70 65%,#1769e0);color:white}
.hero h1{color:white;font-size:3.3rem}.hero p{color:#dceaff;font-size:1.1rem}
div[data-testid="stMetric"]{background:white;padding:1rem;border:1px solid #e5ebf4;border-radius:16px}
</style>
""", unsafe_allow_html=True)

EMAIL="dhanavelperiyasamy.cse@gmail.com"
GITHUB="https://github.com/DhanavelPeriyasamy"
LINKEDIN="https://www.linkedin.com/in/dhanavel-periyasamy-cse/"
pages=["Home","About","Experience","Skills","Projects","Certificates","Resume","Contact"]
page=st.sidebar.radio("DHANAVEL TECH",pages)
st.sidebar.caption("Data • Analytics • Business Insights")

projects=[
("Hospital Analytics Dashboard","Microsoft Power BI","June 2025 – Present","https://github.com/DhanavelPeriyasamy/hospital-analytics-dashboard","Healthcare operations analytics: encounter volume, patient flow, department workload, length of stay and discharge turnaround. Uses synthetic data; generated readmission flag is illustrative, not a validated 30-day measure. No occupancy KPI is claimed without daily census data."),
("Student Performance Tracking System","Microsoft Excel","October 2025 – Present","https://github.com/DhanavelPeriyasamy/student-performance-analytics","Academic performance, attendance, subject comparisons and term trends. Uses fictional student data; support indicators are review prompts, not predictive labels."),
("Restaurant Management Database","MySQL","May 2025 – October 2025","https://github.com/DhanavelPeriyasamy/restaurant-management-analytics","Restaurant orders, customers, menu items and sales analysis. Estimated contribution is not audited profit and excludes several operating costs.")
]
certs=[
("Full Stack Web Development","Infosys Springboard",None),
("Back-End Apps with Node.js & Express","IBM / Coursera","https://www.coursera.org/account/accomplishments/verify/7R3MBQTQWBH5"),
("Introduction to Front-End Development","Meta / Coursera","https://www.coursera.org/account/accomplishments/verify/STCEHNTRJXDR"),
("Python (Basics)","HackerRank","https://www.hackerrank.com/certificates/860558505fb0"),
("SQL (Advanced)","HackerRank","https://www.hackerrank.com/certificates/81325ecadf8b"),
("Problem Solving (Intermediate)","HackerRank","https://www.hackerrank.com/certificates/0d78613826c4")
]
if page=="Home":
    st.markdown('<div class="hero"><p>ASPIRING DATA ANALYST</p><h1>Dhanavel Periyasamy</h1><p>SQL · Python · Excel · Power BI</p><p>Turning data into clear insights and practical business decisions.</p></div>',unsafe_allow_html=True)
    st.write("")
    st.write("Hello! I’m Dhanavel, a Computer Science and Engineering graduate interested in data analytics, business reporting and dashboard development.")
    a,b,c,d=st.columns(4)
    a.metric("Featured projects","3"); b.metric("Certificates","6"); c.metric("Experience","Jan–Oct 2026"); d.metric("Degree","B.E. CSE")
    st.info("Featured project datasets are synthetic demonstrations. See each project page for data scope and limitations.")
elif page=="About":
    st.title("About me")
    st.write("Detail-oriented aspiring Data Analyst skilled in SQL, Python, Excel and BI tools. Interested in data cleaning, exploratory analysis, dashboard reporting and data-driven decisions.")
    st.subheader("Education")
    st.markdown("**B.E. Computer Science and Engineering** — Karpagam Institute of Technology, Anna University · 2021–2025 · CGPA 8.0 · Coimbatore\n\n**HSC** — Government Higher Secondary School · 2020–2021 · 86.13%\n\n**SSLC** — Government Higher Secondary School · 2018–2019 · 83%")
    st.subheader("Languages"); st.write("Tamil · English")
elif page=="Experience":
    st.title("Experience & learning")
    st.subheader("Business Analyst — Tea Party")
    st.caption("January–October 2026 · Pochampalli, Krishnagiri, Tamil Nadu · Team-based")
    st.write("- Sales and revenue analysis\n- Inventory and stock monitoring\n- Food cost and profit margin analysis\n- Employee attendance and salary analysis\n- Excel reports and dashboards")
    st.write("**Tools:** Microsoft Excel, Advanced Excel (Pivot Tables, formulas, charts), Power BI, POS/Billing software.")
    st.write("**Contributions:** Helped improve sales-reporting accuracy, reduce inventory wastage and identify high- and low-performing products. No unsupported numerical impact claims are used.")
    st.divider(); st.subheader("Data Analytics Training — Besant Technologies")
    st.caption("September 2025–Present · Velachery · In progress")
    st.write("Advanced Excel · SQL · Python · Power BI · Statistics · Data Cleaning")
elif page=="Skills":
    st.title("Skills")
    for heading,items in {"Data Analytics":["Data Cleaning & Preparation","Exploratory Data Analysis","Basic Statistics","Business Insights","Data Visualization","Data Modeling"],"Programming & databases":["Python","Pandas","NumPy","Matplotlib","MySQL (Joins & Subqueries)","MongoDB basics"],"BI & tools":["Microsoft Excel","Advanced Excel","Power BI","Tableau","Git","VS Code"],"Web technologies":["HTML","CSS","JavaScript"],"Professional skills":["Attention to detail","Communication","Adaptability","Team collaboration","Documentation and report writing"]}.items():
        st.subheader(heading); st.write(" · ".join(items))
    st.caption("Proficiency percentages are omitted because verified skill ratings were not supplied.")
elif page=="Projects":
    st.title("Featured projects")
    for name,tool,period,url,desc in projects:
        with st.expander(f"{name} · {tool}",expanded=True):
            st.caption(period); st.write(desc); st.link_button("Open GitHub repository",url)
    st.warning("Live dashboard embeds are not configured yet. Add approved Power BI publish/embed URLs to enable embedded reports.")
elif page=="Certificates":
    st.title("Certificates & achievements")
    for name,issuer,url in certs:
        with st.container(border=True):
            st.subheader(name); st.caption(issuer)
            if url: st.link_button("View certificate",url)
            else: st.info("QR-code certificate. Add a scanned certificate or QR verification destination when available.")
elif page=="Resume":
    st.title("Resume")
    resume=Path("assets/Dhanavel_Periyasamy_Resume.pdf")
    if resume.exists():
        st.pdf(str(resume))
        with open(resume,"rb") as f: st.download_button("Download resume PDF",f,file_name="Dhanavel_Periyasamy_Resume.pdf")
    else:
        st.warning("Resume PDF asset is not in this repository yet. Upload assets/Dhanavel_Periyasamy_Resume.pdf to enable preview and download.")
elif page=="Contact":
    st.title("Let’s connect")
    st.markdown(f"**Email:** [{EMAIL}](mailto:{EMAIL})  \n**LinkedIn:** [Profile]({LINKEDIN})  \n**GitHub:** [DhanavelPeriyasamy]({GITHUB})  \n**Instagram:** [@itx_dhana_sts](https://www.instagram.com/itx_dhana_sts/)  \n**X:** [@itx_dhana_sts](https://x.com/itx_dhana_sts)")
    st.info("Phone number is intended to be shown only to approved, verified visitors after registration in the production version.")
    st.subheader("Send a message")
    st.caption("This starter form is a preview only; secure database storage and email notification need backend configuration.")
    with st.form("contact"):
        subject=st.text_input("Subject"); message=st.text_area("Message")
        sent=st.form_submit_button("Submit")
    if sent:
        if subject.strip() and message.strip(): st.success("Form preview received. Connect the secure backend to store and notify about messages.")
        else: st.error("Please enter both subject and message.")
st.sidebar.divider()
st.sidebar.markdown(f"[GitHub]({GITHUB}) · [LinkedIn]({LINKEDIN})")
st.sidebar.caption("© 2026 Dhanavel Tech")
