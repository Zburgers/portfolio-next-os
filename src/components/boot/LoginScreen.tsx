'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSystemBoot } from '@/context/SystemBootContext';
import { Lock, ChevronRight, Shield } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useSystemBoot();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle login
  const handleLogin = useCallback(() => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    
    // Simulate login delay
    setTimeout(() => {
      login();
    }, 800);
  }, [login, isLoggingIn]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoggingIn) {
        handleLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLogin, isLoggingIn]);

  // Show password field after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setShowPassword(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `
          linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)),
          radial-gradient(circle at 20% 80%, rgba(48, 103, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #0a1628 0%, #1a1f35 50%, #0f172a 100%)
        `,
      }}
    >
      {/* Blur overlay to simulate desktop blur */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Time Display */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-light text-white tracking-tight mb-2">
            {time}
          </h1>
          <p className="text-xl text-gray-300 font-light">
            {date}
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <motion.button
            onClick={handleLogin}
            disabled={isLoggingIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group cursor-pointer focus:outline-none mb-6"
          >
            {/* Avatar Ring with Glow */}
            <div className={`
              relative w-32 h-32 rounded-full 
              ${isLoggingIn ? 'animate-pulse' : ''}
            `}>
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-60 blur-md group-hover:opacity-80 transition-opacity" />
              
              {/* Border ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1">
                {/* Inner avatar */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden border-2 border-white/10">
                  {/* Profile Image or Initials */}
                  <span className="text-5xl font-bold bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    NK
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-3 border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          </motion.button>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-semibold text-white mb-1">
              Nakshatra Kundlas
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Administrator</span>
            </div>
          </motion.div>

          {/* Password Field (Non-interactive) */}
          {showPassword && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-72"
            >
              <div 
                onClick={handleLogin}
                className={`
                  relative flex items-center gap-3 px-4 py-3 
                  bg-white/10 backdrop-blur-sm
                  border border-white/20 rounded-full
                  cursor-pointer group
                  hover:bg-white/15 hover:border-white/30
                  transition-all duration-200
                  ${isLoggingIn ? 'pointer-events-none' : ''}
                `}
              >
                <Lock className="w-5 h-5 text-gray-400" />
                <div className="flex-1 flex items-center">
                  {isLoggingIn ? (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    />
                  ) : (
                    <>
                      <span className="text-gray-400 text-sm">Press Enter or click to login</span>
                    </>
                  )}
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-gray-400 group-hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Login Progress */}
              {isLoggingIn && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-cyan-400 mt-3"
                >
                  Authenticating...
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Portfolio OS • Fedora Linux 40 Workstation
          </p>
        </motion.div>
      </div>

      {/* Animated particles/stars in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
