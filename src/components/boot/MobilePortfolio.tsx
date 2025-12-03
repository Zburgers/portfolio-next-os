'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  FileText, 
  Mail, 
  Linkedin, 
  MapPin, 
  Code2, 
  Brain, 
  Rocket,
  ExternalLink,
  Terminal,
  Cpu,
  ChevronRight
} from 'lucide-react';

export default function MobilePortfolio() {
  const quickLinks = [
    {
      icon: FileText,
      label: 'Resume',
      href: '/resume.pdf',
      color: '#3b82f6',
      description: 'Download my CV'
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/Zburgers',
      color: '#171515',
      description: '@Zburgers'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/nakshatra-kundlas',
      color: '#0077b5',
      description: 'Connect with me'
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:nakshatra.kundlas@outlook.com',
      color: '#ea4335',
      description: 'Get in touch'
    },
  ];

  const skills = [
    { icon: '⚛️', name: 'React/Next.js' },
    { icon: '🐍', name: 'Python' },
    { icon: '🤖', name: 'AI/ML' },
    { icon: '☁️', name: 'Cloud' },
    { icon: '🔥', name: 'PyTorch' },
    { icon: '🗄️', name: 'Databases' },
  ];

  const projects = [
    { name: 'Health Track AI', tag: 'Healthcare AI', emoji: '🏥' },
    { name: 'Waste Wise', tag: '🏆 Winner', emoji: '♻️' },
    { name: 'Sentient AI', tag: 'Cybersecurity', emoji: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Terminal Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-cyan-500/20"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm text-cyan-400">mobile_kernel</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-green-400">online</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-8">
        {/* Boot Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs text-cyan-500/70 space-y-1"
        >
          <p>[<span className="text-green-400">OK</span>] Mobile kernel loaded</p>
          <p>[<span className="text-green-400">OK</span>] Rendering optimized view</p>
          <p className="text-cyan-400">→ Desktop OS available on larger screens</p>
        </motion.div>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
          
          <div className="relative bg-[#12121a] border border-cyan-500/30 rounded-xl p-5 space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-[#12121a] flex items-center justify-center text-2xl font-bold text-cyan-400">
                    NK
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#12121a]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nakshatra Kundlas</h1>
                <p className="text-cyan-400 font-mono text-sm flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  AI/Full-Stack Developer
                </p>
              </div>
            </div>

            {/* Location Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-cyan-500" />
              <span>Delhi NCR / Chennai, India</span>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-300 leading-relaxed">
              B.Tech AI & Data Science @ Shiv Nadar University (2026). 
              Building intelligent systems with <span className="text-cyan-400">Python</span>, 
              <span className="text-purple-400"> AI/ML</span>, and 
              <span className="text-blue-400"> modern web tech</span>. 
              Open-source contributor.
            </p>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <motion.span
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-1"
                >
                  <span>{skill.icon}</span>
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h2 className="font-mono text-xs text-cyan-500 uppercase tracking-wider flex items-center gap-2">
            <span className="text-green-400">$</span> quick_access
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 p-3 bg-[#12121a] border border-gray-800 hover:border-cyan-500/50 rounded-lg transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${link.color}20` }}
                >
                  <link.icon className="w-5 h-5" style={{ color: link.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{link.label}</p>
                  <p className="text-xs text-gray-500 truncate">{link.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Featured Projects */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <h2 className="font-mono text-xs text-cyan-500 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" /> featured_projects
          </h2>
          
          <div className="space-y-2">
            {projects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-[#12121a] border border-gray-800 rounded-lg"
              >
                <span className="text-2xl">{project.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.tag}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Desktop Hint */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-6 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <Rocket className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300">Full desktop experience available</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Visit on a larger screen for the immersive Fedora OS simulation
          </p>
        </motion.section>

        {/* Focus Areas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <h2 className="font-mono text-xs text-cyan-500 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" /> current_focus
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧠</span>
                <h3 className="text-sm font-medium text-white">AI/ML Research</h3>
              </div>
              <p className="text-xs text-gray-400">Neural networks, NLP, and computer vision applications</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌐</span>
                <h3 className="text-sm font-medium text-white">Full-Stack Development</h3>
              </div>
              <p className="text-xs text-gray-400">Next.js, FastAPI, cloud-native architectures</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🐧</span>
                <h3 className="text-sm font-medium text-white">Open Source</h3>
              </div>
              <p className="text-xs text-gray-400">Youth Season of Code contributor, Linux enthusiast</p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="px-4 py-6 border-t border-gray-800/50"
      >
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500 font-mono">
            <span className="text-cyan-500">nakshatra@portfolio</span>:<span className="text-purple-400">~</span>$ _
          </p>
          <p className="text-xs text-gray-600">
            © 2025 Nakshatra Kundlas. Built with Next.js
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
