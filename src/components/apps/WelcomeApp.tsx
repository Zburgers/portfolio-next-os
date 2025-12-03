'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktop } from '@/context/DesktopContext';
import { useSystemBoot } from '@/context/SystemBootContext';
import { 
  X, 
  FileText, 
  FolderOpen, 
  Mail, 
  Github,
  ExternalLink,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

const TYPING_MESSAGES = [
  'Initializing portfolio...',
  'Kernel stable.',
  'Welcome to my digital workspace!',
  '',
  'I built this OS simulation because I live in Fedora every day.',
  'Let me show you around. 🐧',
];

export default function WelcomeApp() {
  const { openWindow } = useDesktop();
  const { skipWelcome, setSkipWelcome } = useSystemBoot();
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(skipWelcome);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  // Handle checkbox change - save immediately to localStorage
  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
    setSkipWelcome(checked);
  };

  // Typing animation
  useEffect(() => {
    if (typingIndex >= TYPING_MESSAGES.length) {
      setIsTypingComplete(true);
      return;
    }

    const message = TYPING_MESSAGES[typingIndex];
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex <= message.length) {
        setCurrentText(message.slice(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeChar, 30 + Math.random() * 20);
      } else {
        // Move to next message after a pause
        setTimeout(() => {
          setTypingIndex(prev => prev + 1);
          setCurrentText('');
        }, message === '' ? 200 : 600);
      }
    };

    typingRef.current = setTimeout(typeChar, 300);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [typingIndex]);

  // Handle close
  const handleClose = () => {
    if (dontShowAgain !== skipWelcome) {
      setSkipWelcome(dontShowAgain);
    }
    // Find and close the welcome window
    // The parent will handle this via the window close button
  };

  // Quick action handlers
  const handleViewResume = () => {
    window.open('https://drive.google.com/file/d/1UkBat3vlJJeys3ORS0yB0dwuxvnS7-oO/view?usp=drive_link', '_blank');
  };

  const handleViewProjects = () => {
    openWindow('portfolio', 'Portfolio');
  };

  const handleContact = () => {
    window.open('mailto:nakshatra.kundlas@outlook.com?subject=Hello from Portfolio OS!', '_blank');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div 
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ 
          background: 'var(--surface-muted)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <span className="text-lg">🐧</span>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Welcome to Portfolio OS
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Fedora Linux 40 • Workstation Edition
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Two Column Layout */}
          <div className="flex gap-6">
            {/* Left Column - Profile Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                {/* Large Avatar with Profile Picture */}
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1 shadow-xl">
                  <img 
                    src="https://avatars.githubusercontent.com/u/95270855?v=4"
                    alt="Nakshatra Kundlas"
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                
                {/* Fedora Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-4"
                  style={{ borderColor: 'var(--surface)' }}
                >
                  <span className="text-2xl">🎩</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <div className="flex-1 min-w-0">
              {/* Name & Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Nakshatra Kundlas
                </h1>
                <p className="text-sm" style={{ color: 'var(--accent)' }}>
                  AI/Full-Stack Developer • Open Source Enthusiast
                </p>
              </motion.div>

              {/* TuxBot Terminal */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg overflow-hidden shadow-lg mb-4"
                style={{ 
                  background: '#1a1b26',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono flex-1 text-center">
                    tuxbot@portfolio ~ 
                  </span>
                  <span className="text-lg">🐧</span>
                </div>

                {/* Terminal Content */}
                <div className="p-4 font-mono text-sm min-h-[120px]">
                  {/* Completed messages */}
                  {TYPING_MESSAGES.slice(0, typingIndex).map((msg, i) => (
                    <div key={i} className={`${msg === '' ? 'h-2' : ''}`}>
                      {msg && (
                        <span className={
                          i === 0 ? 'text-cyan-400' :
                          i === 1 ? 'text-green-400' :
                          'text-gray-300'
                        }>
                          {i < 2 && <span className="text-gray-500">$ </span>}
                          {msg}
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {/* Currently typing message */}
                  {typingIndex < TYPING_MESSAGES.length && (
                    <div>
                      {typingIndex < 2 && <span className="text-gray-500">$ </span>}
                      <span className={
                        typingIndex === 0 ? 'text-cyan-400' :
                        typingIndex === 1 ? 'text-green-400' :
                        'text-gray-300'
                      }>
                        {currentText}
                      </span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-gray-400 ml-0.5 align-middle"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <AnimatePresence>
                {isTypingComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap gap-2"
                  >
                    <button
                      onClick={handleViewResume}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: 'var(--accent)',
                        color: 'white'
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={handleViewProjects}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: 'var(--surface-muted)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <Briefcase className="w-4 h-4" />
                      See Projects
                    </button>

                    <button
                      onClick={handleContact}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: 'var(--surface-muted)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Contact Me
                    </button>

                    <a
                      href="https://github.com/Zburgers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: 'var(--surface-muted)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-4 rounded-lg"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)'
            }}
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span>💡</span> Quick Tips
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Click <strong>Portfolio</strong> in the dock to explore my projects and skills</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Open <strong>Terminal</strong> and try commands like <code className="px-1 py-0.5 rounded bg-gray-200/20 text-xs">help</code> or <code className="px-1 py-0.5 rounded bg-gray-200/20 text-xs">projects</code></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Check <strong>Files</strong> to find my resume in the Documents folder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Drag windows, minimize, maximize - it's a real desktop!</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Footer with Don't Show Again */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ 
          borderColor: 'var(--border)',
          background: 'var(--surface-muted)'
        }}
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't show this again
          </span>
        </label>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Press any key or close this window to continue
        </p>
      </div>
    </div>
  );
}
