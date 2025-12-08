'use client';

import React, { useMemo } from 'react';
import { motion, Variants, useAnimation } from 'framer-motion';
import type { TerminalStatus } from '@/hooks/useTerminal';

export interface TuxAgentProps {
  mode: TerminalStatus;
  mousePos?: { x: number; y: number };
  className?: string;
  size?: number;
}

// Calculate eye position based on mouse position
function calculateEyeOffset(
  mousePos: { x: number; y: number } | undefined,
  elementCenter: { x: number; y: number },
  maxOffset: number = 3
): { x: number; y: number } {
  if (!mousePos) return { x: 0, y: 0 };
  
  const dx = mousePos.x - elementCenter.x;
  const dy = mousePos.y - elementCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return { x: 0, y: 0 };
  
  const clampedDistance = Math.min(distance, 200);
  const normalizedDistance = clampedDistance / 200;
  
  return {
    x: (dx / distance) * maxOffset * normalizedDistance,
    y: (dy / distance) * maxOffset * normalizedDistance,
  };
}

// Animation variants for different states
const bodyVariants: Variants = {
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  processing: {
    y: [0, -1, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  error: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  success: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  panic: {
    x: [-4, 4, -4, 4, -2, 2, 0],
    rotate: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const eyeVariants: Variants = {
  idle: {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.15,
      repeat: Infinity,
      repeatDelay: 4,
      ease: 'easeInOut',
    },
  },
  processing: {
    scaleY: 1,
  },
  error: {
    scaleY: 1.2,
  },
  success: {
    scaleY: [1, 0.3, 1],
    transition: {
      duration: 0.3,
    },
  },
  panic: {
    scaleY: 1.4,
    scaleX: 1.2,
  },
};

export default function ReactiveTux({ 
  mode = 'idle', 
  mousePos, 
  className = '',
  size = 96,
}: TuxAgentProps) {
  // Calculate eye offset based on mouse position
  const eyeOffset = useMemo(() => {
    // Assuming the component is roughly centered in its container
    const center = { x: size / 2, y: size / 2 };
    return calculateEyeOffset(mousePos, center, 2);
  }, [mousePos, size]);

  // Get mood indicator color
  const getMoodColor = () => {
    switch (mode) {
      case 'error':
      case 'panic':
        return '#f7768e';
      case 'success':
        return '#9ece6a';
      case 'processing':
        return '#7aa2f7';
      default:
        return 'rgba(0,0,0,0)'; // Use rgba instead of 'transparent'
    }
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial="idle"
      animate={mode}
    >
      {/* Mood indicator glow */}
      {mode !== 'idle' && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          initial={{ opacity: 0 }}
          animate={{
            backgroundColor: getMoodColor(),
            opacity: 0.3,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg"
        variants={bodyVariants}
      >
        {/* Background circle for glow effect */}
        <defs>
          <radialGradient id="tuxGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={getMoodColor()} stopOpacity="0.3" />
            <stop offset="100%" stopColor={getMoodColor()} stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Body - Main penguin shape */}
        <motion.g filter="url(#softShadow)">
          {/* Body outline */}
          <motion.ellipse
            cx="50"
            cy="60"
            rx="28"
            ry="32"
            fill="#1a1b26"
            stroke="#3b3f5c"
            strokeWidth="1"
          />
          
          {/* White belly */}
          <motion.ellipse
            cx="50"
            cy="62"
            rx="18"
            ry="24"
            fill="#f5f5f5"
          />
          
          {/* Left wing */}
          <motion.path
            d="M 22 50 Q 15 60 20 75 Q 25 80 28 70 Q 30 60 26 50 Z"
            fill="#1a1b26"
            animate={mode === 'success' ? { rotate: [0, -15, 0] } : { rotate: 0 }}
            style={{ transformOrigin: '28px 60px' }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Right wing */}
          <motion.path
            d="M 78 50 Q 85 60 80 75 Q 75 80 72 70 Q 70 60 74 50 Z"
            fill="#1a1b26"
            animate={mode === 'success' ? { rotate: [0, 15, 0] } : { rotate: 0 }}
            style={{ transformOrigin: '72px 60px' }}
            transition={{ duration: 0.4 }}
          />
        </motion.g>

        {/* Head */}
        <motion.g>
          {/* Head circle */}
          <motion.circle
            cx="50"
            cy="32"
            r="22"
            fill="#1a1b26"
          />
          
          {/* Face patch */}
          <motion.ellipse
            cx="50"
            cy="35"
            rx="16"
            ry="14"
            fill="#f5f5f5"
          />
          
          {/* Left eye white */}
          <motion.ellipse
            cx="42"
            cy="32"
            rx="6"
            ry="7"
            fill="white"
            variants={eyeVariants}
          />
          
          {/* Right eye white */}
          <motion.ellipse
            cx="58"
            cy="32"
            rx="6"
            ry="7"
            fill="white"
            variants={eyeVariants}
          />
          
          {/* Left pupil - follows mouse */}
          <motion.circle
            cx={42 + eyeOffset.x}
            cy={32 + eyeOffset.y}
            r={mode === 'panic' ? 4 : 3}
            fill="#1a1b26"
          />
          
          {/* Right pupil - follows mouse */}
          <motion.circle
            cx={58 + eyeOffset.x}
            cy={32 + eyeOffset.y}
            r={mode === 'panic' ? 4 : 3}
            fill="#1a1b26"
          />

          {/* Beak */}
          <motion.path
            d="M 46 40 L 50 48 L 54 40 Z"
            fill="#ff9500"
            stroke="#e08600"
            strokeWidth="0.5"
          />
        </motion.g>

        {/* Feet */}
        <motion.g>
          <motion.ellipse
            cx="40"
            cy="90"
            rx="8"
            ry="4"
            fill="#ff9500"
          />
          <motion.ellipse
            cx="60"
            cy="90"
            rx="8"
            ry="4"
            fill="#ff9500"
          />
        </motion.g>

        {/* Processing indicator - spinning circle */}
        {mode === 'processing' && (
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#7aa2f7"
            strokeWidth="2"
            strokeDasharray="20 60"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: '50px 50px' }}
          />
        )}

        {/* Error indicator - X marks */}
        {mode === 'error' && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.text
              x="75"
              y="20"
              fontSize="16"
              fill="#f7768e"
              fontWeight="bold"
            >
              ?
            </motion.text>
          </motion.g>
        )}

        {/* Panic indicator - sweat drops */}
        {mode === 'panic' && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.ellipse
              cx="75"
              cy="25"
              rx="3"
              ry="5"
              fill="#7dcfff"
              animate={{ y: [0, 5, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.ellipse
              cx="25"
              cy="28"
              rx="2"
              ry="4"
              fill="#7dcfff"
              animate={{ y: [0, 4, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
            />
          </motion.g>
        )}

        {/* Success indicator - sparkles */}
        {mode === 'success' && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.text
              x="70"
              y="18"
              fontSize="12"
            >
              ✨
            </motion.text>
          </motion.g>
        )}
      </motion.svg>
    </motion.div>
  );
}

// Mini version for compact spaces
export function TuxMini({ 
  mode = 'idle',
  className = '',
}: { 
  mode?: TerminalStatus;
  className?: string;
}) {
  return (
    <motion.span 
      className={`inline-block text-2xl ${className}`}
      animate={
        mode === 'processing' ? { rotate: [0, 10, -10, 0] } :
        mode === 'error' ? { x: [-2, 2, 0] } :
        mode === 'success' ? { scale: [1, 1.2, 1] } :
        mode === 'panic' ? { rotate: [-10, 10, -10, 10, 0] } :
        {}
      }
      transition={{ duration: 0.4 }}
    >
      🐧
    </motion.span>
  );
}
