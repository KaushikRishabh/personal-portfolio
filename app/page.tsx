"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { PROJECTS } from "@/lib/data";
import OrbitalExhibit from "@/components/OrbitalExhibit";

const skills = ["Node.js", "TypeScript", "Python", "FastAPI", "React", "PostgreSQL", "Redis", "Docker"];
const projectCopy: Record<string, string> = {
  "Twit-X-Clone": "A social interface experiment built with Next.js and TypeScript.",
  "YouTube Clone React": "Exploring the familiar patterns of a video discovery interface.",
  "Shoply": "An e-commerce store and marketplace for buying and selling products.",
  "Promodoro": "A focused Pomodoro timer for turning intention into progress.",
};
const experience = [
  { date: "2023 — PRESENT", role: "Engineering Lead", company: "Persistent Systems", copy: "Cloud-platform APIs, asynchronous provisioning, and AI-assisted knowledge retrieval. Leading a five-person engineering team." },
  { date: "2022 — 2023", role: "Senior Software Engineer", company: "ContactPoint 360", copy: "Recruitment-platform services, background workers, search performance, and React interfaces." },
  { date: "2018 — 2022", role: "Frontend Engineer", company: "Infogain", copy: "Airline-platform interfaces, reusable React components, and reliable API integrations." },
];
function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <span aria-hidden="true">{diagonal ? "↗" : "↗"}</span>; }
export default function Home() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState("All work");
  const projects = PROJECTS.filter(p => filter === "All work" || (filter === "React" ? p.tags.some(t => t === "React") : p.tags.some(t => t === "Next.js")));
  const reveal = { initial: { opacity: 1, y: reduced ? 0 : 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: reduced ? 0 : .5 } };
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="nav-wrap">
      <a href="#home" className="wordmark" aria-label="Rishabh Kaushik home"><span className="pixel-mark" aria-hidden="true">✦</span> RK<span className="wordmark-sub">/ ENGINEER</span></a>
      <nav aria-label="Main navigation"><a href="#projects">Work</a><a href="#about">About</a><a href="#contact" className="nav-contact">Let’s talk <Arrow /></a></nav>
    </div></header>
    <main id="main">
      <section className="hero shell" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="signal" /> THE PERSONAL OBSERVATORY OF</div>
          <h1>Rishabh<br/><span>Kaushik</span><span className="name-period">.</span></h1>
          <p className="role">Full stack engineer.<br/><span>Curious by design.</span></p>
          <p className="intro">I build the systems behind the screen and the experiences in front of it. From resilient APIs to thoughtful interfaces.</p>
          <div className="hero-actions"><a className="button primary" href="#projects">Explore my work <Arrow /></a><a className="button secondary" href={assetPath("/CV.pdf")} target="_blank" rel="noreferrer">View resume <span aria-hidden="true">↓</span></a></div>
          <div className="hero-meta"><span>BASED IN INDIA</span><span>BUILDING FOR THE WEB</span></div>
        </div>
        <motion.div className="hero-exhibit" initial={false} animate={{ opacity: 1 }} transition={{duration: reduced ? 0 : .7}}>
          <div className="exhibit-label"><span>01 / THE GRAVITY LAB</span><span>INTERACTIVE EXPERIMENT</span></div>
          <OrbitalExhibit />
        </motion.div>
      </section>
      <div className="stack-band"><div className="shell stack-inner"><span className="stack-label">MY EVERYDAY TOOLKIT</span><div>{skills.slice(0,5).map(s => <span key={s}>{s}<i aria-hidden="true">✦</i></span>)}</div></div></div>
      <section className="section shell" id="projects">
        <motion.div {...reveal} className="section-heading"><div><p className="eyebrow">02 / SELECTED TRANSMISSIONS</p><h2>Things I’ve built<span className="amber">.</span></h2></div><p>A few personal projects.<br/>Real code. Always learning.</p></motion.div>
        <div className="project-tools"><div className="filters" role="group" aria-label="Filter projects">{["All work","Next.js","React"].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div><span className="project-count" aria-live="polite">{String(projects.length + (filter === "All work" ? 1 : 0)).padStart(2,"0")} PROJECTS</span></div>
        <div className="project-grid">{filter === "All work" && <motion.article layout={!reduced} className="placeme-card" {...reveal}>
          <div className="placeme-art" role="img" aria-label="Pixel-art preview of a person placed into a mountain landscape">
            <svg viewBox="0 0 500 300" aria-hidden="true" shapeRendering="crispEdges"><rect width="500" height="300" fill="#263a47"/><rect x="0" y="175" width="500" height="125" fill="#667f75"/><path d="M0 190v-30h30v-30h35v-35h40v-30h35v30h35v35h35v30h35v30z" fill="#48656a"/><path d="M200 195v-25h30v-30h35v-35h35V70h35v35h35v35h35v30h45v25z" fill="#80978a"/><path d="M265 105h35V70h35v35h35v20h-35v-10h-35v10h-35z" fill="#ded8bd"/><path d="M0 230h55v-15h60v20h70v-10h70v20h75v-20h80v15h90v60H0z" fill="#3d605c"/><path d="M220 300v-20h20v-25h20v-30h20v-35h15v35h-10v35h-15v40z" fill="#b2b09a"/><rect x="380" y="35" width="42" height="42" fill="#edba70"/><rect x="373" y="43" width="56" height="26" fill="#edba70"/><path d="M35 43h65v6H35zm100 20h40v4h-40zm290 37h45v5h-45z" fill="#abbab0"/><path d="M216 161h16v18h-16z" fill="#ddb18a"/><path d="M210 176h28v39h-28z" fill="#e9b970"/><path d="M204 181h6v29h-6zm34 0h6v29h-6z" fill="#ddb18a"/><path d="M212 215h10v32h-10zm16 0h10v32h-10z" fill="#192b36"/><path d="M207 245h15v6h-15zm21 0h16v6h-16z" fill="#d7d6c6"/><path d="M205 158v-5h29v10h-18v6h-11z" fill="#15262d"/><path d="M185 140h12m-12 0v12m65-12h12m0 0v12m-77 105h12m-12 0v-12m65 12h12m0 0v-12" fill="none" stroke="#edba70" strokeWidth="2"/></svg>
            <span className="placeme-art-label">YOUR PHOTO. A NEW PERSPECTIVE.</span>
          </div>
          <div className="placeme-info"><div className="placeme-top"><span className="eyebrow">IN THE WORKSHOP</span><span className="coming-soon">Coming soon</span></div><h3>PlaceMe<span className="amber">.</span></h3><p>AI-assisted photo compositing that places your own photos into new scenes, with tools for placement and image refinement.</p><div className="tags"><span>AI photo editing</span><span>In development</span></div></div>
        </motion.article>}{projects.map((p,i)=><motion.article layout={!reduced} key={p.id} className="project-card" {...reveal}>
          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="project-image-link" aria-label={`Explore ${p.title} source on GitHub`}><div className={`project-image project-tone-${p.id}`}><div className="mini-window"><div className="window-bar"><i/><i/><i/><span>{p.title.toLowerCase().replaceAll(" ","-")}</span></div><Image src={assetPath(p.image)} alt={`${p.title} interface preview`} width={720} height={420}/></div><span className="project-open"><Arrow /></span></div></a>
          <div className="project-info"><div className="project-title"><span className="project-number">0{i+1}</span><h3><a href={p.githubUrl} target="_blank" rel="noreferrer">{p.title}</a></h3><Arrow /></div><p>{projectCopy[p.title]}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div>
        </motion.article>)}</div>
        <a className="text-link" href="https://github.com/KaushikRishabh" target="_blank" rel="noreferrer">More experiments on GitHub <Arrow /></a>
      </section>
      <section className="about-section" id="about"><div className="shell about-grid"><div><p className="eyebrow">03 / THE ENGINEER BEHIND THE PIXELS</p><h2>Good systems.<br/>Human interfaces.</h2><p className="about-intro">I’m Rishabh, a full stack engineer with 8+ years of experience connecting reliable backend services with clear, usable interfaces.</p><p className="about-detail">My work spans cloud management, recruitment platforms, and AI-assisted knowledge retrieval. I care about clean contracts, thoughtful collaboration, and software that holds up in production.</p><div className="skill-tags">{skills.map(s=><span key={s}>{s}</span>)}</div><a className="text-link" href={assetPath("/CV.pdf")} target="_blank" rel="noreferrer">The full story in my resume <Arrow /></a></div>
      <div className="experience-list">{experience.map(e=><div className="experience" key={e.company}><p className="eyebrow">{e.date}</p><h3>{e.role}</h3><span className="company">{e.company}</span><p>{e.copy}</p></div>)}<div className="education"><span className="eyebrow">FOUNDATIONS</span><p>B.Tech, Computer Science · AKTU<br/><span>IMS Engineering College · 2014–2018</span></p></div></div></div></section>
      <section className="contact-section shell" id="contact"><p className="eyebrow"><span className="signal"/> 04 / OPEN A CHANNEL</p><h2>Have something<br/>in <span>orbit?</span></h2><div className="contact-bottom"><p>A project, an opportunity, or a good conversation.<br/>I’d love to hear what you’re working on.</p><a className="button primary" href="mailto:reachmeatrish@gmail.com">Email me <Arrow /></a></div></section>
    </main>
    <footer className="site-footer shell"><a className="footer-brand" href="#home">RK <span>CRAFTED WITH CURIOSITY.</span></a><div><a href="https://github.com/KaushikRishabh" target="_blank" rel="noreferrer">GitHub <Arrow/></a><a href="https://linkedin.com/in/rishabh-kaushik-4206531b8/" target="_blank" rel="noreferrer">LinkedIn <Arrow/></a><a href={assetPath("/CV.pdf")} target="_blank" rel="noreferrer">Resume <Arrow/></a></div><span className="footer-note">© {new Date().getFullYear()} RISHABH KAUSHIK</span></footer>
  </>;
}
