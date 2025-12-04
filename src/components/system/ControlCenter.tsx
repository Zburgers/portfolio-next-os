'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  BluetoothOff, 
  Plane, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon,
  Power,
  Settings,
  Coffee,
  Smartphone
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface ControlCenterProps {
  isVisible: boolean;
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
  const [volume, setVolume] = useState(85);
  const [brightness, setBrightness] = useState(70);
  const [nightLight, setNightLight] = useState(false);
  const [caffeine, setCaffeine] = useState(false);

  if (!isVisible) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(parseInt(e.target.value));
  };

  const openSettings = () => {
    openWindow('settings', 'Settings');
    closePanels();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Toggle tile component
  const ToggleTile = ({ 
    enabled, 
    onClick, 
    icon, 
    disabledIcon,
    label, 
    sublabel,
    hasChevron = false
  }: { 
    enabled: boolean; 
    onClick: () => void; 
    icon: React.ReactNode;
    disabledIcon?: React.ReactNode;
    label: string;
    sublabel?: string;
    hasChevron?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`relative h-[72px] rounded-2xl flex items-center px-4 gap-3 transition-all duration-200 ${
        enabled 
          ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25' 
          : 'bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)]'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        enabled ? 'bg-white/20' : 'bg-[var(--surface)]'
      }`}>
        {enabled ? icon : (disabledIcon || icon)}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold">{label}</div>
        {sublabel && (
          <div className={`text-xs ${enabled ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
            {sublabel}
          </div>
        )}
      </div>
      {hasChevron && (
        <div className={`text-lg ${enabled ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>›</div>
      )}
    </button>
  );

  // Small toggle tile for secondary options
  const SmallToggleTile = ({ 
    enabled, 
    onClick, 
    icon, 
    label 
  }: { 
    enabled: boolean; 
    onClick: () => void; 
    icon: React.ReactNode;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
        enabled 
          ? 'bg-[var(--accent)] text-white shadow-md' 
          : 'bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)]'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={closePanels}
      />
      
      {/* Control Center Panel */}
      <div className="fixed top-12 right-4 z-50 w-[340px]">
        <div 
          className="rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="p-4 space-y-4">
            {/* Main Connectivity Tiles - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* WiFi */}
              <ToggleTile
                enabled={wifiEnabled}
                onClick={() => setWifiEnabled(!wifiEnabled)}
                icon={<Wifi className="w-5 h-5" />}
                disabledIcon={
                  <div className="relative">
                    <Wifi className="w-5 h-5 opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-current rotate-45 rounded-full" />
                    </div>
                  </div>
                }
                label="Wi-Fi"
                sublabel={wifiEnabled ? "Connected" : "Off"}
                hasChevron={wifiEnabled}
              />

              {/* Bluetooth / Tether */}
              <ToggleTile
                enabled={bluetoothEnabled}
                onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                icon={<Smartphone className="w-5 h-5" />}
                disabledIcon={
                  <div className="relative">
                    <Bluetooth className="w-5 h-5 opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-current rotate-45 rounded-full" />
                    </div>
                  </div>
                }
                label={bluetoothEnabled ? "Tether" : "Bluetooth"}
                sublabel={bluetoothEnabled ? "Connected" : "Off"}
                hasChevron={bluetoothEnabled}
              />

              {/* Bluetooth actual */}
              <ToggleTile
                enabled={bluetoothEnabled}
                onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                icon={<Bluetooth className="w-5 h-5" />}
                disabledIcon={
                  <div className="relative">
                    <Bluetooth className="w-5 h-5 opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-current rotate-45 rounded-full" />
                    </div>
                  </div>
                }
                label="Bluetooth"
                sublabel={bluetoothEnabled ? "On" : "Off"}
                hasChevron={bluetoothEnabled}
              />

              {/* Power Mode */}
              <ToggleTile
                enabled={true}
                onClick={() => {}}
                icon={<Power className="w-5 h-5" />}
                label="Power Mode"
                sublabel="Balanced"
                hasChevron
              />
            </div>

            {/* Secondary Toggle Row */}
            <div className="grid grid-cols-4 gap-2">
              <SmallToggleTile
                enabled={nightLight}
                onClick={() => setNightLight(!nightLight)}
                icon={<Sun className="w-4 h-4" />}
                label="Night Light"
              />
              <SmallToggleTile
                enabled={theme === 'dark'}
                onClick={toggleTheme}
                icon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                label="Dark Style"
              />
              <SmallToggleTile
                enabled={airplaneMode}
                onClick={() => {
                  const next = !airplaneMode;
                  setAirplaneMode(next);
                  if (next) {
                    setWifiEnabled(false);
                    setBluetoothEnabled(false);
                  }
                }}
                icon={<Plane className="w-4 h-4" />}
                label="Airplane"
              />
              <SmallToggleTile
                enabled={caffeine}
                onClick={() => setCaffeine(!caffeine)}
                icon={<Coffee className="w-4 h-4" />}
                label="Caffeine"
              />
            </div>

            {/* Volume Slider */}
            <div className="bg-[var(--surface-muted)] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center">
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-[var(--text-primary)]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[var(--text-primary)]" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volume}%, var(--surface) ${volume}%, var(--surface) 100%)`
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] w-8 text-right">
                  {volume}%
                </span>
              </div>
            </div>

            {/* Brightness Slider */}
            <div className="bg-[var(--surface-muted)] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center">
                  <Sun className="w-4 h-4 text-[var(--text-primary)]" />
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={handleBrightnessChange}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${brightness}%, var(--surface) ${brightness}%, var(--surface) 100%)`
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] w-8 text-right">
                  {brightness}%
                </span>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={openSettings}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              
              <button 
                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: none;
        }
      `}</style>
    </>
  );
}