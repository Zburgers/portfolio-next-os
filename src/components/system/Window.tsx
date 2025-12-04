'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Window as WindowType, useDesktop } from '@/context/DesktopContext';
import AppContent from './AppContent';

interface WindowProps {
  window: WindowType;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Window({ window: windowData }: WindowProps) {
  const { closeWindow, focusWindow, updateWindow, activeWindowId } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, startX: 0, startY: 0 });
  const previousBoundsRef = useRef({
    x: windowData.x,
    y: windowData.y,
    width: windowData.width,
    height: windowData.height,
  });
  const latestWindowRef = useRef(windowData);

  useEffect(() => {
    latestWindowRef.current = windowData;
  }, [windowData]);

  useEffect(() => {
    if (!windowData.maximized && !isDragging && !isResizing) {
      previousBoundsRef.current = {
        x: windowData.x,
        y: windowData.y,
        width: windowData.width,
        height: windowData.height,
      };
    }
  }, [windowData.x, windowData.y, windowData.width, windowData.height, windowData.maximized, isDragging, isResizing]);

  const isActive = activeWindowId === windowData.id;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const currentWindow = latestWindowRef.current;
        const viewportWidth = typeof globalThis !== 'undefined' && typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 1280;
        const viewportHeight = typeof globalThis !== 'undefined' && typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 720;
        const padding = 16;
        
        // Get top bar height from CSS variable dynamically
        const topBarHeight = typeof globalThis !== 'undefined' && globalThis.getComputedStyle 
          ? parseInt(globalThis.getComputedStyle(document.documentElement).getPropertyValue('--top-bar-height')) || 44
          : 44;
        
        const nodeWidth = windowRef.current?.offsetWidth ?? currentWindow.width;
        const nodeHeight = windowRef.current?.offsetHeight ?? currentWindow.height;
        const maxX = viewportWidth - nodeWidth - padding;
        const maxY = viewportHeight - nodeHeight - padding;
        
        // Constrain window to not go above the top bar
        const newX = clamp(e.clientX - dragOffsetRef.current.x, padding, Math.max(padding, maxX));
        const newY = clamp(e.clientY - dragOffsetRef.current.y, topBarHeight, Math.max(topBarHeight, maxY));

        updateWindow(currentWindow.id, {
          x: Math.round(newX),
          y: Math.round(newY),
        });
      }

      if (isResizing) {
        const currentWindow = latestWindowRef.current;
        const viewportWidth = typeof globalThis !== 'undefined' && typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 1280;
        const viewportHeight = typeof globalThis !== 'undefined' && typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 720;
        const padding = 16;
        const minWidth = 520;
        const minHeight = 360;
        const deltaX = e.clientX - resizeStartRef.current.startX;
        const deltaY = e.clientY - resizeStartRef.current.startY;
        const desiredWidth = resizeStartRef.current.width + deltaX;
        const desiredHeight = resizeStartRef.current.height + deltaY;
        const maxWidth = viewportWidth - currentWindow.x - padding;
        const maxHeight = viewportHeight - currentWindow.y - padding;

        updateWindow(currentWindow.id, {
          width: Math.round(clamp(desiredWidth, minWidth, maxWidth)),
          height: Math.round(clamp(desiredHeight, minHeight, maxHeight)),
        });
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
  }, [isDragging, isResizing, updateWindow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.titlebar')) {
      focusWindow(windowData.id);
    }
  };

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (windowData.maximized) {
      return;
    }
    dragOffsetRef.current = {
      x: e.clientX - windowData.x,
      y: e.clientY - windowData.y,
    };
    setIsDragging(true);
    focusWindow(windowData.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      width: windowData.width,
      height: windowData.height,
      startX: e.clientX,
      startY: e.clientY,
    };
    setIsResizing(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeWindow(windowData.id);
    }, 200);
  };

  const handleMaximize = () => {
    if (windowData.maximized) {
      const previous = previousBoundsRef.current;
      updateWindow(windowData.id, {
        maximized: false,
        x: previous.x,
        y: previous.y,
        width: previous.width,
        height: previous.height,
      });
    } else {
      const screenWidth = typeof globalThis !== 'undefined' && typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 1200;
      const screenHeight = typeof globalThis !== 'undefined' && typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 800;
      
      // Get top bar height from CSS variable dynamically
      const topBarHeight = typeof globalThis !== 'undefined' && globalThis.getComputedStyle 
        ? parseInt(globalThis.getComputedStyle(document.documentElement).getPropertyValue('--top-bar-height')) || 44
        : 44;
      
      previousBoundsRef.current = {
        x: windowData.x,
        y: windowData.y,
        width: windowData.width,
        height: windowData.height,
      };

      updateWindow(windowData.id, {
        maximized: true,
        x: 12,
        y: topBarHeight,
        width: screenWidth - 24,
        height: screenHeight - topBarHeight - 12,
      });
    }
  };

  const handleMinimize = () => {
    updateWindow(windowData.id, { minimized: true });
  };

  if (windowData.minimized) {
    return null;
  }

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: isClosing ? 0 : 1, 
        scale: isClosing ? 0.95 : 1, 
        y: isClosing ? 10 : 0,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          duration: 0.2
        }
      }}
      className={`fixed rounded-2xl overflow-hidden border backdrop-blur-xl bg-glass-bg ${
        isActive
          ? 'border-accent shadow-window-active'
          : 'border-glass-border shadow-window'
      }`}
      style={{
        left: windowData.x,
        top: windowData.y,
        width: windowData.width,
        height: windowData.height,
        zIndex: windowData.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Modern Title Bar */}
      <div
        className={`titlebar h-12 flex items-center justify-between px-4 cursor-move select-none bg-glass-bg/50 backdrop-blur-sm border-b border-glass-border transition-colors duration-200 ${
          isActive 
            ? 'bg-glass-bg/70' 
            : 'bg-glass-bg/30'
        }`}
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center space-x-3">
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-primary text-base font-medium"
          >
            {windowData.title}
          </motion.span>
        </div>

        {/* macOS-style Traffic Light Controls on Right */}
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* Minimize Button - Yellow */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMinimize}
            className="w-7 h-7 rounded-full bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center transition-colors duration-200 group"
            title="Minimize"
          >
            <div className="w-3.5 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </motion.button>
          
          {/* Maximize Button - Green */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaximize}
            className="w-7 h-7 rounded-full bg-green-400 hover:bg-green-300 flex items-center justify-center transition-colors duration-200 group"
            title={windowData.maximized ? 'Restore' : 'Maximize'}
          >
            {windowData.maximized ? (
              <div className="w-3 h-3 border-2 border-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-green-800 bg-green-400"></div>
              </div>
            ) : (
              <div className="w-3 h-3 border-2 border-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            )}
          </motion.button>
          
          {/* Close Button - Red */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-red-400 hover:bg-red-300 flex items-center justify-center transition-colors duration-200 group"
            title="Close"
          >
            <div className="relative w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-red-800 rotate-45 absolute"></div>
                <div className="w-4 h-0.5 bg-red-800 -rotate-45 absolute"></div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full bg-window-bg text-text-primary overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
        <AppContent window={windowData} />
      </div>

      {/* Resize Handle */}
      {!windowData.maximized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-accent" />
        </motion.div>
      )}
    </motion.div>
  );
}