'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FileText, Gauge, Settings2, TerminalSquare, Trash2 } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { desktopApps, type DesktopApp } from '@/lib/desktop-apps';

const iconComponents = { TerminalSquare, Settings2, Gauge, Trash2, FileText };

function AppIcon({ app }: { app: DesktopApp }) {
  if (app.iconType === 'image' && app.iconSrc) {
    return <Image src={app.iconSrc} alt="" width={44} height={44} className="h-11 w-11 rounded-[14px] object-cover" />;
  }
  const Icon = app.iconComponent && iconComponents[app.iconComponent as keyof typeof iconComponents];
  return (
    <span className={['flex h-11 w-11 items-center justify-center rounded-[14px] text-white shadow-lg', app.iconGradient || 'bg-slate-700'].join(' ')}>
      {Icon ? <Icon className="h-6 w-6" strokeWidth={1.8} /> : <FileText className="h-6 w-6" />}
    </span>
  );
}

export default function Dock() {
  const { windows, activeWindowId, openWindow, focusWindow, updateWindow } = useDesktop();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const handleAppClick = (app: DesktopApp) => {
    const existing = windows
      .filter((window) => window.type === app.appType)
      .sort((a, b) => Number(b.id === activeWindowId) - Number(a.id === activeWindowId) || Number(a.minimized) - Number(b.minimized) || b.zIndex - a.zIndex)[0];

    if (existing) {
      if (existing.minimized) updateWindow(existing.id, { minimized: false });
      focusWindow(existing.id);
      return;
    }
    openWindow(app.appType, app.title);
  };

  return (
    <div className="dock-wrapper dock-visible">
      <nav className="dock-container" aria-label="Applications">
        {desktopApps.map((app) => {
          const running = windows.some((window) => window.type === app.appType);
          const active = windows.some((window) => window.id === activeWindowId && window.type === app.appType && !window.minimized);
          const hovered = hoveredApp === app.id;
          return (
            <div key={app.id} className="dock-item">
              <span className={['dock-tooltip', hovered ? 'dock-tooltip-visible' : ''].join(' ')} aria-hidden="true">{app.name}</span>
              <button
                type="button"
                onClick={() => handleAppClick(app)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                onFocus={() => setHoveredApp(app.id)}
                onBlur={() => setHoveredApp(null)}
                className={['dock-button', hovered ? 'dock-button-hovered' : '', active ? 'dock-button-active' : ''].join(' ')}
                aria-label={'Open ' + app.name + (running ? ', running' : '')}
                aria-current={active ? 'page' : undefined}
                title={app.name}
              >
                <span className="dock-icon"><AppIcon app={app} /></span>
              </button>
              <span className={['dock-indicator', running ? 'dock-indicator-running' : '', active ? 'dock-indicator-active' : ''].join(' ')} aria-hidden="true" />
            </div>
          );
        })}
      </nav>
    </div>
  );
}
