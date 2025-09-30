'use client';

import React from 'react';
import { useDesktop } from '@/context/DesktopContext';
import TopBar from '@/components/system/TopBar';
import Dock from '@/components/system/Dock';
import Window from '@/components/system/Window';

export default function Desktop() {
  const { windows, openWindow } = useDesktop();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Wallpaper Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('/wallpaper.jpg')`,
          filter: 'brightness(0.7) contrast(1.1)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-800/30 to-indigo-900/40" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-20 left-10 space-y-8">
        {[
          { name: 'Home', icon: '🏠', action: () => openWindow('files', 'Files') },
          { name: 'Portfolio', icon: '👨‍💻', action: () => openWindow('portfolio', 'Portfolio') },
          { name: 'Terminal', icon: '⬛', action: () => openWindow('terminal', 'Terminal') },
          { name: 'Trash', icon: '🗑️', action: () => {} }
        ].map((icon, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 w-20 hover:bg-glass-hover rounded-2xl transition-all duration-300 cursor-pointer group backdrop-blur-sm border border-glass-border"
            onDoubleClick={icon.action}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
              {icon.icon}
            </div>
            <span className="text-text-primary text-sm font-medium drop-shadow-lg text-center leading-tight">
              {icon.name}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-32 right-32 text-white/5 text-9xl font-thin select-none pointer-events-none">
        Fedora
      </div>

      {/* System Info Widget */}
      <div className="absolute bottom-10 left-10 bg-glass-bg backdrop-blur-xl rounded-2xl p-6 text-text-primary border border-glass-border shadow-2xl min-w-[240px]">
        <div className="text-base font-semibold mb-4 text-text-primary">System Status</div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Uptime:</span>
            <span className="font-medium">{Math.floor(Date.now() / 1000 / 3600)} hours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Kernel:</span>
            <span className="font-medium text-xs">6.5.6-300.fc39.x86_64</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">DE:</span>
            <span className="font-medium">GNOME 45.1</span>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="absolute top-20 right-10 bg-glass-bg backdrop-blur-xl rounded-2xl p-6 text-text-primary border border-glass-border shadow-2xl min-w-[160px]">
        <div className="flex items-center gap-4">
          <span className="text-4xl drop-shadow-lg">☀️</span>
          <div className="flex flex-col">
            <div className="text-2xl font-semibold mb-1">22°C</div>
            <div className="text-sm text-text-secondary">Sunny</div>
          </div>
        </div>
      </div>

      {/* System Components */}
      <TopBar />
      <Dock />

      {/* Windows */}
      {windows.map(window => (
        <Window key={window.id} window={window} />
      ))}
    </div>
  );
}