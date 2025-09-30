'use client';

import React, { useState } from 'react';
import { Terminal, User, Code, FolderOpen, Settings } from 'lucide-react';
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
    icon: <FolderOpen className="w-8 h-8" />,
    appType: 'files',
    title: 'Files'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: <User className="w-8 h-8" />,
    appType: 'portfolio',
    title: 'Portfolio'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: <Terminal className="w-8 h-8" />,
    appType: 'terminal',
    title: 'Terminal'
  },
  {
    id: 'code',
    name: 'Code Editor',
    icon: <Code className="w-8 h-8" />,
    appType: 'code-editor',
    title: 'Code Editor'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="w-8 h-8" />,
    appType: 'settings',
    title: 'Settings'
  }
];

export default function Dock() {
  const { windows, openWindow, focusWindow, updateWindow } = useDesktop();
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

  const isAppOpen = (appType: string) => {
    return windows.some(w => w.type === appType && !w.minimized);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-glass-bg backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-glass-border">
        <div className="flex items-center space-x-2">
          {apps.map((app) => (
            <div key={app.id} className="relative group">
              {/* Tooltip */}
              {hoveredApp === app.id && (
                <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 tooltip opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {app.name}
                </div>
              )}
              
              <button
                onClick={() => handleAppClick(app)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className={`relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 transform ${
                  isAppOpen(app.appType) 
                    ? 'bg-accent/20 border border-accent/30 scale-105' 
                    : 'hover:bg-glass-hover hover:scale-110'
                } ${hoveredApp === app.id ? 'scale-125' : ''}`}
                title={app.name}
              >
                <div className={`transition-all duration-300 ${
                  isAppOpen(app.appType) ? 'text-accent' : 'text-text-primary'
                }`}>
                  {app.icon}
                </div>
                
                {/* Water droplet active indicator */}
                {isAppOpen(app.appType) && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-accent rounded-full dock-indicator animate-pulse shadow-lg shadow-accent/50" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}