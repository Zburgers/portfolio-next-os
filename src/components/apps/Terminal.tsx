'use client';

import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import TerminalOutput from '@/components/Terminal/TerminalOutput';

export default function Terminal() {
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
  } = useTerminal();

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
      // Tab completion
      if (currentInput) {
        const matching = getCompletions(currentInput);
        if (matching.length === 1) {
          setCurrentInput(matching[0]);
        } else if (matching.length > 1) {
          addLine('input', `${username}@${hostname}:${currentDirectory}$ ${currentInput}`);
          addLine('output', matching.join('  '));
        }
      }
    }
  };

  return (
    <div className="h-full bg-[#1a1b26] text-[#c0caf5] font-mono text-sm overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        onClick={() => inputRef.current?.focus()}
      >
        <TerminalOutput lines={lines} autoScroll={false} />
        
        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-[#7aa2f7]">{username}</span>
          <span className="text-[#c0caf5]">@</span>
          <span className="text-[#bb9af7]">{hostname}</span>
          <span className="text-[#c0caf5]">:</span>
          <span className="text-[#7dcfff]">{currentDirectory}</span>
          <span className="text-[#c0caf5]">$ </span>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(currentInput); }} className="flex-1">
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
              disabled={isTyping}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
