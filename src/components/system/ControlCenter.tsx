'use client';

import { Bluetooth, BluetoothOff, Moon, Plane, Settings, Sun, Wifi, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useDesktop } from '@/context/DesktopContext';

interface ControlCenterProps {
  isVisible: boolean;
}

function ToggleTile({
  enabled,
  label,
  icon,
  disabledIcon,
  onClick,
}: {
  enabled: boolean;
  label: string;
  icon: ReactNode;
  disabledIcon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onClick}
      className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 text-left transition-colors ${enabled ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${enabled ? 'bg-white/20' : 'bg-[var(--surface)]'}`}>
        {enabled ? icon : disabledIcon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className={`block text-xs ${enabled ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>Preview {enabled ? 'on' : 'off'}</span>
      </span>
    </button>
  );
}

export default function ControlCenter({ isVisible }: ControlCenterProps) {
  const {
    closePanels,
    openWindow,
    wifiEnabled,
    bluetoothEnabled,
    airplaneMode,
    setWifiEnabled,
    setBluetoothEnabled,
    setAirplaneMode,
    theme,
    setTheme,
  } = useDesktop();

  if (!isVisible) return null;

  return (
    <>
      <button className="fixed inset-0 z-40 cursor-default" aria-label="Close quick settings" onClick={closePanels} />
      <section className="fixed right-4 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl" aria-label="Quick settings">
        <p className="mb-3 text-xs text-[var(--text-muted)]">Browser preview · these controls affect this page only.</p>
        <div className="grid grid-cols-2 gap-2">
          <ToggleTile enabled={wifiEnabled} label="Wi-Fi" icon={<Wifi size={18} />} disabledIcon={<WifiOff size={18} />} onClick={() => setWifiEnabled(!wifiEnabled)} />
          <ToggleTile enabled={bluetoothEnabled} label="Bluetooth" icon={<Bluetooth size={18} />} disabledIcon={<BluetoothOff size={18} />} onClick={() => setBluetoothEnabled(!bluetoothEnabled)} />
          <ToggleTile enabled={airplaneMode} label="Airplane mode" icon={<Plane size={18} />} disabledIcon={<Plane size={18} />} onClick={() => setAirplaneMode(!airplaneMode)} />
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-left text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)]">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</span>
            <span className="text-sm font-semibold">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => { openWindow('settings', 'Settings'); closePanels(); }}
          className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-lg bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        >
          <Settings size={16} aria-hidden="true" /> Appearance settings
        </button>
      </section>
    </>
  );
}
