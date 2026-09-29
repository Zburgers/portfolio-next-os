'use client';

import { Monitor, Moon, Settings, Sun, SunMoon, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDesktop } from '@/context/DesktopContext';

interface ControlCenterProps {
  isVisible: boolean;
}

export default function ControlCenter({ isVisible }: ControlCenterProps) {
  const { closePanels, openWindow, theme, setTheme } = useDesktop();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!isVisible) return null;

  const open = (appType: string, title: string) => {
    openWindow(appType, title);
    closePanels();
  };

  return (
    <>
      <button className="fixed inset-0 z-[1010] cursor-default" aria-label="Close quick settings" onClick={closePanels} />
      <section className="quick-settings-panel fixed right-3 top-12 z-[1020] w-[min(360px,calc(100vw-1.5rem))] rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl" aria-label="Quick settings">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Quick settings</h2>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs">
            {online ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-amber-500" />}
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2" aria-label="Appearance">
          {([
            { value: 'light', label: 'Light', Icon: Sun },
            { value: 'dark', label: 'Dark', Icon: Moon },
            { value: 'system', label: 'System', Icon: SunMoon },
          ] as const).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={['flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]', theme === value ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'].join(' ')}
            >
              <Icon size={18} aria-hidden="true" />{label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => open('system-monitor', 'System Monitor')} className="quick-settings-action">
            <Monitor size={16} aria-hidden="true" /> System monitor
          </button>
          <button type="button" onClick={() => open('settings', 'Settings')} className="quick-settings-action">
            <Settings size={16} aria-hidden="true" /> Settings
          </button>
        </div>
      </section>
    </>
  );
}
