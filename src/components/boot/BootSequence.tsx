'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSystemBoot } from '@/context/SystemBootContext';
import MobilePortfolio from './MobilePortfolio';
import GrubBootloader from './GrubBootloader';
import LoginScreen from './LoginScreen';

interface BootSequenceProps {
  children: React.ReactNode; // The Desktop component
}

export default function BootSequence({ children }: BootSequenceProps) {
  const { phase, deviceType } = useSystemBoot();
  const isBooting = phase === 'GRUB' || phase === 'KERNEL_BOOT';

  // If mobile, show mobile portfolio
  if (deviceType === 'mobile') {
    return <MobilePortfolio />;
  }

  return (
    <AnimatePresence mode="wait">
      {isBooting && (
        <motion.div
          key="boot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GrubBootloader />
        </motion.div>
      )}

      {phase === 'LOGIN' && (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <LoginScreen />
        </motion.div>
      )}

      {phase === 'DESKTOP' && (
        <motion.div
          key="desktop"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
