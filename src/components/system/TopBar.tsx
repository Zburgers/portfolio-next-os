'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import CalendarPanel from './CalendarPanel';
import ControlCenter from './ControlCenter';
import ActivitiesPanel from './ActivitiesPanel';

const clockFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

export default function TopBar() {
  const [time, setTime] = useState(() => new Date());
  const [online, setOnline] = useState(true);
  const {
    showCalendar,
    showControlCenter,
    showActivities,
    toggleCalendar,
    toggleControlCenter,
    toggleActivities,
  } = useDesktop();

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    const clockTimer = window.setInterval(updateTime, 15_000);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.clearInterval(clockTimer);
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[1000]">
        <div className="top-bar-modern">
          <button
            type="button"
            onClick={toggleActivities}
            aria-expanded={showActivities}
            className={['topbar-button justify-self-start', showActivities ? 'topbar-button-active' : ''].join(' ')}
          >
            <span className={['h-1.5 w-1.5 rounded-full', showActivities ? 'bg-[var(--accent)]' : 'bg-emerald-400'].join(' ')} />
            <span>Activities</span>
          </button>

          <button
            type="button"
            onClick={toggleCalendar}
            aria-label={'Open calendar. ' + clockFormat.format(time)}
            aria-expanded={showCalendar}
            className={['topbar-button topbar-clock justify-self-center', showCalendar ? 'topbar-button-active' : ''].join(' ')}
          >
            {clockFormat.format(time)}
          </button>

          <button
            type="button"
            onClick={toggleControlCenter}
            aria-label={'Quick settings. Browser ' + (online ? 'online' : 'offline')}
            aria-expanded={showControlCenter}
            title="Browser connection status and appearance"
            className={['topbar-button justify-self-end', showControlCenter ? 'topbar-button-active' : ''].join(' ')}
          >
            {online ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
            <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
          </button>
        </div>
      </div>

      <CalendarPanel isVisible={showCalendar} />
      <ControlCenter isVisible={showControlCenter} />
      <ActivitiesPanel isVisible={showActivities} />
    </>
  );
}
