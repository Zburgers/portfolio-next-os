'use client';

import React, { useState } from 'react';
import {
  Palette,
  Wifi,
  Info,
  Sun,
  Moon,
  Paintbrush,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

type SettingsSectionId = 'appearance' | 'network' | 'about';

interface SettingsSection {
  id: SettingsSectionId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsSections: SettingsSection[] = [
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'network', name: 'Network', icon: Wifi },
  { id: 'about', name: 'About', icon: Info },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export default function Settings() {
  const {
    theme,
    setTheme,
    wifiEnabled,
    setWifiEnabled,
  } = useDesktop();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('appearance');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">Appearance</h2>
              
              {/* Theme Selection */}
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-medium text-[color:var(--text-primary)] mb-4">Theme</h3>
                <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                  Choose between light and dark themes, or let the system decide.
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    aria-pressed={theme === 'light'}
                    className={cx(
                      'p-4 rounded-lg border-2 transition-all duration-200',
                      theme === 'light'
                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]'
                        : 'border-[color:var(--color-border)] hover:border-[color:var(--accent)]/50'
                    )}
                  >
                    <div className="bg-white h-16 rounded border mb-3 flex items-center justify-center">
                      <Sun className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-sm font-medium text-center text-[color:var(--text-primary)]">Light</div>
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    aria-pressed={theme === 'dark'}
                    className={cx(
                      'p-4 rounded-lg border-2 transition-all duration-200',
                      theme === 'dark'
                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]'
                        : 'border-[color:var(--color-border)] hover:border-[color:var(--accent)]/50'
                    )}
                  >
                    <div className="bg-gray-800 h-16 rounded mb-3 flex items-center justify-center">
                      <Moon className="h-6 w-6 text-gray-300" />
                    </div>
                    <div className="text-sm font-medium text-center text-[color:var(--text-primary)]">Dark</div>
                  </button>
                  
                  <button
                    onClick={() => setTheme('system')}
                    aria-pressed={theme === 'system'}
                    className={cx(
                      'p-4 rounded-lg border-2 transition-all duration-200',
                      theme === 'system'
                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]'
                        : 'border-[color:var(--color-border)] hover:border-[color:var(--accent)]/50'
                    )}
                  >
                    <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-16 rounded mb-3 flex items-center justify-center">
                      <Paintbrush className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-center text-[color:var(--text-primary)]">System</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">Network</h2>
              
              {/* Wi-Fi Settings */}
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-[color:var(--text-primary)]">Wi-Fi</h3>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      Toggle the network indicator in this desktop preview.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setWifiEnabled(!wifiEnabled)}
                    type="button"
                    role="switch"
                    aria-label="Preview Wi-Fi"
                    aria-checked={wifiEnabled}
                    className={cx(
                      'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200',
                      wifiEnabled ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--color-border)]'
                    )}
                  >
                    <span
                      className={cx(
                        'inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200',
                        wifiEnabled ? 'translate-x-7' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
                
                <p className="mt-4 rounded-lg border border-[color:var(--color-border)] p-4 text-sm text-[color:var(--text-secondary)]">
                  Preview state: <strong className="text-[color:var(--text-primary)]">{wifiEnabled ? 'On' : 'Off'}</strong>. This does not change your device’s internet connection.
                </p>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-2">About this preview</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">A portfolio presented inside a browser-based desktop interface.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
              <p className="font-semibold">Project Next OS</p>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">This is a visual simulation. Browser controls cannot read or change your computer’s hardware, network, or location settings.</p>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-[color:var(--color-surface)] text-[color:var(--text-primary)] rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[color:var(--color-surface-muted)] border-r border-[color:var(--color-border)]">
        <div className="p-6 border-b border-[color:var(--color-border)]">
          <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">Settings</h1>
        </div>
        
        <div className="p-4 space-y-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cx(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors duration-200',
                  isActive
                    ? 'bg-[color:var(--accent)] text-white'
                    : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--text-primary)]'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}
