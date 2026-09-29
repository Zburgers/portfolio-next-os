'use client';

import React, { useEffect, useState } from 'react';
import { Info, Monitor, Moon, Palette, Sun, Wifi, WifiOff } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

type SettingsSectionId = 'appearance' | 'network' | 'about';

type ConnectionDetails = EventTarget & { effectiveType?: string; downlink?: number; rtt?: number };
type ConnectionSnapshot = { effectiveType?: string; downlink?: number; rtt?: number };
type BrowserNavigator = Navigator & { connection?: ConnectionDetails };

const sections: Array<{ id: SettingsSectionId; name: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'network', name: 'Network', icon: Wifi },
  { id: 'about', name: 'About', icon: Info },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export default function Settings() {
  const { theme, setTheme } = useDesktop();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('appearance');
  const [online, setOnline] = useState<boolean | null>(null);
  const [connection, setConnection] = useState<ConnectionSnapshot | null>(null);
  const [systemAppearance, setSystemAppearance] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const browserNavigator = navigator as BrowserNavigator;
    const updateNetwork = () => {
      setOnline(navigator.onLine);
      const details = browserNavigator.connection;
      setConnection(details ? { effectiveType: details.effectiveType, downlink: details.downlink, rtt: details.rtt } : null);
    };
    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    browserNavigator.connection?.addEventListener('change', updateNetwork);
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      browserNavigator.connection?.removeEventListener('change', updateNetwork);
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const updatePreference = () => setSystemAppearance(preference.matches ? 'dark' : 'light');
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const renderContent = () => {
    if (activeSection === 'appearance') {
      const themes = [
        { id: 'light' as const, label: 'Light', icon: Sun, preview: 'bg-white text-amber-500' },
        { id: 'dark' as const, label: 'Dark', icon: Moon, preview: 'bg-slate-800 text-slate-100' },
        { id: 'system' as const, label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-slate-100 to-slate-800 text-violet-500' },
      ];
      return (
        <section aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="mb-2 text-2xl font-semibold">Appearance</h2>
          <p className="mb-6 text-sm text-[color:var(--text-secondary)]">Choose how this desktop is shown in your browser.</p>
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
            <h3 className="text-lg font-medium">Theme</h3>
            <p className="mb-5 mt-1 text-sm text-[color:var(--text-secondary)]">System follows your browser’s light or dark appearance preference.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Desktop theme">
              {themes.map(({ id, label, icon: Icon, preview }) => (
                <button key={id} type="button" onClick={() => setTheme(id)} aria-pressed={theme === id} className={cx('rounded-lg border-2 p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]', theme === id ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]' : 'border-[color:var(--color-border)] hover:border-[color:var(--accent)]/50')}>
                  <span className={`mb-3 flex h-12 items-center justify-center rounded ${preview}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-1 block min-h-8 text-xs text-[color:var(--text-secondary)]">{id === 'system' ? `Currently ${systemAppearance ?? 'checking'} mode` : `${label} desktop theme`}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === 'network') {
      const statusLabel = online === null ? 'Checking…' : online ? 'Online' : 'Offline';
      const connectionLabel = connection?.effectiveType
        ? `${connection.effectiveType.toUpperCase()}${typeof connection.downlink === 'number' ? ` · ~${connection.downlink} Mbps` : ''}`
        : 'Not reported by this browser';
      return (
        <section aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="mb-2 text-2xl font-semibold">Network</h2>
          <p className="mb-6 text-sm text-[color:var(--text-secondary)]">Read-only connection details reported by this browser.</p>
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
            <div className="flex items-center gap-3">
              {online === false ? <WifiOff className="h-5 w-5 text-[color:var(--text-secondary)]" aria-hidden="true" /> : <Wifi className="h-5 w-5 text-[color:var(--accent)]" aria-hidden="true" />}
              <div><h3 className="font-medium">Browser connectivity</h3><p className="text-sm text-[color:var(--text-secondary)]" aria-live="polite">{statusLabel}</p></div>
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-[color:var(--color-border)] pt-4 sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">Connection estimate</dt><dd className="mt-1 text-sm">{connectionLabel}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">Round-trip estimate</dt><dd className="mt-1 text-sm">{typeof connection?.rtt === 'number' ? `~${connection.rtt} ms` : 'Not reported by this browser'}</dd></div>
            </dl>
            <p className="mt-5 rounded-lg bg-[color:var(--color-surface-muted)] p-3 text-xs text-[color:var(--text-secondary)]">These estimates can be coarse or unavailable. “Online” only reflects the browser’s connection flag; it does not guarantee a site can be reached. A webpage cannot toggle your Wi-Fi radio.</p>
          </div>
        </section>
      );
    }

    return (
      <section aria-labelledby="settings-heading" className="space-y-5">
        <div><h2 id="settings-heading" className="mb-2 text-2xl font-semibold">About this preview</h2><p className="text-sm text-[color:var(--text-secondary)]">A portfolio presented inside a browser-based desktop interface.</p></div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <p className="font-semibold">Project Next OS</p>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">This is a visual simulation. Browser controls cannot read or change the computer’s hardware, network radios, processes, or location settings.</p>
        </div>
      </section>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-[color:var(--color-surface)] text-[color:var(--text-primary)] md:flex-row">
      <aside className="shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] md:w-52 md:border-b-0 md:border-r">
        <div className="border-b border-[color:var(--color-border)] px-5 py-4"><h1 className="text-lg font-semibold">Settings</h1></div>
        <nav className="grid grid-cols-3 gap-1 p-2 md:grid-cols-1 md:gap-2 md:p-3" aria-label="Settings sections">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} aria-current={isActive ? 'page' : undefined} className={cx('flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] md:justify-start md:px-3', isActive ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--text-primary)]')}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{section.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">{renderContent()}</main>
    </div>
  );
}
