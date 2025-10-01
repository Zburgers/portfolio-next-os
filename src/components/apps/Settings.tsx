'use client';

import React, { useMemo, useState } from 'react';
import {
  Palette,
  Wifi,
  Volume2,
  Monitor,
  Shield,
  Info,
  Sun,
  Moon,
  Paintbrush,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

type SettingsSectionId = 'appearance' | 'network' | 'sound' | 'display' | 'privacy' | 'about';

interface SettingsSection {
  id: SettingsSectionId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsSections: SettingsSection[] = [
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'network', name: 'Network', icon: Wifi },
  { id: 'sound', name: 'Sound', icon: Volume2 },
  { id: 'display', name: 'Display', icon: Monitor },
  { id: 'privacy', name: 'Privacy', icon: Shield },
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
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [brightness, setBrightness] = useState(80);

  const sectionLabel = useMemo(() => {
    return settingsSections.find((section) => section.id === activeSection)?.name ?? 'Settings';
  }, [activeSection]);

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
                    className="p-4 rounded-lg border-2 border-[color:var(--color-border)] hover:border-[color:var(--accent)]/50 transition-all duration-200"
                  >
                    <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-16 rounded mb-3 flex items-center justify-center">
                      <Paintbrush className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-center text-[color:var(--text-secondary)]">Auto</div>
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
                      Manage wireless network connections
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setWifiEnabled(!wifiEnabled)}
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
                
                {wifiEnabled && (
                  <div className="mt-6 p-4 bg-[color:var(--accent-soft)] border border-[color:var(--accent)]/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[color:var(--text-primary)]">YourNetwork</div>
                        <div className="text-sm text-[color:var(--text-secondary)]">Connected</div>
                      </div>
                      <div className="text-sm text-[color:var(--accent)]">Connected</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">Sound</h2>
              
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[color:var(--text-primary)] mb-6">Volume</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[color:var(--text-primary)]">Master Volume</span>
                      <span className="text-sm text-[color:var(--text-secondary)]">{volumeLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumeLevel}
                      onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-[color:var(--color-border)] rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volumeLevel}%, var(--color-border) ${volumeLevel}%, var(--color-border) 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">Display</h2>
              
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[color:var(--text-primary)] mb-6">Brightness</h3>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[color:var(--text-primary)]">Screen Brightness</span>
                    <span className="text-sm text-[color:var(--text-secondary)]">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-[color:var(--color-border)] rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(brightness - 10) / 0.9}%, var(--color-border) ${(brightness - 10) / 0.9}%, var(--color-border) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">Privacy</h2>
              
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-medium text-[color:var(--text-primary)] mb-4">Location Services</h3>
                <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                  Control which applications can access your location.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[color:var(--color-surface-muted)] rounded-lg">
                    <div>
                      <div className="font-medium text-[color:var(--text-primary)]">Location Services</div>
                      <div className="text-sm text-[color:var(--text-secondary)]">Allow apps to use your location</div>
                    </div>
                    <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-[color:var(--color-border)] transition-colors duration-200">
                      <span className="inline-block h-6 w-6 transform rounded-full bg-white translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-6">About</h2>
              
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-xl p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-[color:var(--accent)] rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">F</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">Fedora 39</h3>
                    <p className="text-[color:var(--text-secondary)]">GNOME 45 Workstation</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-[color:var(--text-primary)]">Version</div>
                      <div className="text-sm text-[color:var(--text-secondary)]">39.1.5</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[color:var(--text-primary)]">Kernel</div>
                      <div className="text-sm text-[color:var(--text-secondary)]">6.5.6-300.fc39.x86_64</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[color:var(--text-primary)]">Memory</div>
                      <div className="text-sm text-[color:var(--text-secondary)]">16.0 GB</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[color:var(--text-primary)]">Storage</div>
                      <div className="text-sm text-[color:var(--text-secondary)]">512 GB SSD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
