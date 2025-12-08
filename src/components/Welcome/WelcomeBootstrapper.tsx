'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktop } from '@/context/DesktopContext';
import { useSystemBoot } from '@/context/SystemBootContext';
import ReactiveTux from '@/components/Agents/ReactiveTux';
import { 
  FileText, 
  Mail, 
  Github,
  ExternalLink,
  Terminal as TerminalIcon,
  Sparkles
} from 'lucide-react';

// Typewriter content
const GREETING_LINES = [
  { text: "Hey there! 👋", delay: 0 },
  { text: "I'm Nakshatra — I build things with AI.", delay: 1200 },
  { text: "Welcome to my desktop. Feel free to explore!", delay: 2800 },
];

export default function WelcomeBootstrapper() {
  const { openWindow } = useDesktop();
  const { skipWelcome, setSkipWelcome } = useSystemBoot();
  
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(skipWelcome);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tuxMood, setTuxMood] = useState<'idle' | 'processing' | 'success'>('processing');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for Tux eye tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Typewriter effect
  useEffect(() => {
    if (currentLine >= GREETING_LINES.length) {
      setIsTyping(false);
      setTuxMood('success');
      setTimeout(() => {
        setShowContent(true);
        setTuxMood('idle');
      }, 400);
      return;
    }

    const line = GREETING_LINES[currentLine];
    let charIndex = 0;
    setDisplayedText('');

    const startTyping = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < line.text.length) {
          setDisplayedText(line.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setCurrentLine(prev => prev + 1);
          }, 800);
        }
      }, 40);

      return () => clearInterval(typeInterval);
    }, currentLine === 0 ? 500 : 200);

    return () => clearTimeout(startTyping);
  }, [currentLine]);

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
    setSkipWelcome(checked);
  };

  // Action handlers
  const handleViewResume = () => {
    window.open('https://drive.google.com/file/d/1UkBat3vlJJeys3ORS0yB0dwuxvnS7-oO/view?usp=drive_link', '_blank');
  };

  const handleViewProjects = () => {
    openWindow('portfolio', 'Portfolio');
  };

  const handleContact = () => {
    window.open('mailto:nakshatra.kundlas@outlook.com?subject=Hello from Portfolio OS!', '_blank');
  };

  const handleOpenGithub = () => {
    window.open('https://github.com/Zburgers', '_blank');
  };

  const handleOpenTerminal = () => {
    openWindow('terminal', 'Terminal');
  };

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col select-none overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a1b26 0%, #24283b 50%, #1a1b26 100%)' }}
    >
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, #7aa2f7 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '-10%',
            left: '-10%',
          }}
          animate={{ 
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute w-80 h-80 rounded-full opacity-15"
          style={{ 
            background: 'radial-gradient(circle, #bb9af7 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '10%',
            right: '-5%',
          }}
          animate={{ 
            x: [30, -30, 30],
            y: [20, -20, 20],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-xl w-full">
          {/* Profile Card */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Avatar with Tux */}
            <div className="relative inline-block mb-6">
              {/* Profile Image */}
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              >
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1 shadow-2xl shadow-blue-500/25">
                  <img 
                    src="https://avatars.githubusercontent.com/u/95270855?v=4"
                    alt="Nakshatra Kundlas"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Status indicator */}
                <motion.div 
                  className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#1a1b26]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Tux positioned to the side */}
              <motion.div
                className="absolute -right-16 -bottom-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ReactiveTux 
                  mode={tuxMood}
                  mousePos={mousePos}
                  size={60}
                />
              </motion.div>
            </div>

            {/* Name */}
            <motion.h1 
              className="text-3xl font-bold mb-2 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Nakshatra Kundlas
            </motion.h1>
            
            <motion.p 
              className="text-sm text-[#7aa2f7] mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI/Full-Stack Developer • Open Source Enthusiast
            </motion.p>

            {/* Typewriter Speech Bubble */}
            <motion.div
              className="relative mx-auto max-w-md mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div 
                className="px-6 py-4 rounded-2xl backdrop-blur-xl relative min-h-[80px] flex items-center justify-center"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Typewriter content */}
                <div className="text-center space-y-1">
                  {isTyping ? (
                    <>
                      {/* Show completed lines faded */}
                      {GREETING_LINES.slice(0, currentLine).map((line, i) => (
                        <motion.p 
                          key={i}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 0.4 }}
                          className="text-sm text-gray-400"
                        >
                          {line.text}
                        </motion.p>
                      ))}
                      
                      {/* Current typing line */}
                      <p className="text-lg text-white font-medium">
                        {displayedText}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-0.5 h-5 bg-[#7aa2f7] ml-1 align-middle"
                        />
                      </p>
                    </>
                  ) : (
                    /* Final state - show all lines with last one prominent */
                    <>
                      {GREETING_LINES.slice(0, -1).map((line, i) => (
                        <motion.p 
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          className="text-sm text-gray-400"
                        >
                          {line.text}
                        </motion.p>
                      ))}
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg text-white font-medium"
                      >
                        {GREETING_LINES[GREETING_LINES.length - 1].text}
                      </motion.p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Primary CTA */}
                  <motion.button
                    onClick={handleViewProjects}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(122, 162, 247, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-white font-medium transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #7aa2f7 0%, #bb9af7 100%)',
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Explore My Work
                  </motion.button>

                  {/* Secondary Actions */}
                  <div className="flex justify-center gap-3 flex-wrap">
                    <motion.button
                      onClick={handleViewResume}
                      whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-300"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      Resume
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </motion.button>

                    <motion.button
                      onClick={handleOpenGithub}
                      whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-300"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </motion.button>

                    <motion.button
                      onClick={handleContact}
                      whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-300"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </motion.button>

                    <motion.button
                      onClick={handleOpenTerminal}
                      whileHover={{ scale: 1.05, background: 'rgba(122,162,247,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#7aa2f7]"
                      style={{
                        background: 'rgba(122,162,247,0.1)',
                        border: '1px solid rgba(122,162,247,0.3)',
                      }}
                    >
                      <TerminalIcon className="w-4 h-4" />
                      Terminal
                    </motion.button>
                  </div>

                  {/* Hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-gray-500 pt-2"
                  >
                    Pro tip: Try the Terminal — type <code className="px-1.5 py-0.5 rounded bg-gray-800 text-[#7aa2f7] font-mono">help</code> to see what I can do
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div 
        className="flex items-center justify-between px-6 py-4 relative z-10"
        style={{ 
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded accent-[#7aa2f7] bg-gray-800 border-gray-600"
          />
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Don't show this again
          </span>
        </label>

        <p className="text-xs text-gray-500">
          Close this window anytime to explore the desktop
        </p>
      </motion.div>
    </div>
  );
}
