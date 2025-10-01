'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  TerminalSquare,
  Settings2,
  Gauge,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  appType: string;
  title: string;
}

const apps: App[] = [
  {
    id: 'files',
    name: 'Files',
    icon: (
      <Image
  src="/dock/files.svg"
        alt="Files"
        width={32}
        height={32}
        className="h-8 w-8 rounded-xl shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
      />
    ),
    appType: 'files',
    title: 'Files'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: (
      <Image
  src="/dock/portfolio.svg"
        alt="Portfolio"
        width={32}
        height={32}
        className="h-8 w-8 rounded-xl shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
      />
    ),
    appType: 'portfolio',
    title: 'Portfolio'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18181b] text-white shadow-[0_8px_18px_rgba(15,23,42,0.25)]">
        <TerminalSquare className="h-5 w-5" />
      </div>
    ),
    appType: 'terminal',
    title: 'Terminal'
  },
  {
    id: 'code',
    name: 'Code Editor',
    icon: (
      <Image
  src="/dock/code.svg"
        alt="Code Editor"
        width={32}
        height={32}
        className="h-8 w-8 rounded-xl shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
      />
    ),
    appType: 'code-editor',
    title: 'Code Editor'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#60a5fa] via-[#6366f1] to-[#a855f7] text-white shadow-[0_8px_18px_rgba(15,23,42,0.25)]">
        <Settings2 className="h-5 w-5" />
      </div>
    ),
    appType: 'settings',
    title: 'Settings'
  },
  {
    id: 'system-monitor',
    name: 'Monitor',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-[0_8px_18px_rgba(15,23,42,0.25)]">
        <Gauge className="h-5 w-5" />
      </div>
    ),
    appType: 'terminal',
    title: 'Terminal'
  }
];

export default function Dock() {
  const { windows, activeWindowId, openWindow, focusWindow, updateWindow } = useDesktop();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const handleAppClick = (app: App) => {
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
    <div className="pointer-events-none fixed bottom-10 left-0 right-0 z-40 flex items-end justify-center">
      <div className="dock-container">
        {apps.map((app) => {
          const focusedWindow = windows.find((w) => w.type === app.appType && !w.minimized);
          const active = focusedWindow?.id === activeWindowId;
          const hovered = hoveredApp === app.id;

          return (
            <div key={app.id} className="dock-item">
              <div className={`dock-tooltip ${hovered ? 'dock-tooltip-visible' : ''}`}>
                {app.name}
              </div>
              <button
                type="button"
                onClick={() => handleAppClick(app)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className={`dock-button ${hovered ? 'dock-button-hovered' : ''} ${active ? 'dock-button-active' : ''}`}
              >
                <span className="dock-icon">
                  {app.icon}
                </span>
              </button>
              <div className={`dock-indicator ${active ? 'dock-indicator-active' : ''} ${active && hovered ? 'dock-indicator-hovered' : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}