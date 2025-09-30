'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Square } from 'lucide-react';
import { Window as WindowType, useDesktop } from '@/context/DesktopContext';
import AppContent from './AppContent';

interface WindowProps {
  window: WindowType;
}

export default function Window({ window }: WindowProps) {
  const { closeWindow, focusWindow, updateWindow, activeWindowId } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const isActive = activeWindowId === window.id;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        updateWindow(window.id, {
          x: Math.max(0, window.x + deltaX),
          y: Math.max(0, window.y + deltaY)
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }

      if (isResizing) {
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(300, e.clientX - rect.left);
          const newHeight = Math.max(200, e.clientY - rect.top);
          
          updateWindow(window.id, {
            width: newWidth,
            height: newHeight
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, window.id, window.x, window.y, updateWindow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.titlebar')) {
      focusWindow(window.id);
    }
  };

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    focusWindow(window.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleClose = () => {
    closeWindow(window.id);
  };

  const handleMaximize = () => {
    if (window.maximized) {
      updateWindow(window.id, { 
        maximized: false,
        x: 100,
        y: 100,
        width: 800,
        height: 600
      });
    } else {
      const screenWidth = typeof globalThis !== 'undefined' && globalThis.innerWidth ? globalThis.innerWidth : 1200;
      const screenHeight = typeof globalThis !== 'undefined' && globalThis.innerHeight ? globalThis.innerHeight : 800;
      
      updateWindow(window.id, { 
        maximized: true,
        x: 0,
        y: 0,
        width: screenWidth,
        height: screenHeight - 80 // Account for top bar and dock
      });
    }
  };

  const handleMinimize = () => {
    updateWindow(window.id, { minimized: true });
  };

  if (window.minimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={`fixed bg-glass-bg backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 window-enter ${
        isActive 
          ? 'border-accent shadow-accent/20' 
          : 'border-glass-border'
      }`}
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Modern Title Bar */}
      <div
        className={`titlebar h-12 flex items-center justify-between px-4 cursor-move select-none bg-glass-bg/50 backdrop-blur-sm border-b border-glass-border ${
          isActive 
            ? 'bg-glass-bg/70' 
            : 'bg-glass-bg/30'
        }`}
        onMouseDown={handleTitleBarMouseDown}
      >
        <div className="flex items-center space-x-3">
          <span className="text-text-primary text-base font-medium">
            {window.title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center hover:bg-glass-hover rounded-full transition-all duration-200"
            title="Minimize"
          >
            <div className="w-3 h-0.5 bg-text-primary"></div>
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center hover:bg-glass-hover rounded-full transition-all duration-200"
            title={window.maximized ? "Restore" : "Maximize"}
          >
            {window.maximized ? (
              <div className="w-3 h-3 border border-text-primary relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 border border-text-primary bg-glass-bg"></div>
              </div>
            ) : (
              <div className="w-3 h-3 border border-text-primary"></div>
            )}
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-500 rounded-full transition-all duration-200 group"
            title="Close"
          >
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-0.5 bg-text-primary group-hover:bg-white rotate-45 absolute"></div>
                <div className="w-3 h-0.5 bg-text-primary group-hover:bg-white -rotate-45 absolute"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full bg-glass-bg/30 backdrop-blur-sm text-text-primary overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
        <AppContent window={window} />
      </div>

      {/* Resize Handle */}
      {!window.maximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-accent" />
        </div>
      )}
    </div>
  );
}