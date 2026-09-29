'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { TerminalSquare, Settings2, Gauge, Trash2, FileText } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { useSystemBoot } from '@/context/SystemBootContext';
import TopBar from '@/components/system/TopBar';
import Dock from '@/components/system/Dock';
import Window from '@/components/system/Window';
import DesktopIcon from '@/components/system/DesktopIcon';
import { desktopApps, type DesktopApp } from '@/lib/desktop-apps';

const IconComponents = {
  TerminalSquare,
  Settings2,
  Gauge,
  Trash2,
  FileText,
};

interface ScreenDimensions {
  width: number;
  height: number;
  availableHeight: number;
  gridCols: number;
  gridRows: number;
}

export default function Desktop() {
  const { windows, openWindow, updateWindow, focusWindow } = useDesktop();
  const { skipWelcome, isFirstVisit, isInitialized, phase } = useSystemBoot();
  const welcomeOpenedRef = useRef(false);
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>({
    width: 1920,
    height: 1080,
    availableHeight: 1000,
    gridCols: 4,
    gridRows: 8
  });

  // Auto-open Welcome window on first mount (if not skipped)
  useEffect(() => {
    // Wait for state to be initialized from localStorage AND we're at DESKTOP phase
    if (!isInitialized || phase !== 'DESKTOP') return;
    
    if (!welcomeOpenedRef.current && !skipWelcome) {
      welcomeOpenedRef.current = true;
      // Use requestAnimationFrame + timeout for reliable timing after context is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          openWindow('welcome', 'Welcome');
        }, 600);
      });
    }
  }, [skipWelcome, isInitialized, phase, openWindow]);

  // Constants for layout calculations
  const ICON_SIZE = 80; // Each icon cell size
  const ICON_GAP = 16; // Gap between icons
  const TOP_BAR_HEIGHT = 48; // Top bar height
  const DOCK_HEIGHT = 80; // Dock height
  const DESKTOP_PADDING = 16; // Padding from edges
  const ICON_CONTAINER_TOP_PADDING = 16; // Additional top padding for selection overlay

  // Calculate screen-aware grid dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Calculate available space for desktop icons
      const availableHeight = Math.max(0, height - TOP_BAR_HEIGHT - DOCK_HEIGHT - (DESKTOP_PADDING * 2) - ICON_CONTAINER_TOP_PADDING);
      const availableWidth = Math.max(0, Math.min(width - (DESKTOP_PADDING * 2), 400));
      
      // Calculate how many icons can fit
      const gridCols = Math.floor((availableWidth + ICON_GAP) / (ICON_SIZE + ICON_GAP));
      const gridRows = Math.floor((availableHeight + ICON_GAP) / (ICON_SIZE + ICON_GAP));
      
      setScreenDimensions({
        width,
        height,
        availableHeight,
        gridCols: Math.max(1, gridCols), // At least 1 column
        gridRows: Math.max(1, gridRows)  // At least 1 row
      });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Calculate auto-positioning for apps that fit within screen bounds
  const positionedApps = useMemo(() => {
    const sortedApps = [...desktopApps].sort((a, b) => (a.priority || 999) - (b.priority || 999));
    return sortedApps.map((app, index) => {
      // Calculate grid position automatically (left to right, top to bottom)
      const col = (index % screenDimensions.gridCols) + 1;
      const row = Math.floor(index / screenDimensions.gridCols) + 1;
      
      return {
        ...app,
        calculatedPosition: { row, col }
      };
    });
  }, [desktopApps, screenDimensions]);

  const renderIcon = (app: DesktopApp) => {
    if (app.iconType === 'image' && app.iconSrc) {
      return (
        <Image
          src={app.iconSrc}
          alt={app.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
        />
      );
    }

    if (app.iconType === 'gradient' && app.iconComponent && app.iconGradient) {
      const IconComponent = IconComponents[app.iconComponent as keyof typeof IconComponents];
      if (IconComponent) {
        return (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_rgba(15,23,42,0.25)] ${app.iconGradient}`}>
            <IconComponent className="h-7 w-7" />
          </div>
        );
      }
    }

    return null;
  };

  const handleDesktopIconClick = (app: DesktopApp) => {
    handleDesktopIconDoubleClick(app);
  };

  const handleDesktopIconDoubleClick = (app: DesktopApp) => {
    // Double click - open application
    // Check if app is already open
    const existingWindow = windows.find(w => w.type === app.appType);
    
    if (existingWindow) {
      // If window exists but is minimized, restore it
      if (existingWindow.minimized) {
        updateWindow(existingWindow.id, { minimized: false });
        focusWindow(existingWindow.id);
      } else {
        // Just focus the existing window
        focusWindow(existingWindow.id);
      }
    } else {
      // Open new window
      openWindow(app.appType, app.title);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Desktop Wallpaper */}
      <div className="absolute inset-0 desktop-wallpaper" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_32%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(96,165,250,0.18),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_88%,rgba(39,102,228,0.12),transparent_60%)]" />
      </div>

      {/* Screen-aware, scrollable desktop icons grid */}
      <div 
        className="desktop-icons-container-responsive"
        aria-label="Desktop applications"
        style={{
          top: `${TOP_BAR_HEIGHT + DESKTOP_PADDING}px`,
          left: `${DESKTOP_PADDING}px`,
          width: `${Math.min(screenDimensions.width - (DESKTOP_PADDING * 2), 400)}px`,
          height: `${screenDimensions.availableHeight}px`,
          gridTemplateColumns: `repeat(${screenDimensions.gridCols}, ${ICON_SIZE}px)`,
          gridTemplateRows: `repeat(${screenDimensions.gridRows}, ${ICON_SIZE}px)`,
          gap: `${ICON_GAP}px`
        }}
      >
        {positionedApps.map((app) => (
          <div
            key={app.id}
            className="desktop-icon-cell"
            style={{
              gridColumn: app.calculatedPosition.col,
              gridRow: app.calculatedPosition.row
            }}
          >
            <DesktopIcon
              icon={renderIcon(app)}
              label={app.name}
              onClick={() => handleDesktopIconClick(app)}
              onDoubleClick={() => handleDesktopIconDoubleClick(app)}
            />
          </div>
        ))}
      </div>

      <TopBar />
      <Dock />

      {windows.map(window => (
        <Window key={window.id} window={window} />
      ))}
    </div>
  );
}
