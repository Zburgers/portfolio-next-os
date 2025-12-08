'use client';

import React, { useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface TerminalInputProps {
  username: string;
  hostname: string;
  currentDirectory: string;
  currentInput: string;
  isTyping?: boolean;
  readOnly?: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  className?: string;
}

export default function TerminalInput({
  username,
  hostname,
  currentDirectory,
  currentInput,
  isTyping = false,
  readOnly = false,
  onInputChange,
  onSubmit,
  onKeyDown,
  autoFocus = true,
  className = '',
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and when clicking container
  useEffect(() => {
    if (autoFocus && !readOnly) {
      inputRef.current?.focus();
    }
  }, [autoFocus, readOnly]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!readOnly && !isTyping) {
      onSubmit(currentInput);
    }
  };

  const handleContainerClick = () => {
    if (!readOnly) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      className={`flex items-center cursor-text ${className}`}
      onClick={handleContainerClick}
    >
      {/* Prompt */}
      <span className="text-[#7aa2f7]">{username}</span>
      <span className="text-[#c0caf5]">@</span>
      <span className="text-[#bb9af7]">{hostname}</span>
      <span className="text-[#c0caf5]">:</span>
      <span className="text-[#7dcfff]">{currentDirectory}</span>
      <span className="text-[#c0caf5]">$ </span>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent border-none outline-none text-[#c0caf5] font-mono caret-transparent"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          disabled={readOnly}
          readOnly={isTyping}
        />
        
        {/* Custom cursor that follows text */}
        <motion.span
          className="absolute top-0 h-full w-[2px] bg-[#7aa2f7]"
          style={{ 
            left: `${currentInput.length * 0.6}em`,
          }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </form>
    </div>
  );
}

// Compact input for embedded terminals (Welcome widget)
export function TerminalInputCompact({
  prompt = '$ ',
  currentInput,
  isTyping = false,
  showCursor = true,
  className = '',
}: {
  prompt?: string;
  currentInput: string;
  isTyping?: boolean;
  showCursor?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center font-mono ${className}`}>
      <span className="text-gray-500">{prompt}</span>
      <span className="text-[#c0caf5]">{currentInput}</span>
      {showCursor && (
        <motion.span
          className="inline-block w-2 h-4 bg-[#7aa2f7] ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
