'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, BellOff } from 'lucide-react';
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
              <button onClick={goToPreviousMonth} className="calendar-nav-btn">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="calendar-month-title">
                {monthNames[month]}
              </div>
              
              <button onClick={goToNextMonth} className="calendar-nav-btn">
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

          {/* Events Section */}
          <div className="calendar-events-section">
            <div className="calendar-events-header">Today</div>
            <div className="calendar-no-events">No events scheduled</div>
          </div>

          {/* Notifications Section */}
          <div className="calendar-notifications">
            <div className="notifications-empty-state">
              <Bell className="w-10 h-10 text-muted opacity-40" />
              <span className="text-sm text-muted">No Notifications</span>
            </div>
          </div>

          {/* Do Not Disturb Toggle */}
          <div className="calendar-dnd">
            <div className="dnd-row">
              <div className="dnd-label">
                {doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                <span>Do Not Disturb</span>
              </div>
              <button
                onClick={() => setDoNotDisturb(!doNotDisturb)}
                className={`dnd-toggle-switch ${doNotDisturb ? 'dnd-toggle-active' : ''}`}
              >
                <div className="dnd-toggle-thumb"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}