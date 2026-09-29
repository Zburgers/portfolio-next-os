'use client';

import React, { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import TerminalOutput from '@/components/Terminal/TerminalOutput';
import { useDesktop } from '@/context/DesktopContext';
import { profile } from '@/lib/profile';

export default function Terminal() {
  const { openWindow } = useDesktop();
  const handleOpen = useCallback((item: string) => {
    if (item === 'projects') {
      openWindow('portfolio', 'Selected work', { initialTab: 'work' });
      return;
    }
    const urls: Record<string, string> = {
      resume: profile.resumeUrl,
      contact: `mailto:${profile.email}`,
      github: profile.githubUrl,
      linkedin: profile.linkedinUrl,
      x: profile.xUrl,
    };
    const url = urls[item];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, [openWindow]);

  const {
    lines,
    currentInput,
    currentDirectory,
    username,
    hostname,
    isTyping,
    executeCommand,
    setCurrentInput,
    setHistoryIndex,
    navigateHistory,
    getCompletions,
    addLine,
    clearTerminal,
  } = useTerminal({ onOpen: handleOpen });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (command: string) => {
    executeCommand(command);
    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matching = getCompletions(currentInput);
      if (matching.length === 1) setCurrentInput(matching[0]);
      else if (matching.length > 1) addLine('output', matching.join('  '));
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setHistoryIndex(-1);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clearTerminal();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (currentInput) addLine('input', `${username}@${hostname}:${currentDirectory}$ ${currentInput}^C`);
      setCurrentInput('');
      setHistoryIndex(-1);
    }
  };

  return (
    <div className="h-full bg-[#1a1b26] text-[#c0caf5] font-mono text-sm overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        onClick={() => inputRef.current?.focus()}
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          <TerminalOutput lines={lines} autoScroll={false} />
        </div>
        
        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-[#7aa2f7]">{username}</span>
          <span className="text-[#c0caf5]">@</span>
          <span className="text-[#bb9af7]">{hostname}</span>
          <span className="text-[#c0caf5]">:</span>
          <span className="text-[#7dcfff]">{currentDirectory}</span>
          <span className="text-[#c0caf5]">$ </span>
          <form onSubmit={(e) => { e.preventDefault(); if (!isTyping) handleSubmit(currentInput); }} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-[#c0caf5] font-mono caret-[#7aa2f7]"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              aria-label="Enter a terminal command"
              title="Terminal"
              disabled={isTyping}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
