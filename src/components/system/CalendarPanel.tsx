'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface CalendarPanelProps {
  isVisible: boolean;
}

export default function CalendarPanel({ isVisible }: CalendarPanelProps) {
  const { closePanels } = useDesktop();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(() => new Date());
  const [reminders, setReminders] = useState<Array<{ id: string; date: string; title: string }>>([]);
  const [draftReminder, setDraftReminder] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    try {
      const stored = localStorage.getItem('portfolio-os-calendar-reminders');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setReminders(parsed.filter((item): item is { id: string; date: string; title: string } =>
          typeof item?.id === 'string' && typeof item?.date === 'string' && typeof item?.title === 'string'
        ));
      }
    } catch {
      setReminders([]);
    }
    return () => window.clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const today = now;
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

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const localDateKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const selectedDateKey = localDateKey(selectedDate);
  const selectedReminders = useMemo(() => reminders.filter((item) => item.date === selectedDateKey), [reminders, selectedDateKey]);

  const saveReminders = (next: typeof reminders) => {
    setReminders(next);
    try {
      localStorage.setItem('portfolio-os-calendar-reminders', JSON.stringify(next));
    } catch {
      // Reminders remain available for this session if browser storage is blocked.
    }
  };

  const addReminder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draftReminder.trim();
    if (!title) return;
    saveReminders([...reminders, { id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), date: selectedDateKey, title }]);
    setDraftReminder('');
  };

  // Get week number for a given date
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const renderCalendarRows = () => {
    const rows = [];
    const totalCells = firstDayWeekday + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);
    
    let dayCounter = 1;
    
    for (let row = 0; row < totalRows; row++) {
      const cells = [];
      
      // Calculate week number for this row
      let weekDate: Date | null = null;
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        if (cellIndex >= firstDayWeekday && dayCounter <= daysInMonth) {
          weekDate = new Date(year, month, dayCounter);
          break;
        }
      }
      const weekNum = weekDate ? getWeekNumber(weekDate) : '';
      
      // Add week number column
      cells.push(
        <div key={`week-${row}`} className="calendar-week-num">
          {weekNum}
        </div>
      );
      
      // Add day cells
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        
        if (cellIndex < firstDayWeekday || dayCounter > daysInMonth) {
          // Get days from previous/next month
          let displayDay = '';
          if (cellIndex < firstDayWeekday) {
            // Previous month days
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            displayDay = String(prevMonthLastDay - (firstDayWeekday - cellIndex - 1));
          } else {
            // Next month days
            displayDay = String(dayCounter - daysInMonth);
            dayCounter++;
          }
          cells.push(
            <div key={`empty-${row}-${col}`} className="calendar-day calendar-day-other">
              {displayDay}
            </div>
          );
        } else {
          const day = dayCounter;
          const isToday = 
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate();

          const isSelected = 
            year === selectedDate.getFullYear() &&
            month === selectedDate.getMonth() &&
            day === selectedDate.getDate();

          cells.push(
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              type="button"
              aria-label={new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              className={`calendar-day ${isToday ? 'calendar-day-today' : ''} ${isSelected && !isToday ? 'calendar-day-selected' : ''}`}
            >
              {day}
              {isToday && <span className="calendar-today-dot"></span>}
            </button>
          );
          dayCounter++;
        }
      }
      
      rows.push(
        <div key={`row-${row}`} className="calendar-row">
          {cells}
        </div>
      );
    }
    
    return rows;
  };

  const formatDateHeader = () => {
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const yearStr = today.getFullYear();
    return { weekday, monthName, day, year: yearStr };
  };

  const { weekday, monthName, day, year: yearStr } = formatDateHeader();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={closePanels}
      />
      
      {/* GNOME Calendar Panel - Single Column Layout */}
      <div className="calendar-dropdown">
        <div className="gnome-calendar-panel">
          {/* Date Header */}
          <div className="calendar-date-header">
            <div className="calendar-weekday">{weekday}</div>
            <div className="calendar-full-date">
              {monthName} {day} {yearStr}
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="calendar-widget">
            {/* Month Navigation */}
            <div className="calendar-month-nav">
                <button type="button" onClick={goToPreviousMonth} aria-label="Previous month" className="calendar-nav-btn">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="calendar-month-title">
                {monthNames[month]}
              </div>
              
              <button type="button" onClick={goToNextMonth} aria-label="Next month" className="calendar-nav-btn">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Headers with week number column */}
            <div className="calendar-header-row">
              <div className="calendar-week-num-header"></div>
              {dayNames.map((day, idx) => (
                <div key={idx} className="calendar-day-header">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-body">
              {renderCalendarRows()}
            </div>
          </div>

          <div className="calendar-events-section">
            <div className="calendar-events-header">{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
            <form className="calendar-reminder-form" onSubmit={addReminder}>
              <input
                value={draftReminder}
                onChange={(event) => setDraftReminder(event.target.value)}
                aria-label="New reminder"
                placeholder="Add a reminder"
                maxLength={120}
              />
              <button type="submit" aria-label="Save reminder" disabled={!draftReminder.trim()}><Plus size={15} /></button>
            </form>
            <ul className="calendar-reminder-list">
              {selectedReminders.length ? selectedReminders.map((item) => (
                <li key={item.id}>
                  <span>{item.title}</span>
                  <button type="button" aria-label={'Delete reminder: ' + item.title} onClick={() => saveReminders(reminders.filter((reminder) => reminder.id !== item.id))}><Trash2 size={14} /></button>
                </li>
              )) : <li className="calendar-no-events">No reminders for this day</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
