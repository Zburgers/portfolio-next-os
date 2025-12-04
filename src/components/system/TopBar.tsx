'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Volume2, Battery, VolumeX } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import CalendarPanel from './CalendarPanel';
import ControlCenter from './ControlCenter';
import ActivitiesPanel from './ActivitiesPanel';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { 
    showCalendar, 
    showControlCenter, 
    showActivities, 
    toggleCalendar, 
    toggleControlCenter, 
    toggleActivities,
    wifiEnabled,
    bluetoothEnabled 
  } = useDesktop();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${day} ${time}`;
  };

  // WiFi icon with strikethrough when disabled
  const WifiIcon = () => {
    if (wifiEnabled) {
      return <Wifi className="h-3.5 w-3.5" />;
    }
    return (
      <div className="relative">
        <Wifi className="h-3.5 w-3.5 opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-0.5 bg-current rotate-45 rounded-full" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-50">
        <div className="w-full">
          <div className="top-bar-modern">
            {/* Left Section */}
            <button
              onClick={toggleActivities}
              className={`group flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                showActivities
                  ? 'bg-accent-soft text-primary border-accent-border'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                  showActivities
                    ? 'bg-accent shadow-[0_0_0_3px_var(--accent-soft)]'
                    : 'bg-muted group-hover:bg-accent'
                }`}
              />
              Activities
            </button>

            {/* Center Section - Clock */}
            <button
              onClick={toggleCalendar}
              className={`rounded-lg border border-transparent px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                showCalendar
                  ? 'border-accent-border bg-surface-hover text-primary shadow-sm'
                  : 'text-primary hover:bg-surface-hover'
              }`}
            >
              {formatTime(time)}
            </button>

            {/* Right Section - System Status */}
            <button
              onClick={toggleControlCenter}
              className={`flex items-center gap-3 rounded-lg border border-transparent px-3 py-1.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                showControlCenter
                  ? 'border-accent-border bg-accent-soft text-primary'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                <WifiIcon />
                <span className="hidden sm:inline text-xs">{wifiEnabled ? 'Wi-Fi' : 'Off'}</span>
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                <Volume2 className="h-3.5 w-3.5" />
                <span className="text-xs">48%</span>
              </span>
              <span className="flex items-center gap-2">
                <Battery className="h-3.5 w-3.5" />
                <span className="text-xs">87%</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <CalendarPanel isVisible={showCalendar} />
      <ControlCenter isVisible={showControlCenter} />
      <ActivitiesPanel isVisible={showActivities} />
    </>
  );
}