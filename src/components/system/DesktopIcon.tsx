'use client';

import React, { useState } from 'react';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  onDoubleClick?: () => void;
}

export default function DesktopIcon({ icon, label, onClick, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      className={`group flex flex-col items-center gap-2 rounded-lg p-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
        isSelected 
          ? 'bg-accent/20 ring-2 ring-accent/60' 
          : 'hover:bg-surface-hover/40 hover:backdrop-blur-sm'
      }`}
    >
      {/* Icon Container */}
      <div className="flex h-12 w-12 items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      
      {/* Label */}
      <span className="max-w-20 truncate text-xs font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-white">
        {label}
      </span>
    </button>
  );
}