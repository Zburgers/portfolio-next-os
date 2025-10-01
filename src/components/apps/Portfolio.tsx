'use client';

import React, { useState } from 'react';
import { ExternalLink, Github, Mail, MapPin, Calendar, Code, Award, Users, Play, Star } from 'lucide-react';
import { projects, Project } from '@/lib/projects';
import { techIcons } from '@/lib/tech-icons';
import { useDesktop } from '@/context/DesktopContext';

type ActiveTab = 'about' | 'projects' | 'skills' | 'experience' | 'contact';

export default function Portfolio() {
  const { openWindow } = useDesktop();
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');

  const handleViewCode = (project: Project) => {
    openWindow('code-editor', `${project.name} - Code`, { 
      githubUrl: project.githubUrl,
      projectName: project.name
    });
  };

  const tabs = [
    { id: 'about' as ActiveTab, label: 'About', icon: Users },
    { id: 'projects' as ActiveTab, label: 'Projects', icon: Code },
    { id: 'skills' as ActiveTab, label: 'Skills', icon: Award },
    { id: 'experience' as ActiveTab, label: 'Experience', icon: Calendar },
    { id: 'contact' as ActiveTab, label: 'Contact', icon: Mail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-xl">
            <h1>About Me</h1>
            
            {/* Two-column layout - responsive */}
            <div className="about-grid">
              {/* Left: Professional Avatar */}
              <div>
                <div style={{
                  width: '160px',
                  height: '160px',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  border: '2px solid var(--border-color)'
                }}>
                  YI
                </div>
              </div>
              
              {/* Right: Biography */}
              <div className="space-y-lg">
                <div>
                  <h2 style={{ marginBottom: 'var(--space-sm)' }}>[YOUR_NAME]</h2>
                  <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Full Stack Developer
                  </p>
                </div>
                
                <div className="space-y-md">
                  <p>
                    Hi! I'm [YOUR_NAME], a passionate full-stack developer with over [X] years of 
                    experience building web applications and digital solutions.
                  </p>
                  <p>
                    I specialize in modern JavaScript frameworks like React and Vue.js, and have extensive 
                    experience with backend technologies including Node.js and Python. I love creating 
                    efficient, scalable, and user-friendly applications.
                  </p>
                  <p>
                    When I'm not coding, you can find me exploring new technologies, contributing to open-source 
                    projects, or sharing knowledge with the developer community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-xl">
            <h1>Projects</h1>
            
            {/* Single-column project list */}
            <div className="space-y-lg">
              {projects.map((project, index) => (
                <div key={index} className="card card-hover">
                  <div className="project-grid">
                    {/* Left: Project Thumbnail */}
                    <div style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--surface-muted)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)'
                    }}>
                      {project.image && (
                        <img 
                          src={project.image} 
                          alt={project.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    
                    {/* Right: Project Content */}
                    <div className="space-y-md">
                      {/* Header with title and status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3>{project.name}</h3>
                        <span className="tag" style={{ 
                          backgroundColor: project.featured ? 'var(--accent-soft)' : 'var(--surface-muted)',
                          color: project.featured ? 'var(--accent)' : 'var(--text-muted)',
                          borderColor: project.featured ? 'var(--accent-border)' : 'var(--border-color)'
                        }}>
                          {project.featured ? '⭐ Featured' : 'Completed'}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p>{project.description}</p>
                      
                      {/* Tech Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                        {project.techStack.map((tech, techIndex) => (
                          <span key={techIndex} className="tag">
                            {techIcons[tech] && <span style={{ marginRight: 'var(--space-xs)' }}>{techIcons[tech]}</span>}
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            <Play size={16} />
                            Live Demo
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleViewCode(project)}
                          className="btn btn-secondary"
                        >
                          <Github size={16} />
                          View Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-xl">
            <h1>Skills & Technologies</h1>
            
            {/* Categorized Skills Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
              {/* Frontend */}
              <div className="card">
                <h3 style={{ color: 'var(--accent)', marginBottom: 'var(--space-md)' }}>Frontend</h3>
                <div className="space-y-sm">
                  {['React / Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js', 'JavaScript'].map((skill) => (
                    <div key={skill} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-xs) 0'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>{techIcons[skill] || '🔧'}</span>
                      <span className="text-secondary">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Backend */}
              <div className="card">
                <h3 style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }}>Backend</h3>
                <div className="space-y-sm">
                  {['Node.js', 'Express', 'Python', 'REST APIs'].map((skill) => (
                    <div key={skill} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-xs) 0'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>{techIcons[skill] || '⚙️'}</span>
                      <span className="text-secondary">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tools */}
              <div className="card">
                <h3 style={{ color: 'var(--warning)', marginBottom: 'var(--space-md)' }}>Tools</h3>
                <div className="space-y-sm">
                  {['Git', 'Docker', 'Figma', 'VS Code'].map((skill) => (
                    <div key={skill} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-xs) 0'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>{techIcons[skill] || '🛠️'}</span>
                      <span className="text-secondary">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Databases */}
              <div className="card">
                <h3 style={{ color: '#8b5cf6', marginBottom: 'var(--space-md)' }}>Databases</h3>
                <div className="space-y-sm">
                  {['MongoDB', 'PostgreSQL', 'Firebase'].map((skill) => (
                    <div key={skill} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-sm)',
                      padding: 'var(--space-xs) 0'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>{techIcons[skill] || '🗄️'}</span>
                      <span className="text-secondary">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-xl">
            <h1>Experience</h1>
            
            <div className="space-y-lg">
              {/* Senior Full Stack Developer */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--space-xs)' }}>Senior Full Stack Developer</h3>
                    <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-medium)' }}>Tech Company</p>
                  </div>
                  <span className="tag">2022 - Present</span>
                </div>
                
                <p style={{ marginBottom: 'var(--space-md)' }}>
                  Leading development of scalable web applications, mentoring junior developers, 
                  and implementing best practices for code quality and performance.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                  {['Team Leadership', 'Architecture', 'Mentoring', 'Performance'].map((skill) => (
                    <span key={skill} className="tag" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Full Stack Developer */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--space-xs)' }}>Full Stack Developer</h3>
                    <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-medium)' }}>Startup Inc</p>
                  </div>
                  <span className="tag">2020 - 2022</span>
                </div>
                
                <p style={{ marginBottom: 'var(--space-md)' }}>
                  Developed and maintained multiple client projects using React, Node.js, and modern web technologies.
                  Collaborated with design teams to implement pixel-perfect UIs.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                  {['React', 'Node.js', 'UI/UX', 'Client Relations'].map((skill) => (
                    <span key={skill} className="tag" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Frontend Developer */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--space-xs)' }}>Frontend Developer</h3>
                    <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-medium)' }}>Digital Agency</p>
                  </div>
                  <span className="tag">2019 - 2020</span>
                </div>
                
                <p style={{ marginBottom: 'var(--space-md)' }}>
                  Built responsive websites and web applications for various clients, 
                  focusing on performance optimization and user experience.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                  {['HTML/CSS', 'JavaScript', 'Performance', 'Responsive'].map((skill) => (
                    <span key={skill} className="tag" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-xl">
            <h1>Get In Touch</h1>
            
            <div className="contact-grid">
              {/* Left: Contact Methods */}
              <div className="space-y-md">
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--accent-soft)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Mail size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h4>Email</h4>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Let's discuss your project</p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-medium)' }}>
                    your.email@example.com
                  </p>
                </div>
                
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--accent-soft)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Github size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h4>GitHub</h4>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Check out my repositories</p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--accent)', fontWeight: 'var(--font-weight-medium)' }}>
                    github.com/yourusername
                  </p>
                </div>
                
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--accent-soft)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h4>Location</h4>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Available for remote work</p>
                    </div>
                  </div>
                  <p className="text-secondary">Your City, Country</p>
                </div>
              </div>
              
              {/* Right: Contact Form */}
              <div className="card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Let's work together!</h3>
                <p style={{ marginBottom: 'var(--space-xl)' }}>
                  I'm always interested in new opportunities and exciting projects. 
                  Whether you have a project in mind or want to collaborate, I'd love to hear from you!
                </p>
                
                <div className="space-y-md">
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Mail size={16} />
                    Send Message
                  </button>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      LinkedIn
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      Twitter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      backgroundColor: 'var(--surface)', 
      color: 'var(--text-primary)', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Navigation Tabs */}
      <div style={{ 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--surface)', 
        padding: 'var(--space-md) var(--space-lg)' 
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)'
                }}
                className={!isActive ? 'hover:bg-surface-hover hover:text-primary' : ''}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: 'var(--space-xl)' 
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
}