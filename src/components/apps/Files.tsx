'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Clock, 
  Star, 
  Wifi, 
  Trash2, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music,
  Folder,
  Grid3X3,
  List,
  Search,
  MoreHorizontal,
  ChevronRight,
  HardDrive
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  itemCount?: number;
}

const folders: FileItem[] = [
  { name: 'AnythingLLMDesktop', type: 'folder', itemCount: 2 },
  { name: 'Apps', type: 'folder', itemCount: 1 },
  { name: 'Desktop', type: 'folder', itemCount: 26 },
  { name: 'dist-installer-cli-download', type: 'folder', itemCount: 1 },
  { name: 'Documents', type: 'folder', itemCount: 16 },
  { name: 'dotfiles', type: 'folder', itemCount: 5 },
  { name: 'Downloads', type: 'folder', itemCount: 162 },
  { name: 'Games', type: 'folder', itemCount: 1 },
];

export default function Files() {
  const [currentPath, setCurrentPath] = useState('Home');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const sidebarItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Clock, label: 'Recent', active: false },
    { icon: Star, label: 'Starred', active: false },
    { icon: Wifi, label: 'Network', active: false },
    { icon: Trash2, label: 'Trash', active: false },
    { icon: Download, label: 'Downloads', active: false },
    { icon: FileText, label: 'Documents', active: false },
    { icon: Image, label: 'Pictures', active: false },
    { icon: Video, label: 'Videos', active: false },
    { icon: Music, label: 'Music', active: false },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4 rotate-180 text-gray-600" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="ml-4 text-sm font-medium text-gray-700">
            {currentPath}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <Search className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex bg-gray-100 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">FAVORITES</h2>
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                    item.active 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">162 GB available</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentPath}</h1>
              <p className="text-gray-500">{folders.length} items</p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-6 gap-4">
                {folders.map((folder, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(folder.name)}
                    onDoubleClick={() => {
                      if (folder.type === 'folder') {
                        setCurrentPath(folder.name);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      selectedItem === folder.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Folder className="w-12 h-12 text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-gray-900 truncate w-full">
                        {folder.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {folder.itemCount} items
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(folder.name)}
                    onDoubleClick={() => {
                      if (folder.type === 'folder') {
                        setCurrentPath(folder.name);
                      }
                    }}
                    className={`w-full flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                      selectedItem === folder.name
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <Folder className={`w-5 h-5 ${selectedItem === folder.name ? 'text-white' : 'text-blue-500'}`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{folder.name}</div>
                    </div>
                    <div className={`text-sm ${selectedItem === folder.name ? 'text-blue-100' : 'text-gray-500'}`}>
                      {folder.itemCount} items
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}