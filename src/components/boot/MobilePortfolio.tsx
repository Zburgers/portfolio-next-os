'use client';

import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { profile } from '@/lib/profile';
import { projects } from '@/lib/projects';

export default function MobilePortfolio() {
  return (
    <div className="mobile-page">
      <header className="mobile-header">
        <a className="mobile-wordmark" href="#top" aria-label={`${profile.name}, home`}>NK<span>.</span></a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top" className="mobile-main">
        <section className="mobile-hero">
          <p className="mobile-eyebrow">{profile.title}<span> · </span><MapPin size={13} aria-hidden="true" />{profile.location}</p>
          <div className="mobile-identity">
            <img src={profile.avatarUrl} alt="" width="64" height="64" />
            <span>{profile.name}</span>
          </div>
          <h1>Build the parts<br /><em>that keep working.</em></h1>
          <p className="mobile-summary">{profile.summary}</p>
          <p className="mobile-current-role"><span aria-hidden="true" /> {profile.experience[0].role} · {profile.experience[0].organization}</p>
          <div className="mobile-hero-actions">
            <a className="mobile-primary" href="#work">Explore selected work <ArrowDown size={16} aria-hidden="true" /></a>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </section>

        <section id="work" className="mobile-section">
          <div className="mobile-section-heading"><p>01 / Selected work</p><h2>Built to be useful.</h2></div>
          <div className="mobile-project-list">
            {projects.map((project, index) => (
              <article className="mobile-project" key={project.name}>
                <div className="mobile-project-top"><span>0{index + 1}</span><span>{project.category}</span></div>
                {project.image && <img className="mobile-project-image" src={project.image} alt={project.imageAlt ?? `${project.name} project preview`} loading="lazy" />}
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <ul aria-label={`${project.name} technologies`}>
                  {project.techStack.map((tech) => <li key={tech}>{tech}</li>)}
                </ul>
                <div className="mobile-project-links">
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} aria-hidden="true" /></a>}
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live site <ArrowUpRight size={14} aria-hidden="true" /></a>}
                  {!project.githubUrl && <span>Self-hosted · no public repo</span>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mobile-section mobile-about">
          <div className="mobile-section-heading"><p>02 / Current interests</p><h2>Curious about the details.</h2></div>
          <p className="mobile-about-copy">I work across application engineering, production operations, local-first software, and applied machine learning.</p>
          <div className="mobile-experience-list">
            {profile.experience.map((role) => (
              <article key={role.organization}>
                <p>{role.period} · {role.type}</p>
                <h3>{role.role}</h3>
                <span>{role.organization}</span>
                <p>{role.summary}</p>
              </article>
            ))}
          </div>
          <ul className="mobile-focus-list">
            {profile.focus.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}
          </ul>
          <div className="mobile-education">
            <p>Education · {profile.education.years}</p>
            <h3>{profile.education.degree}</h3>
            <span>{profile.education.institution}</span>
          </div>
        </section>

        <section id="contact" className="mobile-section mobile-contact">
          <div className="mobile-section-heading"><p>03 / Contact</p><h2>Let’s talk.</h2></div>
          <p>Have a thoughtful project or a hard engineering problem? Email is the best way to reach me.</p>
          <a className="mobile-email" href={`mailto:${profile.email}`}><Mail size={17} aria-hidden="true" />{profile.email}<ArrowUpRight size={15} aria-hidden="true" /></a>
          <nav aria-label="Social profiles">
            <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={16} aria-hidden="true" /> GitHub</a>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={16} aria-hidden="true" /> LinkedIn</a>
            <a href={profile.xUrl} target="_blank" rel="noreferrer">X <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
        </section>
      </main>

      <footer className="mobile-footer"><span>{profile.name}</span><span>© 2026</span></footer>
    </div>
  );
}
