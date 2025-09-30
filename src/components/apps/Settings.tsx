'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Volume2, 
  Monitor, 
  Shield, 
  Info,
  Wifi,
  Bluetooth
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'appearance',
    name: 'Appearance',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'network',
    name: 'Network',
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: <Volume2 className="w-6 h-6" />,
    color: 'bg-gray-600'
  },
  {
    id: 'display',
    name: 'Display',
    icon: <Monitor className="w-6 h-6" />,
    color: 'bg-gray-500'
  },
  {
    id: 'privacy',
    name: 'Privacy',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-yellow-600'
  },
  {
    id: 'about',
    name: 'About',
    icon: <Info className="w-6 h-6" />,
    color: 'bg-blue-600'
  }
];

export default function Settings() {
  const { theme, setTheme } = useDesktop();
  const [activeSection, setActiveSection] = useState('appearance');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Appearance</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Theme</h3>
              <div className="grid grid-cols-3 gap-6 max-w-2xl">
                <button
                  onClick={() => setTheme('light')}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-32 bg-white rounded-lg shadow-sm mb-4 border border-gray-200"></div>
                  <p className="text-base font-medium text-gray-900">Light</p>
                  {theme === 'light' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-32 bg-gray-900 rounded-lg shadow-sm mb-4 border border-gray-700"></div>
                  <p className="text-base font-medium text-gray-900">Dark</p>
                  {theme === 'dark' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  className="relative p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg shadow-sm mb-4"></div>
                  <p className="text-base font-medium text-gray-900">Auto</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Network</h2>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">WiFi</h3>
                      <p className="text-sm text-gray-600">YourNetwork</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Connected</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                    <Bluetooth className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bluetooth</h3>
                    <p className="text-sm text-gray-600">Off</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">About</h2>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mr-6">
                  <span className="text-3xl font-bold text-white">F</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Fedora Linux 39</h3>
                  <p className="text-lg text-gray-600">Workstation Edition</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Version</h4>
                  <p className="text-lg text-gray-900">39 (Workstation Edition)</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Kernel</h4>
                  <p className="text-lg text-gray-900">6.5.6-300.fc39.x86_64</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Desktop Environment</h4>
                  <p className="text-lg text-gray-900">GNOME 45.1</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Memory</h4>
                  <p className="text-lg text-gray-900">16.0 GiB</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Storage</h4>
                  <p className="text-lg text-gray-900">512 GB SSD</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Graphics</h4>
                  <p className="text-lg text-gray-900">Intel UHD Graphics 620</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Panel</h3>
              <p className="text-gray-600">Select a category from the sidebar to configure your system.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl text-left transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeSection === section.id ? 'bg-white/20' : section.color
                }`}>
                  <div className={activeSection === section.id ? 'text-white' : 'text-white'}>
                    {section.icon}
                  </div>
                </div>
                <span className="font-medium">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderSectionContent()}
      </div>
    </div>
  );
}