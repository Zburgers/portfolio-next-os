'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X,
  Terminal, 
  User, 
  Code, 
  FolderOpen, 
  Settings,
  Calendar,
  Image,
  Music,
  Video,
  FileText,
  Calculator,
  Gamepad2,
  Monitor
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
    id: 'portfolio',
    name: 'Portfolio',
    icon: <User className="w-16 h-16" />,
    appType: 'portfolio',
    title: 'Portfolio'
  },
  {
    id: 'files',
    name: 'Files',
    icon: <FolderOpen className="w-16 h-16" />,
    appType: 'files',
    title: 'Files'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: <Terminal className="w-16 h-16" />,
    appType: 'terminal',
    title: 'Terminal'
  },
  {
    id: 'code',
    name: 'Code Editor',
    icon: <Code className="w-16 h-16" />,
    appType: 'code-editor',
    title: 'Code Editor'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="w-16 h-16" />,
    appType: 'settings',
    title: 'Settings'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: <Calendar className="w-16 h-16" />,
    appType: 'calendar',
    title: 'Calendar'
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: <Image className="w-16 h-16" />,
    appType: 'photos',
    title: 'Photos'
  }
];

interface ActivitiesPanelProps {
  isVisible: boolean;
}

export default function ActivitiesPanel({ isVisible }: ActivitiesPanelProps) {
  const { windows, openWindow, focusWindow, updateWindow, closePanels } = useDesktop();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    return apps.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const runningWindows = useMemo(() => {
    return windows.filter(w => !w.minimized);
  }, [windows]);

  const handleAppClick = (app: App) => {
    const existingWindow = windows.find(w => w.type === app.appType);
    
    if (existingWindow) {
      if (existingWindow.minimized) {
        updateWindow(existingWindow.id, { minimized: false });
        focusWindow(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
    } else {
      openWindow(app.appType, app.title);
    }
    
    closePanels();
  };

  const handleWindowClick = (windowId: number) => {
    focusWindow(windowId);
    closePanels();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Full Screen Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-40"
        onClick={closePanels}
      />
      
      {/* Activities Overview */}
      <div className="fixed inset-0 z-50 flex flex-col">
        
        {/* Search Bar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for applications, files, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 px-8 text-2xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all duration-200"
                autoFocus
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/70" />
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="flex-[2] flex items-center justify-center px-20">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-7 gap-8 justify-items-center">
              {filteredApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="group flex flex-col items-center p-6 rounded-2xl hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-200">
                    {app.icon}
                  </div>
                  <span className="text-white text-lg font-medium text-center">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
            
            {filteredApps.length === 0 && (
              <div className="text-center text-white/70">
                <p className="text-2xl mb-4">No results found</p>
                <p className="text-lg">Try a different search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Running Applications / Windows */}
        {runningWindows.length > 0 && (
          <div className="flex-1 flex items-start justify-center pt-8 pb-20">
            <div className="flex space-x-6">
              {runningWindows.map(window => {
                const app = apps.find(a => a.appType === window.type);
                return (
                  <button
                    key={window.id}
                    onClick={() => handleWindowClick(window.id)}
                    className="group relative"
                  >
                    <div className="w-48 h-32 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden group-hover:bg-white/15 transition-all duration-200 transform group-hover:scale-105">
                      <div className="h-6 bg-gray-700/50 flex items-center px-3">
                        <div className="flex space-x-1.5">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="ml-3 text-xs text-white/80 truncate">
                          {window.title}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-white/60">
                          {app?.icon}
                        </div>
                      </div>
                    </div>
                    <p className="text-white text-sm mt-2 text-center truncate">
                      {window.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}