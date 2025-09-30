'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface CalendarPanelProps {
  isVisible: boolean;
}

export default function CalendarPanel({ isVisible }: CalendarPanelProps) {
  const { closePanels } = useDesktop();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
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

      days.push(
        <button
          key={day}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 hover:bg-glass-hover ${
            isToday 
              ? 'bg-accent text-white shadow-lg' 
              : 'text-text-primary hover:text-accent'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={closePanels}
      />
      
      {/* Calendar Panel */}
      <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 w-80">
        <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Date Header */}
          <div className="p-6 border-b border-glass-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {today.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-text-secondary text-sm mt-1">
                {today.getFullYear()}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="w-8 h-8 rounded-full hover:bg-glass-hover flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-primary" />
              </button>
              
              <div className="text-lg font-semibold text-text-primary">
                {monthNames[month]} {year}
              </div>
              
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 rounded-full hover:bg-glass-hover flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-primary" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="border-t border-glass-border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-text-secondary" />
              <h3 className="font-semibold text-text-primary">Notifications</h3>
            </div>
            
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-glass-bg rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-text-secondary" />
              </div>
              <p className="text-text-secondary text-sm">No new notifications</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}