// Desktop app icons data - using the same icons as dock for consistency
export interface DesktopApp {
  id: string;
  name: string;
  appType: string;
  title: string;
  iconType: 'image' | 'gradient';
  iconSrc?: string;
  iconGradient?: string;
  iconComponent?: string; // For Lucide icon names
  priority?: number; // For ordering on desktop (lower numbers appear first)
}

export const desktopApps: DesktopApp[] = [
  {
    id: 'files',
    name: 'Files',
    iconType: 'image',
    iconSrc: '/dock/files.svg',
    appType: 'files',
    title: 'Files',
    priority: 1
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    iconType: 'image',
    iconSrc: '/dock/portfolio.svg',
    appType: 'portfolio',
    title: 'Portfolio',
    priority: 2
  },
  {
    id: 'terminal',
    name: 'Terminal',
    iconType: 'gradient',
    iconGradient: 'bg-[#18181b]',
    iconComponent: 'TerminalSquare',
    appType: 'terminal',
    title: 'Terminal',
    priority: 3
  },
  {
    id: 'code',
    name: 'Code Editor',
    iconType: 'image',
    iconSrc: '/dock/code.svg',
    appType: 'code-editor',
    title: 'Code Editor',
    priority: 4
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    iconType: 'gradient',
    iconGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
    iconComponent: 'FileText',
    appType: 'text-editor',
    title: 'Text Editor',
    priority: 5
  },
  {
    id: 'settings',
    name: 'Settings',
    iconType: 'gradient',
    iconGradient: 'bg-gradient-to-br from-[#60a5fa] via-[#6366f1] to-[#a855f7]',
    iconComponent: 'Settings2',
    appType: 'settings',
    title: 'Settings',
    priority: 6
  },
  {
    id: 'system-monitor',
    name: 'Monitor',
    iconType: 'gradient',
    iconGradient: 'bg-gradient-to-br from-green-400 to-emerald-500',
    iconComponent: 'Gauge',
    appType: 'system-monitor',
    title: 'System Monitor',
    priority: 7
  },
  {
    id: 'trash',
    name: 'Trash',
    iconType: 'gradient',
    iconGradient: 'bg-gradient-to-br from-gray-600 to-gray-700',
    iconComponent: 'Trash2',
    appType: 'trash',
    title: 'Trash',
    priority: 8
  }
];