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
  Power,
  Settings,
  Monitor
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
  } = useDesktop();
  const [volume, setVolume] = useState(85);
  const [brightness, setBrightness] = useState(70);

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

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={closePanels}
      />
      
      {/* Control Center Panel */}
      <div className="fixed top-12 right-6 z-50 w-80">
        <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Quick Controls Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* WiFi Toggle */}
              <button
                onClick={() => setWifiEnabled(!wifiEnabled)}
                className={`h-20 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
                  wifiEnabled 
                    ? 'bg-accent text-white shadow-lg' 
                    : 'bg-glass-bg hover:bg-glass-hover text-text-primary'
                }`}
              >
                {wifiEnabled ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                <span className="text-sm font-medium">Wi-Fi</span>
              </button>

              {/* Bluetooth Toggle */}
              <button
                onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                className={`h-20 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
                  bluetoothEnabled 
                    ? 'bg-accent text-white shadow-lg' 
                    : 'bg-glass-bg hover:bg-glass-hover text-text-primary'
                }`}
              >
                {bluetoothEnabled ? <Bluetooth className="w-6 h-6" /> : <BluetoothOff className="w-6 h-6" />}
                <span className="text-sm font-medium">Bluetooth</span>
              </button>

              {/* Airplane Mode */}
              <button
                onClick={() => {
                  const next = !airplaneMode;
                  setAirplaneMode(next);
                  if (next) {
                    setWifiEnabled(false);
                    setBluetoothEnabled(false);
                  }
                }}
                className={`h-20 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
                  airplaneMode 
                    ? 'bg-accent text-white shadow-lg' 
                    : 'bg-glass-bg hover:bg-glass-hover text-text-primary'
                }`}
              >
                <Plane className="w-6 h-6" />
                <span className="text-sm font-medium">Airplane</span>
              </button>

              {/* Display Settings */}
              <button
                onClick={openSettings}
                className="h-20 rounded-xl flex flex-col items-center justify-center space-y-2 bg-glass-bg hover:bg-glass-hover text-text-primary transition-all duration-200"
              >
                <Monitor className="w-6 h-6" />
                <span className="text-sm font-medium">Display</span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-text-primary" />
                ) : (
                  <Volume2 className="w-5 h-5 text-text-primary" />
                )}
                <span className="text-sm font-medium text-text-primary">Volume</span>
                <span className="text-sm text-text-secondary ml-auto">{volume}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-glass-bg rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Brightness Control */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <Sun className="w-5 h-5 text-text-primary" />
                <span className="text-sm font-medium text-text-primary">Brightness</span>
                <span className="text-sm text-text-secondary ml-auto">{brightness}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={handleBrightnessChange}
                  className="w-full h-2 bg-glass-bg rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={openSettings}
                className="flex-1 h-12 bg-glass-bg hover:bg-glass-hover rounded-xl flex items-center justify-center space-x-2 text-text-primary transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              
              <button className="h-12 px-4 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white transition-all duration-200">
                <Power className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}