'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type BootPhase = 'DEVICE_CHECK' | 'GRUB' | 'KERNEL_BOOT' | 'LOGIN' | 'DESKTOP';
export type DeviceType = 'mobile' | 'desktop';

interface SystemBootState {
  phase: BootPhase;
  deviceType: DeviceType;
  skipWelcome: boolean;
  isFirstVisit: boolean;
  isInitialized: boolean;
}

interface SystemBootContextType extends SystemBootState {
  advancePhase: () => void;
  skipToDesktop: () => void;
  setSkipWelcome: (skip: boolean) => void;
  login: () => void;
}

const SystemBootContext = createContext<SystemBootContextType | undefined>(undefined);

const WELCOME_SKIP_KEY = 'portfolio-skip-welcome';
const FIRST_VISIT_KEY = 'portfolio-visited';

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function getStoredSkipWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(WELCOME_SKIP_KEY) === 'true';
}

function getIsFirstVisit(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FIRST_VISIT_KEY) !== 'true';
}

export function SystemBootProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemBootState>({
    phase: 'DEVICE_CHECK',
    deviceType: 'desktop',
    skipWelcome: false,
    isFirstVisit: true,
    isInitialized: false,
  });

  // Initialize on mount
  useEffect(() => {
    const deviceType = getDeviceType();
    const skipWelcome = getStoredSkipWelcome();
    const isFirstVisit = getIsFirstVisit();

    // Mark as visited
    localStorage.setItem(FIRST_VISIT_KEY, 'true');

    setState(prev => ({
      ...prev,
      deviceType,
      skipWelcome,
      isFirstVisit,
      isInitialized: true,
      // If mobile, stay at device check (will render mobile view)
      // If desktop, move to GRUB
      phase: deviceType === 'mobile' ? 'DEVICE_CHECK' : 'GRUB',
    }));
  }, []);

  // Handle window resize for device type changes
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      setState(prev => {
        if (prev.deviceType !== newDeviceType) {
          return {
            ...prev,
            deviceType: newDeviceType,
            // Reset phase based on new device type
            phase: newDeviceType === 'mobile' ? 'DEVICE_CHECK' : 
                   prev.phase === 'DEVICE_CHECK' ? 'GRUB' : prev.phase,
          };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const advancePhase = useCallback(() => {
    setState(prev => {
      const phases: BootPhase[] = ['DEVICE_CHECK', 'GRUB', 'KERNEL_BOOT', 'LOGIN', 'DESKTOP'];
      const currentIndex = phases.indexOf(prev.phase);
      const nextIndex = Math.min(currentIndex + 1, phases.length - 1);
      return { ...prev, phase: phases[nextIndex] };
    });
  }, []);

  const skipToDesktop = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'DESKTOP' }));
  }, []);

  const login = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'DESKTOP' }));
  }, []);

  const setSkipWelcome = useCallback((skip: boolean) => {
    localStorage.setItem(WELCOME_SKIP_KEY, skip ? 'true' : 'false');
    setState(prev => ({ ...prev, skipWelcome: skip }));
  }, []);

  const contextValue: SystemBootContextType = {
    ...state,
    advancePhase,
    skipToDesktop,
    setSkipWelcome,
    login,
  };

  return (
    <SystemBootContext.Provider value={contextValue}>
      {children}
    </SystemBootContext.Provider>
  );
}

export function useSystemBoot() {
  const context = useContext(SystemBootContext);
  if (context === undefined) {
    throw new Error('useSystemBoot must be used within a SystemBootProvider');
  }
  return context;
}
