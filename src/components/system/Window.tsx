'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  const previousBoundsRef = useRef({ x: windowData.x, y: windowData.y, width: windowData.width, height: windowData.height });
  const latestWindowRef = useRef(windowData);
  const isActive = activeWindowId === windowData.id;

  useEffect(() => {
    latestWindowRef.current = windowData;
  }, [windowData]);

  useEffect(() => {
    if (!windowData.maximized && !isDragging && !isResizing) {
      previousBoundsRef.current = { x: windowData.x, y: windowData.y, width: windowData.width, height: windowData.height };
    }
  }, [windowData.x, windowData.y, windowData.width, windowData.height, windowData.maximized, isDragging, isResizing]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const current = latestWindowRef.current;
      const padding = 12;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const topBarHeight = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-bar-height'), 10) || 44;

      if (isDragging) {
        const nodeWidth = windowRef.current?.offsetWidth ?? current.width;
        const nodeHeight = windowRef.current?.offsetHeight ?? current.height;
        updateWindow(current.id, {
          x: Math.round(clamp(event.clientX - dragOffsetRef.current.x, padding, Math.max(padding, viewportWidth - nodeWidth - padding))),
          y: Math.round(clamp(event.clientY - dragOffsetRef.current.y, topBarHeight, Math.max(topBarHeight, viewportHeight - nodeHeight - padding))),
        });
      }

      if (isResizing) {
        const maxWidth = Math.max(240, viewportWidth - current.x - padding);
        const maxHeight = Math.max(200, viewportHeight - current.y - padding);
        updateWindow(current.id, {
          width: Math.round(clamp(resizeStartRef.current.width + event.clientX - resizeStartRef.current.startX, Math.min(480, maxWidth), maxWidth)),
          height: Math.round(clamp(resizeStartRef.current.height + event.clientY - resizeStartRef.current.startY, Math.min(320, maxHeight), maxHeight)),
        });
      }
    };

    const stopPointerAction = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', stopPointerAction);
      document.addEventListener('pointercancel', stopPointerAction);
    }
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', stopPointerAction);
      document.removeEventListener('pointercancel', stopPointerAction);
    };
  }, [isDragging, isResizing, updateWindow]);

  const handleTitleBarPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button') || windowData.maximized) return;
    event.preventDefault();
    dragOffsetRef.current = { x: event.clientX - windowData.x, y: event.clientY - windowData.y };
    setIsDragging(true);
    focusWindow(windowData.id);
  };

  const handleResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    resizeStartRef.current = { width: windowData.width, height: windowData.height, startX: event.clientX, startY: event.clientY };
    setIsResizing(true);
    focusWindow(windowData.id);
  };

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => closeWindow(windowData.id), 160);
  };

  const handleMaximize = () => {
    if (windowData.maximized) {
      updateWindow(windowData.id, { maximized: false, ...previousBoundsRef.current });
      return;
    }
    const topBarHeight = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-bar-height'), 10) || 44;
    previousBoundsRef.current = { x: windowData.x, y: windowData.y, width: windowData.width, height: windowData.height };
    updateWindow(windowData.id, {
      maximized: true,
      x: 12,
      y: topBarHeight,
      width: Math.max(240, window.innerWidth - 24),
      height: Math.max(200, window.innerHeight - topBarHeight - 12),
    });
  };

  const handleMinimize = () => updateWindow(windowData.id, { minimized: true });

  const handleResizeKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 40 : 12;
    const sizes: Record<string, { width?: number; height?: number }> = {
      ArrowLeft: { width: -step },
      ArrowRight: { width: step },
      ArrowUp: { height: -step },
      ArrowDown: { height: step },
    };
    const delta = sizes[event.key];
    if (!delta) return;
    event.preventDefault();
    const maxWidth = Math.max(240, window.innerWidth - windowData.x - 12);
    const maxHeight = Math.max(200, window.innerHeight - windowData.y - 12);
    updateWindow(windowData.id, {
      width: clamp(windowData.width + (delta.width || 0), Math.min(320, maxWidth), maxWidth),
      height: clamp(windowData.height + (delta.height || 0), Math.min(240, maxHeight), maxHeight),
    });
  };

  if (windowData.minimized) return null;

  return (
    <motion.div
      ref={windowRef}
      role="dialog"
      aria-label={windowData.title}
      aria-modal={false}
      tabIndex={-1}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? 6 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32, duration: 0.18 }}
      className={['window-shell', isActive ? 'window-shell-active' : ''].join(' ')}
      style={{ left: windowData.x, top: windowData.y, width: windowData.width, height: windowData.height, zIndex: windowData.zIndex }}
      onPointerDown={() => focusWindow(windowData.id)}
    >
      <header
        className="window-titlebar"
        onPointerDown={handleTitleBarPointerDown}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest('button')) handleMaximize();
        }}
      >
        <div className="window-controls" aria-label="Window controls">
          <button type="button" className="window-control window-control-close" onClick={handleClose} aria-label={'Close ' + windowData.title} title="Close"><span>×</span></button>
          <button type="button" className="window-control window-control-minimize" onClick={handleMinimize} aria-label={'Minimize ' + windowData.title} title="Minimize"><span>−</span></button>
          <button type="button" className="window-control window-control-maximize" onClick={handleMaximize} aria-label={windowData.maximized ? 'Restore window' : 'Maximize window'} title={windowData.maximized ? 'Restore' : 'Maximize'}><span>{windowData.maximized ? '↙' : '+'}</span></button>
        </div>
        <span className="window-title">{windowData.title}</span>
        <span className="window-titlebar-spacer" aria-hidden="true" />
      </header>

      <div className="window-content">
        <AppContent window={windowData} />
      </div>

      {!windowData.maximized && (
        <button
          type="button"
          className="window-resize-handle"
          aria-label={'Resize ' + windowData.title + ' window'}
          title="Drag to resize; use arrow keys to adjust"
          onPointerDown={handleResizePointerDown}
          onKeyDown={handleResizeKey}
        >
          <span aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
