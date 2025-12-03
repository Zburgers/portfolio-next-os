'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, Github, Mail, MapPin, Code, Award, Users, 
  Play, Briefcase, GraduationCap, Trophy, Sparkles, ArrowRight,
  Linkedin, Terminal, Zap, Heart, GitBranch, Activity, Star, X
} from 'lucide-react';
import { projects, Project } from '@/lib/projects';
import { techIcons, skills, getSkillsByCategory } from '@/lib/tech-icons';
import { useDesktop } from '@/context/DesktopContext';

type ActiveTab = 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'contact';

// Certification Modal Component
const CertificationModal = ({ cert, onClose }: { cert: { title: string; issuer: string; icon: string; description: string }; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl max-w-sm w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-5xl mb-4">{cert.icon}</div>
          <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
          <p className="text-sm text-[var(--accent)] mb-4">{cert.issuer}</p>
          <p className="text-sm text-[var(--text-secondary)]">{cert.description}</p>
        </div>
      </div>
    </div>
  );
};

// Animated skill bar component
const SkillBar = ({ name, icon, proficiency, delay = 0 }: { 
  name: string; 
  icon: string; 
  proficiency: number;
  delay?: number;
}) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(proficiency), delay);
    return () => clearTimeout(timer);
  }, [proficiency, delay]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="flex-1 text-sm font-medium">{name}</span>
        <span className="text-xs font-semibold text-[var(--accent)]">{proficiency}%</span>
      </div>
      <div className="h-2 bg-[var(--surface-muted)] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${width}%`, 
            transitionDelay: `${delay}ms`,
            background: 'linear-gradient(90deg, var(--accent), #a855f7)'
          }}
        />
      </div>
    </div>
  );
};

// GitHub Stats Card Component
const GitHubStatsCard = ({ username }: { username: string }) => {
  return (
    <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-semibold">
          <Github size={20} className="text-[var(--accent)]" />
          <h3>GitHub Activity</h3>
        </div>
        <a 
          href={`https://github.com/${username}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
        >
          @{username} <ExternalLink size={14} />
        </a>
      </div>
      
      {/* GitHub Contribution Graph - Using GitHub's public embed */}
      <div className="mb-4 p-4 bg-[var(--surface-muted)] rounded-lg overflow-hidden">
        {/* TODO: Replace with actual GitHub contribution graph widget or API integration */}
        <img 
          src={`https://ghchart.rshah.org/3067ff/${username}`}
          alt="GitHub Contribution Graph"
          className="w-full rounded"
        />
      </div>
      
      {/* GitHub Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-muted)]">
          <GitBranch size={18} className="text-[var(--accent)]" />
          <div>
            <span className="block text-lg font-bold">50+</span>
            <span className="text-xs text-[var(--text-muted)]">Repositories</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-muted)]">
          <Star size={18} className="text-yellow-500" />
          <div>
            <span className="block text-lg font-bold">100+</span>
            <span className="text-xs text-[var(--text-muted)]">Stars Earned</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-muted)]">
          <Activity size={18} className="text-green-500" />
          <div>
            <span className="block text-lg font-bold">500+</span>
            <span className="text-xs text-[var(--text-muted)]">Contributions</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-muted)]">
          <Heart size={18} className="text-red-500" />
          <div>
            <span className="block text-lg font-bold">YSoC</span>
            <span className="text-xs text-[var(--text-muted)]">Open Source</span>
          </div>
        </div>
      </div>
      
      {/* TODO: Add real-time GitHub API integration for accurate stats */}
      {/* Requires GITHUB_TOKEN in environment variables */}
    </div>
  );
};

// Experience Item Component
const ExperienceItem = ({ 
  title, 
  organization, 
  date, 
  description, 
  tags,
  type 
}: {
  title: string;
  organization: string;
  date: string;
  description: string;
  tags: string[];
  type: 'work' | 'education' | 'opensource';
}) => {
  const iconMap = {
    work: Briefcase,
    education: GraduationCap,
    opensource: Github
  };
  const colorMap = {
    work: 'text-blue-500',
    education: 'text-purple-500',
    opensource: 'text-green-500'
  };
  const Icon = iconMap[type];
  const color = colorMap[type];
  
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] hover:shadow-lg transition-all">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--surface-muted)] flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{organization}</p>
          </div>
          <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full whitespace-nowrap">{date}</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 text-xs font-medium bg-[var(--surface-muted)] rounded">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Certification data
const certifications = [
  {
    title: 'Machine Learning with Python',
    issuer: 'freeCodeCamp',
    icon: '🎓',
    description: 'Comprehensive course covering machine learning algorithms, data preprocessing, model training, and evaluation using Python and scikit-learn.'
  },
  {
    title: 'Deep Learning for Decision Makers',
    issuer: 'Linux Foundation',
    icon: '🧠',
    description: 'Strategic overview of deep learning concepts, neural network architectures, and practical applications for business decision-making.'
  },
  {
    title: 'Prompt Design in Vertex AI',
    issuer: 'Google Cloud',
    icon: '☁️',
    description: 'Advanced prompt engineering techniques for Google Cloud\'s Vertex AI, including few-shot learning, chain-of-thought, and model fine-tuning.'
  },
  {
    title: 'Introduction to Cloud Computing',
    issuer: 'IBM',
    icon: '💻',
    description: 'Fundamentals of cloud computing including IaaS, PaaS, SaaS models, and cloud architecture patterns.'
  },
  {
    title: 'Python for Data Science',
    issuer: 'Coursera',
    icon: '🐍',
    description: 'Data manipulation with pandas, visualization with matplotlib, and statistical analysis using Python.'
  },
  {
    title: 'Git & GitHub Essentials',
    issuer: 'LinkedIn Learning',
    icon: '📚',
    description: 'Version control fundamentals, branching strategies, pull requests, and collaborative development workflows.'
  }
];

// Education Tab Component
const EducationTab = () => {
  const [selectedCert, setSelectedCert] = useState<typeof certifications[0] | null>(null);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
          <GraduationCap size={28} className="text-[var(--accent)]" />
          Education
        </h1>
        <p className="text-[var(--text-secondary)]">
          Academic background and professional certifications
        </p>
      </div>
      
      {/* B.Tech Card */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface)] border border-[var(--accent-border)] shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={32} />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div>
                <h2 className="text-xl font-bold">B.Tech in AI & Data Science</h2>
                <p className="text-[var(--accent)] font-medium">Shiv Nadar University, Chennai</p>
              </div>
              <span className="text-sm font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 rounded-full whitespace-nowrap border border-[var(--accent-border)]">
                2022 – 2026
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Specializing in Artificial Intelligence and Data Science with focus on machine learning, 
              deep learning, and cloud computing. Active participant in research projects and hackathons.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Machine Learning', 'Deep Learning', 'Cloud Computing', 'Data Science', 'Python', 'Research'].map((tag, i) => (
                <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[var(--surface-muted)] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Certifications Section */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg">
          <Award size={20} className="text-yellow-500" />
          Certifications
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Click on a certification to view more details
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {certifications.map((cert, i) => (
            <button
              key={i}
              onClick={() => setSelectedCert(cert)}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent-border)] border border-transparent transition-all cursor-pointer text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cert.icon}</span>
              <div>
                <span className="block text-sm font-medium line-clamp-2 group-hover:text-[var(--accent)]">{cert.title}</span>
                <span className="text-xs text-[var(--text-muted)]">{cert.issuer}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Certification Modal */}
      {selectedCert && (
        <CertificationModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};

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
    { id: 'experience' as ActiveTab, label: 'Experience', icon: Briefcase },
    { id: 'education' as ActiveTab, label: 'Education', icon: GraduationCap },
    { id: 'contact' as ActiveTab, label: 'Contact', icon: Mail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section with gradient */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] to-transparent border border-[var(--border)]">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar with animated border */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      NK
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                    <Sparkles size={12} />
                    <span>Open to Work</span>
                  </div>
                </div>
                
                {/* Name and Title */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent)] bg-clip-text text-transparent">
                    Nakshatra Kundlas
                  </h1>
                  <p className="flex items-center justify-center md:justify-start gap-2 text-lg text-[var(--text-secondary)] mb-2">
                    <Zap size={16} className="text-yellow-500" />
                    AI Engineer & Full Stack Developer
                  </p>
                  <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--text-muted)]">
                    <MapPin size={14} />
                    Delhi NCR / Chennai, India
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bio Section */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--accent)] font-semibold mb-4">
                  <Terminal size={18} />
                  <span>About Me</span>
                </div>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    I am a final-year B.Tech student in <strong className="text-[var(--text-primary)]">Artificial Intelligence & Data Science</strong> at 
                    Shiv Nadar University, Chennai. My journey started early—I was the kid taking apart computers 
                    just to see how they worked (and occasionally putting them back together).
                  </p>
                  <p>
                    Today, I bridge the gap between complex AI research and scalable web applications. 
                    I specialize in building generative AI solutions, deploying cloud-native architectures, 
                    and contributing to the open-source community.
                  </p>
                </div>
              </div>
              
              {/* Current Focus Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-all hover:shadow-lg group">
                  <div className="text-3xl mb-3">🚀</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">GenAI Applications</h4>
                  <p className="text-sm text-[var(--text-muted)]">Building LLM-powered apps with Vertex AI & RAG pipelines</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-all hover:shadow-lg group">
                  <div className="text-3xl mb-3">☁️</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">Cloud DevOps</h4>
                  <p className="text-sm text-[var(--text-muted)]">GCP, Docker, Kubernetes & CI/CD automation</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-all hover:shadow-lg group">
                  <div className="text-3xl mb-3">💻</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">Open Source</h4>
                  <p className="text-sm text-[var(--text-muted)]">Active contributor at Youth Season of Code</p>
                </div>
              </div>
            </div>
            
            {/* GitHub Stats Section */}
            <GitHubStatsCard username="Zburgers" />
          </div>
        );

      case 'projects':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
                <Code size={28} className="text-[var(--accent)]" />
                Featured Projects
              </h1>
              <p className="text-[var(--text-secondary)]">
                A showcase of AI, full-stack, and open-source work
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div 
                  key={index} 
                  className={`group rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    project.featured 
                      ? 'border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface)]' 
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface-muted)] overflow-hidden">
                    {project.image && (
                      <img 
                        src={project.image} 
                        alt={project.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors"
                        >
                          <Play size={16} />
                          Demo
                        </a>
                      )}
                      <button
                        onClick={() => handleViewCode(project)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-900 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                      >
                        <Github size={16} />
                        Code
                      </button>
                    </div>
                    {project.featured && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white rounded-full text-xs font-medium shadow-lg">
                        <Trophy size={12} />
                        {project.status || 'Featured'}
                      </div>
                    )}
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 4).map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[var(--surface-muted)] rounded-full"
                        >
                          {techIcons[tech] && <span>{techIcons[tech]}</span>}
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)] rounded-full">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
                <Award size={28} className="text-[var(--accent)]" />
                Skills & Technologies
              </h1>
              <p className="text-[var(--text-secondary)]">
                My technical toolkit across the full stack
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">⚛️</span>
                  <h3 className="font-semibold text-lg">Frontend</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('frontend').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100}
                    />
                  ))}
                </div>
              </div>
              
              {/* Backend */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">🔧</span>
                  <h3 className="font-semibold text-lg">Backend</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('backend').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100 + 200}
                    />
                  ))}
                </div>
              </div>
              
              {/* AI/ML - Custom section */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">🤖</span>
                  <h3 className="font-semibold text-lg">AI / Machine Learning</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('ai-ml').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100 + 400}
                    />
                  ))}
                </div>
              </div>
              
              {/* DevOps & Cloud */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">☁️</span>
                  <h3 className="font-semibold text-lg">DevOps & Cloud</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('cloud').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100 + 600}
                    />
                  ))}
                </div>
              </div>
              
              {/* Databases */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">🗄️</span>
                  <h3 className="font-semibold text-lg">Databases</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('database').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100 + 800}
                    />
                  ))}
                </div>
              </div>
              
              {/* Tools */}
              <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                  <span className="text-2xl">🛠️</span>
                  <h3 className="font-semibold text-lg">Tools & Others</h3>
                </div>
                <div className="space-y-4">
                  {getSkillsByCategory('tools').map((skill, i) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                      delay={i * 100 + 1000}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
                <Briefcase size={28} className="text-[var(--accent)]" />
                Work Experience
              </h1>
              <p className="text-[var(--text-secondary)]">
                My professional journey in tech and open source
              </p>
            </div>
            
            <div className="space-y-4">
              <ExperienceItem 
                type="opensource"
                title="Open Source Developer"
                organization="Youth Season of Code"
                date="2025 – Present"
                description="Selected for a global 6-month open-source program. Actively maintaining repositories, managing CI/CD lifecycles with GitHub Actions, and resolving issues on PyPI packages."
                tags={['Open Source', 'GitHub Actions', 'CI/CD', 'Python']}
              />
              
              <ExperienceItem 
                type="work"
                title="Software Engineering Fellow"
                organization="Hewlett Packard Enterprise (via Forage)"
                date="Nov 2025"
                description="Architected a RESTful web service using Java Spring Boot to manage employee data. Implemented unit testing protocols to validate application performance and logic."
                tags={['Java', 'Spring Boot', 'REST APIs', 'Unit Testing']}
              />
              
              <ExperienceItem 
                type="work"
                title="AI & DevOps Researcher"
                organization="Shiv Nadar University"
                date="2022 – Present"
                description="Conducting research on novel solar cells using AI modeling (Perovskite Tandem). Specializing in data cleaning, feature importance analysis (SHAP), and model optimization."
                tags={['Machine Learning', 'SHAP', 'Research', 'Python']}
              />
            </div>
          </div>
        );

      case 'education':
        return <EducationTab />;

      case 'contact':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2">
                <Mail size={28} className="text-[var(--accent)]" />
                Get In Touch
              </h1>
              <p className="text-[var(--text-secondary)]">
                Let's build something amazing together
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="mailto:nakshatra.kundlas@outlook.com" 
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] hover:shadow-lg transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Mail size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-sm text-[var(--text-secondary)] truncate">nakshatra.kundlas@outlook.com</p>
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                </a>
                
                <a 
                  href="https://github.com/Zburgers" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] hover:shadow-lg transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <Github size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">GitHub</h4>
                    <p className="text-sm text-[var(--text-secondary)]">github.com/Zburgers</p>
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/nakshatrakundlas/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-border)] hover:shadow-lg transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Linkedin size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">LinkedIn</h4>
                    <p className="text-sm text-[var(--text-secondary)]">linkedin.com/in/nakshatrakundlas</p>
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                </a>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">Location</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Delhi NCR / Chennai, India</p>
                  </div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white overflow-hidden">
                <div className="relative z-10 text-center">
                  <Sparkles size={32} className="mx-auto mb-3 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">Let's work together!</h3>
                  <p className="text-white/80 mb-4 max-w-md mx-auto">
                    I'm always interested in new opportunities and exciting projects. 
                    Whether you have a project in mind or want to collaborate on open source, 
                    I'd love to hear from you!
                  </p>
                  <a 
                    href="mailto:nakshatra.kundlas@outlook.com?subject=Let's%20Collaborate!"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--accent)] rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    <Mail size={18} />
                    Send Message
                  </a>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
    >
      {/* Navigation Tabs */}
      <nav 
        className="flex-shrink-0 backdrop-blur-sm"
        style={{ 
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(252, 253, 255, 0.5)'
        }}
      >
        <div className="flex items-center gap-1 px-4 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={isActive ? {
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                } : {
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {renderTabContent()}
      </main>
    </div>
  );
}