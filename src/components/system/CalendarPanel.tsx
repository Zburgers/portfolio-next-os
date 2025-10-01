'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, BellOff, Cloud } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface CalendarPanelProps {
  isVisible: boolean;
}

export default function CalendarPanel({ isVisible }: CalendarPanelProps) {
  const { closePanels } = useDesktop();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  if (!isVisible) return null;

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const formatDateHeader = (date: Date) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const yearStr = date.getFullYear().toString();
    return { weekday, monthDay, year: yearStr };
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate();

      const isSelected = 
        year === selectedDate.getFullYear() &&
        month === selectedDate.getMonth() &&
        day === selectedDate.getDate();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-day ${isToday ? 'calendar-day-today' : ''} ${isSelected ? 'calendar-day-selected' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const { weekday, monthDay, year: yearStr } = formatDateHeader(today);

  // Sample events - in real implementation, this would be filtered by selectedDate
  const sampleEvents = selectedDate.getDate() === today.getDate() ? [
    { id: 1, title: "Aryaman's Birthday", time: "All day", type: "birthday" }
  ] : [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={closePanels}
      />
      
      {/* GNOME Calendar Panel */}
      <div className="calendar-dropdown">
        <div className="gnome-calendar-panel">
          
          {/* NEW WRAPPER - Main Content Body */}
          <div className="panel-body">

            {/* LEFT PANE (CALENDAR ONLY) */}
            <div className="left-pane">
              {/* Date Header */}
              <div className="calendar-header">
                <div className="text-sm font-medium text-secondary opacity-90">{weekday}</div>
                <div className="text-2xl font-bold text-primary">{monthDay}</div>
                <div className="text-lg font-medium text-secondary">{yearStr}</div>
              </div>

              {/* Calendar Widget */}
              <div className="calendar-section">
                {/* Month Navigation */}
                <div className="calendar-nav">
                  <button onClick={goToPreviousMonth} className="nav-button">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="text-sm font-semibold text-primary">
                    {monthNames[month]} {year}
                  </div>
                  
                  <button onClick={goToNextMonth} className="nav-button">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="calendar-day-headers">
                  {dayNames.map(day => (
                    <div key={day} className="day-header">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>

            {/* RIGHT PANE (SCROLLABLE CONTENT) */}
            <div className="right-pane">
              {/* Events/Agenda Section */}
              <div className="agenda-section">
                <h3 className="section-title">Today</h3>
                {sampleEvents.length > 0 ? (
                  <div className="events-list">
                    {sampleEvents.map(event => (
                      <div key={event.id} className="event-item">
                        <div className="event-dot"></div>
                        <div className="event-content">
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">{event.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-events">No events today</div>
                )}
              </div>

              {/* Weather Widget Placeholder */}
              <div className="weather-section">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-secondary" />
                  <h3 className="section-title">Weather</h3>
                </div>
                <div className="weather-content">
                  <div className="text-sm text-secondary">Chennai</div>
                  <div className="text-xs text-muted">Clear sky • 28°C</div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="notifications-section">
                <h3 className="section-title">Notifications</h3>
                <div className="notifications-empty">
                  <div className="empty-notification-icon">
                    <Bell className="w-8 h-8 text-muted" />
                  </div>
                  <div className="text-sm text-muted">No Notifications</div>
                </div>
              </div>

              {/* Do Not Disturb Toggle */}
              <div className="dnd-section">
                <div className="dnd-toggle">
                  <div className="flex items-center gap-2">
                    {doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span className="text-sm font-medium">Do Not Disturb</span>
                  </div>
                  <button
                    onClick={() => setDoNotDisturb(!doNotDisturb)}
                    className={`toggle-switch ${doNotDisturb ? 'toggle-active' : ''}`}
                  >
                    <div className="toggle-thumb"></div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}