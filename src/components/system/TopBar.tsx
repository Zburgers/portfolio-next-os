'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Volume2, Battery, ChevronDown } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import CalendarPanel from './CalendarPanel';
import ControlCenter from './ControlCenter';
import ActivitiesPanel from './ActivitiesPanel';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { showCalendar, showControlCenter, showActivities, toggleCalendar, toggleControlCenter, toggleActivities } = useDesktop();

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

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-between px-6 text-white border-b border-white/10">
      {/* Left Section */}
      <div className="flex items-center">
        <button 
          onClick={toggleActivities}
          className="hover:bg-white/15 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
        >
          Activities
        </button>
      </div>

      {/* Center Section - Clock */}
      <button 
        onClick={toggleCalendar}
        className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-white/15 transition-all duration-200"
      >
        <span className="font-semibold text-base">
          {formatTime(time)}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          showCalendar ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Right Section - System Status */}
      <button 
        onClick={toggleControlCenter}
        className="flex items-center space-x-4 px-4 py-2 rounded-xl hover:bg-white/15 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <Wifi className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-2">
          <Battery className="w-5 h-5" />
          <span className="text-sm font-medium">87%</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          showControlCenter ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Calendar Panel */}
      <CalendarPanel isVisible={showCalendar} />

      {/* Control Center Panel */}
      <ControlCenter isVisible={showControlCenter} />

      {/* Activities Panel */}
      <ActivitiesPanel isVisible={showActivities} />
    </div>
  );
}