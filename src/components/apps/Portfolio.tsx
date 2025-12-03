'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, Github, Mail, MapPin, Code, Award, Users, 
  Play, Briefcase, GraduationCap, Trophy, Sparkles, ArrowRight,
  Linkedin, Terminal, Zap, Heart, GitBranch, Activity, Star, X,
  Loader2
} from 'lucide-react';
import { projects, Project } from '@/lib/projects';
import { techIcons, skills, getSkillsByCategory } from '@/lib/tech-icons';
import { useDesktop } from '@/context/DesktopContext';

type ActiveTab = 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'contact';

const PROFILE_IMAGE = 'https://avatars.githubusercontent.com/u/95270855?v=4';
const GITHUB_USERNAME = 'Zburgers';

// Glassmorphism Card Component with hover glow effect
const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  glowColor = 'var(--accent)'
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  glowColor?: string;
}) => {
  return (
    <div 
      className={`
        relative rounded-xl border backdrop-blur-sm overflow-hidden
        bg-[var(--surface)]/80 border-[var(--border)]
        ${hover ? 'group transition-all duration-300 hover:border-[var(--accent-border)] hover:shadow-xl hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {/* Glow effect on hover */}
      {hover && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(400px circle at 50% 50%, ${glowColor}, transparent 60%)`,
            opacity: 0.15
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Certification Modal Component
const CertificationModal = ({ cert, onClose }: { cert: { title: string; issuer: string; icon: string; description: string; date?: string; credentialId?: string }; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-sm w-full p-6 relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{cert.icon}</div>
          <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
          <p className="text-sm text-[var(--accent)] font-medium">{cert.issuer}</p>
          {cert.date && <p className="text-xs text-[var(--text-muted)] mb-2">{cert.date}</p>}
          {cert.credentialId && (
            <p className="text-xs text-[var(--text-muted)] mb-3 font-mono bg-[var(--surface-muted)] px-2 py-1 rounded inline-block">
              ID: {cert.credentialId}
            </p>
          )}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">{cert.description}</p>
        </div>
      </div>
    </div>
  );
};

// Animated skill bar component with glow
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
    <div className="flex flex-col gap-1.5 group/skill">
      <div className="flex items-center gap-2">
        <span className="text-sm group-hover/skill:scale-110 transition-transform">{icon}</span>
        <span className="flex-1 text-sm font-medium">{name}</span>
        <span className="text-xs font-semibold text-[var(--accent)]">{proficiency}%</span>
      </div>
      <div className="h-2 bg-[var(--surface-muted)] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{ 
            width: `${width}%`, 
            transitionDelay: `${delay}ms`,
            background: 'linear-gradient(90deg, var(--accent), #a855f7)'
          }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// GitHub Stats with Real API Data
interface GitHubStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  loading: boolean;
  error: boolean;
}

const GitHubStatsCard = ({ username }: { username: string }) => {
  const [stats, setStats] = useState<GitHubStats>({
    publicRepos: 0,
    followers: 0,
    following: 0,
    totalStars: 0,
    loading: true,
    error: false
  });

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        // Fetch user data
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();

        // Fetch repos to calculate stars
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        if (!reposRes.ok) throw new Error('Failed to fetch repos');
        const reposData = await reposRes.json();
        
        const totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);

        setStats({
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          totalStars,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        setStats(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchGitHubStats();
  }, [username]);

  return (
    <GlassCard className="p-6">
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
      
      {/* GitHub Contribution Graph */}
      <div className="mb-4 p-4 bg-[var(--surface-muted)] rounded-xl overflow-hidden">
        <img 
          src={`https://ghchart.rshah.org/3b82f6/${username}`}
          alt="GitHub Contribution Graph"
          className="w-full rounded"
        />
      </div>
      
      {/* Real GitHub Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] transition-all cursor-default">
          <GitBranch size={18} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
          <div>
            {stats.loading ? (
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            ) : (
              <span className="block text-lg font-bold">{stats.error ? '—' : stats.publicRepos}</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">Repositories</span>
          </div>
        </div>
        <div className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] transition-all cursor-default">
          <Star size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
          <div>
            {stats.loading ? (
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            ) : (
              <span className="block text-lg font-bold">{stats.error ? '—' : stats.totalStars}</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">Stars Earned</span>
          </div>
        </div>
        <div className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] transition-all cursor-default">
          <Users size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
          <div>
            {stats.loading ? (
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            ) : (
              <span className="block text-lg font-bold">{stats.error ? '—' : stats.followers}</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">Followers</span>
          </div>
        </div>
        <div className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] transition-all cursor-default">
          <Heart size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
          <div>
            <span className="block text-lg font-bold">YSoC</span>
            <span className="text-xs text-[var(--text-muted)]">Open Source</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// Experience Item Component with enhanced styling
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
    work: 'from-blue-500 to-blue-600',
    education: 'from-purple-500 to-purple-600',
    opensource: 'from-green-500 to-green-600'
  };
  const glowMap = {
    work: 'rgba(59, 130, 246, 0.3)',
    education: 'rgba(168, 85, 247, 0.3)',
    opensource: 'rgba(34, 197, 94, 0.3)'
  };
  const Icon = iconMap[type];
  const gradient = colorMap[type];
  
  return (
    <GlassCard className="p-5" glowColor={glowMap[type]}>
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-[var(--accent)]">{organization}</p>
            </div>
            <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 rounded-full whitespace-nowrap border border-[var(--accent-border)]">{date}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[var(--surface-muted)] rounded-full hover:bg-[var(--accent-soft)] transition-colors">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// Certification data - 5 real certifications from resume
const certifications = [
  {
    title: 'PyTorch and Deep Learning for Decision Makers (LFS116)',
    issuer: 'The Linux Foundation',
    date: 'Dec 2025',
    credentialId: 'LF-d5jzp5xcoc',
    icon: '🔥',
    description: 'Comprehensive PyTorch course covering neural network fundamentals, deep learning architectures, and practical implementation for business decision-making.'
  },
  {
    title: 'Prompt Design in Vertex AI Skill Badge',
    issuer: 'Google Cloud',
    date: 'Dec 2025',
    icon: '☁️',
    description: 'Advanced prompt engineering techniques for Google Cloud\'s Vertex AI, including few-shot learning, chain-of-thought prompting, and model optimization.'
  },
  {
    title: 'Machine Learning with Python',
    issuer: 'freeCodeCamp',
    date: 'Dec 2025',
    credentialId: 'zburgers-mlwp',
    icon: '🤖',
    description: 'Built 5 ML projects including a Neural Network SMS Classifier and a Book Recommendation Engine using KNN algorithms.'
  },
  {
    title: 'Responsible and Safe AI Systems',
    issuer: 'NPTEL',
    date: 'Nov 2025',
    icon: '🛡️',
    description: 'Ethics-focused certification covering AI safety, bias mitigation, responsible deployment, and governance frameworks for artificial intelligence systems.'
  },
  {
    title: 'Blockchain and its Applications',
    issuer: 'NPTEL',
    date: 'Jan 2025',
    icon: '⛓️',
    description: 'Fundamentals of blockchain technology, distributed ledger systems, smart contracts, and real-world applications across industries.'
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
      <GlassCard className="mb-8 p-6" glowColor="rgba(168, 85, 247, 0.3)">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
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
            <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
              Specializing in Artificial Intelligence and Data Science with focus on machine learning, 
              deep learning, and cloud computing. Active participant in research projects and hackathons.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Machine Learning', 'Deep Learning', 'Cloud Computing', 'Data Science', 'Python', 'Research'].map((tag, i) => (
                <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[var(--surface-muted)] rounded-full hover:bg-[var(--accent-soft)] transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Certifications Section */}
      <GlassCard className="p-5" hover={false}>
        <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg">
          <Award size={20} className="text-yellow-500" />
          Certifications
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Click on a certification to view more details
        </p>
        <div className="grid grid-cols-2 gap-4">
          {certifications.map((cert, i) => (
            <button
              key={i}
              onClick={() => setSelectedCert(cert)}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-[var(--surface-muted)] border border-transparent hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] transition-all cursor-pointer text-center relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[var(--accent)]/10 to-purple-500/10" />
              <span className="text-4xl group-hover:scale-125 transition-transform relative z-10">{cert.icon}</span>
              <div className="relative z-10">
                <span className="block text-sm font-semibold line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{cert.title}</span>
                <span className="text-xs text-[var(--text-muted)]">{cert.issuer}</span>
                <span className="text-xs text-[var(--accent)] block mt-1">{cert.date}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>
      
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
            <GlassCard className="p-8" glowColor="rgba(59, 130, 246, 0.2)">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Profile Picture with animated border */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-purple-500 rounded-full animate-pulse opacity-50 blur-md" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 p-1 shadow-xl">
                      <img 
                        src={PROFILE_IMAGE}
                        alt="Nakshatra Kundlas"
                        className="w-full h-full rounded-full object-cover"
                      />
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
            </GlassCard>
            
            {/* Bio Section */}
            <div className="space-y-6">
              <GlassCard className="p-6">
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
              </GlassCard>
              
              {/* Current Focus Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-5" glowColor="rgba(34, 197, 94, 0.2)">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚀</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">GenAI Applications</h4>
                  <p className="text-sm text-[var(--text-muted)]">Building LLM-powered apps with Vertex AI & RAG pipelines</p>
                </GlassCard>
                <GlassCard className="p-5" glowColor="rgba(59, 130, 246, 0.2)">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">☁️</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">Cloud DevOps</h4>
                  <p className="text-sm text-[var(--text-muted)]">GCP, Docker, Kubernetes & CI/CD automation</p>
                </GlassCard>
                <GlassCard className="p-5" glowColor="rgba(168, 85, 247, 0.2)">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💻</div>
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors">Open Source</h4>
                  <p className="text-sm text-[var(--text-muted)]">Active contributor at Youth Season of Code</p>
                </GlassCard>
              </div>
            </div>
            
            {/* GitHub Stats Section */}
            <GitHubStatsCard username={GITHUB_USERNAME} />
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
                <GlassCard
                  key={index} 
                  className={`overflow-hidden ${project.featured ? 'ring-1 ring-[var(--accent-border)]' : ''}`}
                  glowColor={project.featured ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.15)'}
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface-muted)] overflow-hidden">
                    {project.image && (
                      <img 
                        src={project.image} 
                        alt={project.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                        >
                          <Play size={16} />
                          Demo
                        </a>
                      )}
                      <button
                        onClick={() => handleViewCode(project)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/95 text-gray-900 rounded-lg font-medium text-sm hover:bg-white transition-colors shadow-lg"
                      >
                        <Github size={16} />
                        Code
                      </button>
                    </div>
                    {project.featured && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white rounded-full text-xs font-medium shadow-lg">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[var(--surface-muted)] rounded-full hover:bg-[var(--accent-soft)] transition-colors"
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
                </GlassCard>
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
              <GlassCard className="p-5" glowColor="rgba(59, 130, 246, 0.2)">
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
              </GlassCard>
              
              {/* Backend */}
              <GlassCard className="p-5" glowColor="rgba(34, 197, 94, 0.2)">
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
              </GlassCard>
              
              {/* AI/ML */}
              <GlassCard className="p-5" glowColor="rgba(168, 85, 247, 0.2)">
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
              </GlassCard>
              
              {/* DevOps & Cloud */}
              <GlassCard className="p-5" glowColor="rgba(249, 115, 22, 0.2)">
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
              </GlassCard>
              
              {/* Databases */}
              <GlassCard className="p-5" glowColor="rgba(236, 72, 153, 0.2)">
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
              </GlassCard>
              
              {/* Tools */}
              <GlassCard className="p-5" glowColor="rgba(20, 184, 166, 0.2)">
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
              </GlassCard>
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
                title="Research: Perovskite Tandem Solar Cells"
                organization="Shiv Nadar University"
                date="2022 – Present"
                description="Conducting AI-driven research on optimizing Perovskite Tandem solar cell parameters to maximize efficiency. Specializing in data cleaning, feature importance analysis (SHAP), and hyperparameter optimization."
                tags={['Machine Learning', 'SHAP', 'Optimization', 'Solar Cells', 'Python']}
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
                <a href="mailto:nakshatra.kundlas@outlook.com">
                  <GlassCard className="p-4" glowColor="rgba(59, 130, 246, 0.2)">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Mail size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-sm text-[var(--text-secondary)] truncate">nakshatra.kundlas@outlook.com</p>
                      </div>
                      <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </a>
                
                <a href="https://github.com/Zburgers" target="_blank" rel="noopener noreferrer">
                  <GlassCard className="p-4" glowColor="rgba(75, 85, 99, 0.2)">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Github size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">GitHub</h4>
                        <p className="text-sm text-[var(--text-secondary)]">github.com/Zburgers</p>
                      </div>
                      <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </a>
                
                <a href="https://www.linkedin.com/in/nakshatrakundlas/" target="_blank" rel="noopener noreferrer">
                  <GlassCard className="p-4" glowColor="rgba(59, 130, 246, 0.2)">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Linkedin size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">LinkedIn</h4>
                        <p className="text-sm text-[var(--text-secondary)]">linkedin.com/in/nakshatrakundlas</p>
                      </div>
                      <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </a>
                
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                      <MapPin size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-sm text-[var(--text-secondary)]">Delhi NCR / Chennai, India</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              {/* CTA Section */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] via-purple-500 to-purple-600 text-white overflow-hidden shadow-2xl">
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <img 
                      src={PROFILE_IMAGE}
                      alt="Nakshatra Kundlas"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Let's work together!</h3>
                  <p className="text-white/80 mb-4 max-w-md mx-auto">
                    I'm always interested in new opportunities and exciting projects. 
                    Whether you have a project in mind or want to collaborate on open source, 
                    I'd love to hear from you!
                  </p>
                  <a 
                    href="mailto:nakshatra.kundlas@outlook.com?subject=Let's%20Collaborate!"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--accent)] rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Mail size={18} />
                    Send Message
                  </a>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/30 rounded-full" />
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
        className="flex-shrink-0 backdrop-blur-xl border-b"
        style={{ 
          borderColor: 'var(--border)',
          background: 'linear-gradient(to right, rgba(var(--surface-rgb), 0.9), rgba(var(--surface-rgb), 0.95))'
        }}
      >
        <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white shadow-lg' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                }`}
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
