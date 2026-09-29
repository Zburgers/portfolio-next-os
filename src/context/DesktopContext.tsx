'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, ReactNode } from 'react';

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
  | { type: 'CLOSE_PANELS' };

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
};

const topmostWindowId = (windows: Window[]) => windows
  .filter((window) => !window.minimized)
  .reduce<Window | null>((top, window) => !top || window.zIndex > top.zIndex ? window : top, null)?.id ?? null;

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
      const width = Math.max(0, Math.min(920, action.viewportWidth - 32));
      const height = Math.max(0, Math.min(620, action.viewportHeight - topBarHeight - dockSpace));
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
          ? topmostWindowId(filteredWindows)
          : state.activeWindowId,
      };
    }

    case 'FOCUS_WINDOW': {
      const maxZ = state.windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w
        ),
        activeWindowId: action.id,
        showCalendar: false,
        showControlCenter: false,
        showActivities: false,
      };
    }

    case 'UPDATE_WINDOW': {
      const maxZ = state.windows.reduce((max, window) => Math.max(max, window.zIndex), 0);
      const windows = state.windows.map((window) => window.id === action.id
        ? { ...window, ...action.updates, ...(action.updates.minimized === false ? { zIndex: maxZ + 1 } : {}) }
        : window
      );
      const activeWindowId = action.updates.minimized === true && state.activeWindowId === action.id
        ? topmostWindowId(windows)
        : action.updates.minimized === false ? action.id : state.activeWindowId;
      return {
        ...state,
        windows,
        activeWindowId,
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

    default:
      return state;
  }
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(desktopReducer, initialState);

  const openWindow = useCallback((appType: string, title: string, payload?: any) => {
    dispatch({
      type: 'OPEN_WINDOW',
      appType,
      title,
      payload,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  }, []);

  const closeWindow = useCallback((id: number) => {
    dispatch({ type: 'CLOSE_WINDOW', id });
  }, []);

  const focusWindow = useCallback((id: number) => {
    dispatch({ type: 'FOCUS_WINDOW', id });
  }, []);

  const updateWindow = useCallback((id: number, updates: Partial<Window>) => {
    dispatch({ type: 'UPDATE_WINDOW', id, updates });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', theme });
    try {
      localStorage.setItem('desktop-theme', theme);
    } catch {
      // Theme still applies for this browser session.
    }
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, []);

  const toggleCalendar = useCallback(() => {
    dispatch({ type: 'TOGGLE_CALENDAR' });
  }, []);

  const toggleControlCenter = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONTROL_CENTER' });
  }, []);

  const toggleActivities = useCallback(() => {
    dispatch({ type: 'TOGGLE_ACTIVITIES' });
  }, []);

  const closePanels = useCallback(() => {
    dispatch({ type: 'CLOSE_PANELS' });
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
  }, [setTheme]);

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

  const contextValue = useMemo<DesktopContextType>(() => ({
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
  }), [state, openWindow, closeWindow, focusWindow, updateWindow, setTheme, toggleCalendar, toggleControlCenter, toggleActivities, closePanels]);

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
