'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { TerminalLine } from '@/hooks/useTerminal';

interface TerminalOutputProps {
  lines: TerminalLine[];
  className?: string;
  autoScroll?: boolean;
}

// Parse ANSI color codes and return styled spans
function parseAnsiColors(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Match ANSI codes like \x1b[36m (cyan), \x1b[33m (yellow), \x1b[1m (bold), \x1b[0m (reset)
  const ansiRegex = /\x1b\[(\d+)m/g;
  let match;
  let currentStyle: React.CSSProperties = {};
  
  const colorMap: Record<string, string> = {
    '0': '', // reset
    '1': 'font-weight: bold', // bold
    '30': '#1a1b26', // black
    '31': '#f7768e', // red
    '32': '#9ece6a', // green
    '33': '#e0af68', // yellow
    '34': '#7aa2f7', // blue
    '35': '#bb9af7', // magenta
    '36': '#7dcfff', // cyan
    '37': '#c0caf5', // white
  };

  while ((match = ansiRegex.exec(content)) !== null) {
    // Add text before the ANSI code
    if (match.index > currentIndex) {
      const text = content.slice(currentIndex, match.index);
      if (text) {
        parts.push(
          <span key={currentIndex} style={currentStyle}>
            {text}
          </span>
        );
      }
    }
    
    // Update style based on ANSI code
    const code = match[1];
    if (code === '0') {
      currentStyle = {};
    } else if (code === '1') {
      currentStyle = { ...currentStyle, fontWeight: 'bold' };
    } else if (colorMap[code]) {
      currentStyle = { ...currentStyle, color: colorMap[code] };
    }
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < content.length) {
    const text = content.slice(currentIndex);
    if (text) {
      parts.push(
        <span key={currentIndex} style={currentStyle}>
          {text}
        </span>
      );
    }
  }
  
  return parts.length > 0 ? parts : [content];
}

// Get the color class based on line type
function getLineColorClass(type: TerminalLine['type']): string {
  switch (type) {
    case 'error':
      return 'text-[#f7768e]';
    case 'success':
      return 'text-[#9ece6a]';
    case 'input':
      return 'text-[#7aa2f7]';
    default:
      return 'text-[#a9b1d6]';
  }
}

// Single line component for potential animations
const TerminalLineItem = React.memo(({ 
  line, 
  index,
  animate = false 
}: { 
  line: TerminalLine; 
  index: number;
  animate?: boolean;
}) => {
  const colorClass = getLineColorClass(line.type);
  const content = parseAnsiColors(line.content);
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15, delay: index * 0.02 }}
        className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}
      >
        {content}
      </motion.div>
    );
  }
  
  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
      {content}
    </div>
  );
});

TerminalLineItem.displayName = 'TerminalLineItem';

export default function TerminalOutput({ 
  lines, 
  className = '',
  autoScroll = true 
}: TerminalOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-y-auto space-y-0.5 ${className}`}
    >
      {lines.map((line, index) => (
        <TerminalLineItem 
          key={`${index}-${line.timestamp?.getTime() || index}`} 
          line={line} 
          index={index}
        />
      ))}
    </div>
  );
}

// Export components and utilities
export { TerminalLineItem, parseAnsiColors, getLineColorClass };
