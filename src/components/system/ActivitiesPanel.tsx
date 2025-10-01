'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  X,
  Terminal,
  Settings,
  Calendar,
  Image as ImageIcon,
  Monitor,
  FileText,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

type AppIcon =
  | { type: 'image'; src: string; alt: string }
  | { type: 'gradient'; gradient: string; glyph: React.ReactNode };

interface App {
  id: string;
  name: string;
  icon: AppIcon;
  appType: string;
  title: string;
  description?: string;
}

const iconShadow = 'shadow-[0_18px_36px_rgba(15,23,42,0.24)]';
const baseIcon = 'flex items-center justify-center rounded-[22px]';
const iconSizes: Record<'lg' | 'md', string> = {
  lg: 'h-16 w-16',
  md: 'h-12 w-12',
};

const renderAppIcon = (icon: AppIcon, size: 'lg' | 'md' = 'lg') => {
  const dimensions = size === 'lg' ? 64 : 48;

  if (icon.type === 'image') {
    return (
      <div
        className={`${baseIcon} ${iconSizes[size]} overflow-hidden bg-[color:var(--color-surface)] ${iconShadow}`}
      >
        <Image
          src={icon.src}
          alt={icon.alt}
          width={dimensions}
          height={dimensions}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseIcon} ${iconSizes[size]} bg-gradient-to-br ${icon.gradient} text-white ${iconShadow}`}
    >
      {icon.glyph}
    </div>
  );
};

const apps: App[] = [
  {
    id: 'files',
    name: 'Files',
    icon: { type: 'image', src: '/dock/files.svg', alt: 'Files' },
    appType: 'files',
    title: 'Files',
    description: 'Browse your folders',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: { type: 'image', src: '/dock/portfolio.svg', alt: 'Portfolio' },
    appType: 'portfolio',
    title: 'Portfolio',
    description: 'Projects and case studies',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: {
      type: 'gradient',
      gradient: 'from-slate-900 via-slate-800 to-slate-700',
      glyph: <Terminal className="h-7 w-7" strokeWidth={1.6} />,
    },
    appType: 'terminal',
    title: 'Terminal',
    description: 'Command line access',
  },
  {
    id: 'code',
    name: 'Code Editor',
    icon: { type: 'image', src: '/dock/code.svg', alt: 'Code Editor' },
    appType: 'code-editor',
    title: 'Code Editor',
    description: 'Edit your source files',
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    icon: {
      type: 'gradient',
      gradient: 'from-blue-500 via-blue-400 to-blue-600',
      glyph: <FileText className="h-7 w-7" strokeWidth={1.5} />,
    },
    appType: 'text-editor',
    title: 'Text Editor',
    description: 'Simple text and document editing',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: {
      type: 'gradient',
      gradient: 'from-sky-500 via-indigo-500 to-purple-500',
      glyph: <Settings className="h-7 w-7" strokeWidth={1.5} />,
    },
    appType: 'settings',
    title: 'Settings',
    description: 'Personalise the desktop',
  },
  {
    id: 'system-monitor',
    name: 'Monitor',
    icon: {
      type: 'gradient',
      gradient: 'from-emerald-400 to-emerald-500',
      glyph: <Monitor className="h-7 w-7" strokeWidth={1.5} />,
    },
    appType: 'system-monitor',
    title: 'System Monitor',
    description: 'Performance monitoring',
  }
];

const workspaceGradients = [
  'from-sky-500 via-indigo-500 to-purple-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-rose-500 via-pink-500 to-fuchsia-500',
];

interface ActivitiesPanelProps {
  isVisible: boolean;
}

export default function ActivitiesPanel({ isVisible }: ActivitiesPanelProps) {
  const { windows, openWindow, focusWindow, updateWindow, closePanels } = useDesktop();
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const runningWindows = useMemo(
    () => windows.filter((w) => !w.minimized),
    [windows]
  );

  const handleAppClick = (app: App) => {
    const existingWindow = windows.find((w) => w.type === app.appType);

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

  const formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formattedDate = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fallbackIcon: AppIcon = {
    type: 'gradient',
    gradient: 'from-slate-600 via-slate-500 to-slate-700',
    glyph: <Monitor className="h-6 w-6" strokeWidth={1.4} />,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[rgba(8,15,31,0.78)] backdrop-blur-3xl transition-opacity duration-300"
        onClick={closePanels}
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-16 sm:px-10">
          <div className="w-full max-w-5xl flex flex-col gap-10 text-[color:var(--text-primary)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[color:var(--glass-border-muted)] bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-secondary)]">
                Activities
              </span>
              <div className="flex items-center gap-3 text-right">
                <div className="text-sm font-semibold text-[color:var(--text-secondary)]">
                  {formattedDate}
                </div>
                <div className="rounded-full border border-[color:var(--glass-border-muted)] bg-white/10 px-4 py-1 text-sm font-semibold">
                  {formattedTime}
                </div>
                <button
                  type="button"
                  onClick={closePanels}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border-muted)] bg-white/10 text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-white/20 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--color-surface-glass)]"
                  aria-label="Close Activities Panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-[32px] border border-[color:var(--glass-border-muted)] px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-4">
                <label htmlFor="activities-search" className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Search
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[color:var(--accent-strong)]">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="activities-search"
                    type="text"
                    placeholder="Search applications, files, and workspaces"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="flex-1 rounded-2xl border border-transparent bg-white/10 px-5 py-3 text-lg font-medium text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/70 focus:border-[color:var(--accent)]/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-[color:var(--accent-strong)] transition-colors duration-200 hover:border-[color:var(--accent)]/40 hover:bg-[var(--accent-soft)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {runningWindows.length > 0 && (
              <div className="glass-panel rounded-[32px] border border-[color:var(--glass-border-muted)] px-6 py-6 sm:px-8">
                <div className="flex items-center justify-between pb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--text-secondary)]">
                    Open Windows
                  </h2>
                  <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                    {runningWindows.length} active
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {runningWindows.map((window, index) => {
                    const app = apps.find((item) => item.appType === window.type);
                    const gradient = workspaceGradients[index % workspaceGradients.length];

                    return (
                      <button
                        key={window.id}
                        type="button"
                        onClick={() => handleWindowClick(window.id)}
                        className="group rounded-3xl border border-transparent bg-white/10 p-[1px] text-left transition-all duration-200 hover:border-[color:var(--accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                      >
                        <div className="rounded-[28px] bg-[color:var(--color-surface-glass)]/90 p-5">
                          <div className={`flex items-center gap-4 rounded-2xl bg-gradient-to-br ${gradient} px-5 py-4 text-white shadow-[0_18px_36px_rgba(15,23,42,0.25)]`}>
                            <div className="text-xs font-semibold uppercase tracking-[0.45em] opacity-70">
                              {index + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                                Workspace {index + 1}
                              </span>
                              <span className="text-base font-semibold leading-tight">
                                {window.title}
                              </span>
                            </div>
                            <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-semibold">
                              {(app?.name ?? window.type).slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="scale-90">
                                {renderAppIcon(app?.icon ?? fallbackIcon, 'md')}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                                  {window.title}
                                </p>
                                <p className="text-xs text-[color:var(--text-secondary)]">
                                  {app?.description ?? 'Running window'}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                              #{window.id}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-panel rounded-[32px] border border-[color:var(--glass-border-muted)] px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--text-secondary)]">
                    Applications
                  </h2>
                  <p className="text-sm text-[color:var(--text-secondary)]/80">
                    Launch favourites in a single click.
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--glass-border-muted)] bg-white/10 px-4 py-1 text-xs font-semibold text-[color:var(--text-muted)]">
                  {filteredApps.length} Listed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleAppClick(app)}
                    className="group flex flex-col items-start gap-4 rounded-3xl border border-transparent bg-white/10 px-5 py-6 text-left text-[color:var(--text-secondary)] transition-all duration-200 hover:border-[color:var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    <span className="transition-transform duration-200 group-hover:scale-105">
                      {renderAppIcon(app.icon, 'lg')}
                    </span>
                    <div className="space-y-1">
                      <span className="block text-base font-semibold text-[color:var(--text-primary)]">
                        {app.name}
                      </span>
                      {app.description && (
                        <span className="block text-sm text-[color:var(--text-secondary)]">
                          {app.description}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredApps.length === 0 && (
                <div className="mt-8 rounded-3xl border border-dashed border-[color:var(--glass-border-muted)] bg-white/10 px-6 py-10 text-center text-sm text-[color:var(--text-secondary)]">
                  Nothing matches "{searchQuery}" yet. Try searching for a different app.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}