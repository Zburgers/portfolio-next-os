'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Download, Github, Linkedin, Mail, MapPin, TerminalSquare } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { profile } from '@/lib/profile';
import { projects, type Project } from '@/lib/projects';

type PortfolioTab = 'overview' | 'work' | 'focus' | 'background' | 'contact';

const tabs: { id: PortfolioTab; label: string }[] = [
  { id: 'overview', label: 'Profile' },
  { id: 'work', label: 'Selected work' },
  { id: 'focus', label: 'Toolbox' },
  { id: 'background', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

function ProjectCard({ project, index, onBrowse }: {
  project: Project;
  index: number;
  onBrowse: (project: Project) => void;
}) {
  return (
    <article className={`portfolio-project-card${project.image ? ' has-image' : ''}`}>
      {project.image && (
        <div className="portfolio-project-image">
          <img src={project.image} alt={project.imageAlt ?? `${project.name} project preview`} loading="lazy" />
          <span>{project.imageSource ?? 'PROJECT PREVIEW'}</span>
        </div>
      )}
      <div className="portfolio-project-card-copy">
        <div className="portfolio-project-heading">
          <span className="portfolio-project-index">{String(index + 1).padStart(2, '0')}</span>
          <p className="portfolio-project-category">{project.category}</p>
        </div>
        <h3>{project.name}</h3>
        <p className="portfolio-project-description">{project.description}</p>
        <ul className="portfolio-tech-list" aria-label={`${project.name} technologies`}>
          {project.techStack.map((tech) => <li key={tech}>{tech}</li>)}
        </ul>
        <div className="portfolio-project-actions">
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">Repository <ArrowUpRight size={14} aria-hidden="true" /></a>}
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live site <ArrowUpRight size={14} aria-hidden="true" /></a>}
          {project.githubUrl && <button type="button" onClick={() => onBrowse(project)}>Browse source <TerminalSquare size={14} aria-hidden="true" /></button>}
          {!project.githubUrl && <span className="portfolio-project-private">Self-hosted · no public repo</span>}
        </div>
      </div>
    </article>
  );
}

export default function Portfolio({ initialTab = 'overview' }: { initialTab?: PortfolioTab }) {
  const { openWindow } = useDesktop();
  const [activeTab, setActiveTab] = useState<PortfolioTab>(initialTab);

  useEffect(() => setActiveTab(initialTab), [initialTab]);

  const browseProject = (project: Project) => {
    if (!project.githubUrl) return;
    openWindow('code-editor', `${project.name} · Source`, {
      githubUrl: project.githubUrl,
      projectName: project.name,
    });
  };

  const renderWork = (items: Project[] = projects) => (
    <div className="portfolio-project-grid">
      {items.map((project, index) => <ProjectCard key={project.name} project={project} index={index} onBrowse={browseProject} />)}
    </div>
  );

  return (
    <div className="portfolio-app">
      <nav className="portfolio-nav" aria-label="Portfolio sections">
        <span className="portfolio-wordmark">NK<span>.</span></span>
        <div className="portfolio-tabs" role="tablist" aria-label="Profile pages" onKeyDown={(event) => {
          const current = tabs.findIndex((tab) => tab.id === activeTab);
          const key = event.key;
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
          event.preventDefault();
          const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (current + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          const target = tabs[next];
          setActiveTab(target.id);
          document.getElementById(`portfolio-tab-${target.id}`)?.focus();
        }}>
          {tabs.map((tab) => (
            <button key={tab.id} id={`portfolio-tab-${tab.id}`} role="tab" aria-controls="portfolio-panel" aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} type="button" className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        <a className="portfolio-nav-resume" href={profile.resumeUrl} target="_blank" rel="noreferrer">
          Résumé <Download size={14} aria-hidden="true" />
        </a>
      </nav>

      <main id="portfolio-panel" role="tabpanel" aria-labelledby={`portfolio-tab-${activeTab}`} tabIndex={0} className="portfolio-content">
        {activeTab === 'overview' && (
          <>
            <section className="portfolio-overview">
              <div className="portfolio-overview-copy">
                <p className="portfolio-eyebrow">{profile.title} <span>·</span> {profile.location}</p>
                <h1>The work lives<br />past <em>the demo.</em></h1>
                <p className="portfolio-lede">{profile.summary}</p>
                <div className="portfolio-hero-actions">
                  <button type="button" onClick={() => setActiveTab('work')}>Explore selected work <ArrowRight size={16} aria-hidden="true" /></button>
                  <a href={`mailto:${profile.email}`}>Start a conversation <ArrowUpRight size={15} aria-hidden="true" /></a>
                </div>
              </div>
              <aside className="portfolio-overview-aside">
                <div className="portfolio-profile-stamp"><span>PROFILE FILE</span><span>NK / 26</span></div>
                <div className="portfolio-overview-identity">
                  <img src={profile.avatarUrl} alt="" />
                  <div><p className="portfolio-aside-name">{profile.name}</p><p className="portfolio-aside-location"><MapPin size={13} aria-hidden="true" /> {profile.location}</p></div>
                </div>
                <div className="portfolio-focus-summary"><span>Current assignment</span><p>{profile.experience[0].organization} · {profile.experience[0].role}</p></div>
                <button className="portfolio-aside-terminal" type="button" onClick={() => openWindow('terminal', 'Terminal')}><TerminalSquare size={14} /> Open terminal <span>↵</span></button>
              </aside>
            </section>
            <section className="portfolio-section-block">
              <div className="portfolio-section-heading">
                <div><p className="portfolio-eyebrow">Field notes / 01</p><h2>Selected work</h2></div>
                <button type="button" onClick={() => setActiveTab('work')}>All projects <ArrowRight size={15} aria-hidden="true" /></button>
              </div>
              {renderWork(projects.filter((project) => project.image).slice(0, 3))}
            </section>
          </>
        )}

        {activeTab === 'work' && (
          <section className="portfolio-section-block portfolio-work-page">
            <div className="portfolio-section-heading portfolio-section-heading-start">
              <div><p className="portfolio-eyebrow">Field notes / 02</p><h1>Selected work</h1></div>
              <p className="portfolio-section-intro">Real screens from public repositories, with the systems behind them.</p>
            </div>
            {renderWork()}
          </section>
        )}

        {activeTab === 'focus' && (
          <section className="portfolio-split-page">
            <div>
              <p className="portfolio-eyebrow">Toolbox / 03</p>
              <h1>Choose the tool that fits the constraint.</h1>
              <p className="portfolio-lede">My work crosses product engineering, production operations, local-first software, and applied machine learning.</p>
            </div>
            <div className="portfolio-capability-list">
              {profile.capabilities.map((item, index) => (
                <article key={item.area}><span>0{index + 1}</span><div><h2>{item.area}</h2><p>{item.tools}</p></div></article>
              ))}
              <div className="portfolio-focus-list">
                {profile.focus.map((item, index) => <article key={item}><span>FOCUS / 0{index + 1}</span><h2>{item}</h2></article>)}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'background' && (
          <section className="portfolio-experience-page">
            <header className="portfolio-experience-intro">
              <p className="portfolio-eyebrow">Experience / 04</p>
              <h1>Production work, open source, and the systems around them.</h1>
              <p className="portfolio-lede">A few lines from the current résumé, translated into a readable timeline.</p>
            </header>
            <div className="portfolio-experience-list">
              {profile.experience.map((role, index) => (
                <article key={role.organization} className="portfolio-experience-item">
                  <span className="portfolio-experience-index">0{index + 1}</span>
                  <div className="portfolio-experience-meta"><span>{role.period}</span><span>{role.type}</span></div>
                  <div><p className="portfolio-eyebrow">{role.organization}</p><h2>{role.role}</h2><p>{role.summary}</p></div>
                </article>
              ))}
            </div>
            <footer className="portfolio-education">
              <span>Education · {profile.education.years}</span>
              <div><h2>{profile.education.degree}</h2><p>{profile.education.institution}</p></div>
            </footer>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="portfolio-split-page portfolio-contact-page">
            <div>
              <p className="portfolio-eyebrow">Contact / 05</p>
              <h1>Have a good problem to solve?</h1>
              <p className="portfolio-lede">Email is the best way to reach me. I’m also on GitHub, LinkedIn, and X.</p>
              <a className="portfolio-contact-primary" href={`mailto:${profile.email}`}><Mail size={16} aria-hidden="true" /> {profile.email} <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <nav className="portfolio-contact-links" aria-label="Contact links">
              <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={18} /> GitHub <ArrowUpRight size={15} /></a>
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn <ArrowUpRight size={15} /></a>
              <a href={profile.xUrl} target="_blank" rel="noreferrer"><span className="portfolio-x-mark">X</span> X <ArrowUpRight size={15} /></a>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer"><Download size={18} /> Résumé <ArrowUpRight size={15} /></a>
            </nav>
          </section>
        )}
      </main>
      <footer className="portfolio-footer"><span>{profile.name}</span><span>© 2026 / PROFILE SHELL</span></footer>
    </div>
  );
}
