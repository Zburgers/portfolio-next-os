'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface Window {
  id: number;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  payload?: any;
}

export type Theme = 'light' | 'dark' | 'system';

interface DesktopState {
  windows: Window[];
  activeWindowId: number | null;
  nextId: number;
  theme: Theme;
  showCalendar: boolean;
  showControlCenter: boolean;
  showActivities: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  airplaneMode: boolean;
}

type DesktopAction = 
  | { type: 'OPEN_WINDOW'; appType: string; title: string; payload?: any; viewportWidth: number; viewportHeight: number }
  | { type: 'CLOSE_WINDOW'; id: number }
  | { type: 'FOCUS_WINDOW'; id: number }
  | { type: 'UPDATE_WINDOW'; id: number; updates: Partial<Window> }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'TOGGLE_CALENDAR' }
  | { type: 'TOGGLE_CONTROL_CENTER' }
  | { type: 'TOGGLE_ACTIVITIES' }
  | { type: 'CLOSE_PANELS' }
  | { type: 'SET_WIFI'; enabled: boolean }
  | { type: 'SET_BLUETOOTH'; enabled: boolean }
  | { type: 'SET_AIRPLANE_MODE'; enabled: boolean };

interface DesktopContextType extends DesktopState {
  openWindow: (appType: string, title: string, payload?: any) => void;
  closeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  updateWindow: (id: number, updates: Partial<Window>) => void;
  setTheme: (theme: Theme) => void;
  toggleCalendar: () => void;
  toggleControlCenter: () => void;
  toggleActivities: () => void;
  closePanels: () => void;
  setWifiEnabled: (enabled: boolean) => void;
  setBluetoothEnabled: (enabled: boolean) => void;
  setAirplaneMode: (enabled: boolean) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const savedTheme = localStorage.getItem('desktop-theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') return savedTheme;
  } catch {
    // Use the system preference when browser storage is unavailable.
  }
  return 'system';
};

const initialState: DesktopState = {
  windows: [],
  activeWindowId: null,
  nextId: 1,
  theme: 'system',
  showCalendar: false,
  showControlCenter: false,
  showActivities: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  airplaneMode: false,
};

function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const maxZ = state.windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
      const isDocumentApp = action.appType === 'code-editor' || action.appType === 'text-editor';
      const existingWindow = state.windows.find((w) =>
        w.type === action.appType && (!isDocumentApp || w.title === action.title)
      );
      if (existingWindow) {
        return {
          ...state,
          windows: state.windows.map((w) => w.id === existingWindow.id
            ? { ...w, zIndex: maxZ + 1, minimized: false, title: action.title, payload: action.payload ?? w.payload }
            : w
          ),
          activeWindowId: existingWindow.id,
          showCalendar: false,
          showControlCenter: false,
          showActivities: false,
        };
      }

      const topBarHeight = 44;
      const dockSpace = action.appType === 'welcome' ? 24 : 96;
      const width = Math.min(920, Math.max(320, action.viewportWidth - 32));
      const height = Math.min(620, Math.max(320, action.viewportHeight - topBarHeight - dockSpace));
      const cascade = ((state.nextId - 1) % 6) * 22;
      const maxX = Math.max(16, action.viewportWidth - width - 16);
      const maxY = Math.max(topBarHeight + 8, action.viewportHeight - height - dockSpace);
      const newWindow: Window = {
        id: state.nextId,
        type: action.appType,
        title: action.title,
        x: Math.min(Math.max(16, (action.viewportWidth - width) / 2 + cascade), maxX),
        y: Math.min(topBarHeight + 10 + cascade, maxY),
        width,
        height,
        zIndex: maxZ + 1,
        minimized: false,
        maximized: false,
        payload: action.payload,
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        nextId: state.nextId + 1,
        showCalendar: false,
        showControlCenter: false,
        showActivities: false,
      };
    }

    case 'CLOSE_WINDOW': {
      const filteredWindows = state.windows.filter(w => w.id !== action.id);
      return {
        ...state,
        windows: filteredWindows,
        activeWindowId: state.activeWindowId === action.id 
          ? (filteredWindows.length > 0 ? filteredWindows[filteredWindows.length - 1].id : null)
          : state.activeWindowId,
      };
    }

    case 'FOCUS_WINDOW': {
      const maxZ = state.windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, zIndex: maxZ + 1 } : w
        ),
        activeWindowId: action.id,
        showCalendar: false,
        showControlCenter: false,
        showActivities: false,
      };
    }

    case 'UPDATE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, ...action.updates } : w
        ),
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        theme: action.theme,
      };
    }

    case 'TOGGLE_CALENDAR': {
      return {
        ...state,
        showCalendar: !state.showCalendar,
        showControlCenter: false,
        showActivities: false,
      };
    }

    case 'TOGGLE_CONTROL_CENTER': {
      return {
        ...state,
        showControlCenter: !state.showControlCenter,
        showCalendar: false,
        showActivities: false,
      };
    }

    case 'TOGGLE_ACTIVITIES': {
      return {
        ...state,
        showActivities: !state.showActivities,
        showCalendar: false,
        showControlCenter: false,
      };
    }

    case 'CLOSE_PANELS': {
      return {
        ...state,
        showCalendar: false,
        showControlCenter: false,
        showActivities: false,
      };
    }

    case 'SET_WIFI': {
      return {
        ...state,
        wifiEnabled: action.enabled,
        airplaneMode: action.enabled ? false : state.airplaneMode,
      };
    }

    case 'SET_BLUETOOTH': {
      return {
        ...state,
        bluetoothEnabled: action.enabled,
        airplaneMode: action.enabled ? false : state.airplaneMode,
      };
    }

    case 'SET_AIRPLANE_MODE': {
      const enabled = action.enabled;
      return {
        ...state,
        airplaneMode: enabled,
        wifiEnabled: enabled ? false : state.wifiEnabled,
        bluetoothEnabled: enabled ? false : state.bluetoothEnabled,
      };
    }

    default:
      return state;
  }
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(desktopReducer, initialState);

  const openWindow = (appType: string, title: string, payload?: any) => {
    dispatch({
      type: 'OPEN_WINDOW',
      appType,
      title,
      payload,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  };

  const closeWindow = (id: number) => {
    dispatch({ type: 'CLOSE_WINDOW', id });
  };

  const focusWindow = (id: number) => {
    dispatch({ type: 'FOCUS_WINDOW', id });
  };

  const updateWindow = (id: number, updates: Partial<Window>) => {
    dispatch({ type: 'UPDATE_WINDOW', id, updates });
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', theme });
    try {
      localStorage.setItem('desktop-theme', theme);
    } catch {
      // Theme still applies for this browser session.
    }
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  };

  const toggleCalendar = () => {
    dispatch({ type: 'TOGGLE_CALENDAR' });
  };

  const toggleControlCenter = () => {
    dispatch({ type: 'TOGGLE_CONTROL_CENTER' });
  };

  const toggleActivities = () => {
    dispatch({ type: 'TOGGLE_ACTIVITIES' });
  };

  const closePanels = () => {
    dispatch({ type: 'CLOSE_PANELS' });
  };

  const setWifiEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_WIFI', enabled });
  };

  const setBluetoothEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_BLUETOOTH', enabled });
  };

  const setAirplaneMode = (enabled: boolean) => {
    dispatch({ type: 'SET_AIRPLANE_MODE', enabled });
  };

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (state.theme !== 'system') return;
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const applyPreference = () => {
      if (preference.matches) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    };
    applyPreference();
    preference.addEventListener('change', applyPreference);
    return () => preference.removeEventListener('change', applyPreference);
  }, [state.theme]);

  const contextValue: DesktopContextType = {
    ...state,
    openWindow,
    closeWindow,
    focusWindow,
    updateWindow,
    setTheme,
    toggleCalendar,
    toggleControlCenter,
    toggleActivities,
    closePanels,
    setWifiEnabled,
    setBluetoothEnabled,
    setAirplaneMode,
  };

  return (
    <DesktopContext.Provider value={contextValue}>
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (context === undefined) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
}
