'use client';

import React, { useState } from 'react';
import { Folder, File, Home, User, Download, Image, Music, Video } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  icon: React.ReactNode;
  size?: string;
  modified?: string;
}

const mockFiles: FileItem[] = [
  { name: 'Documents', type: 'folder', icon: <Folder className="w-5 h-5 text-blue-400" /> },
  { name: 'Pictures', type: 'folder', icon: <Image className="w-5 h-5 text-green-400" /> },
  { name: 'Music', type: 'folder', icon: <Music className="w-5 h-5 text-purple-400" /> },
  { name: 'Videos', type: 'folder', icon: <Video className="w-5 h-5 text-red-400" /> },
  { name: 'Downloads', type: 'folder', icon: <Download className="w-5 h-5 text-yellow-400" /> },
  { name: 'README.md', type: 'file', icon: <File className="w-5 h-5 text-gray-400" />, size: '2.1 KB', modified: '2 days ago' },
  { name: 'package.json', type: 'file', icon: <File className="w-5 h-5 text-gray-400" />, size: '1.3 KB', modified: '5 days ago' },
  { name: 'portfolio.pdf', type: 'file', icon: <File className="w-5 h-5 text-gray-400" />, size: '845 KB', modified: '1 week ago' },
];

export default function Files() {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [files] = useState<FileItem[]>(mockFiles);

  return (
    <div className="h-full bg-gray-900/95 text-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <button className="p-3 hover:bg-gray-700/70 rounded-xl transition-all duration-200">
              <Home className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-gray-700/70 rounded-xl transition-all duration-200">
              <User className="w-5 h-5" />
            </button>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center text-base">
            <span className="text-gray-300 font-medium">{currentPath}</span>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">
            List
          </button>
          <button className="px-4 py-2 text-sm bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium">
            Grid
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-1">
        <div className="w-56 border-r border-gray-700/50 p-6 bg-gray-800/30">
          <nav className="space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
              Places
            </div>
            <button className="flex items-center space-x-4 w-full text-left p-3 rounded-xl hover:bg-gray-700/70 transition-all duration-200 group">
              <Home className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-base font-medium">Home</span>
            </button>
            <button className="flex items-center space-x-4 w-full text-left p-3 rounded-xl hover:bg-gray-700/70 transition-all duration-200 group">
              <Folder className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-base font-medium">Documents</span>
            </button>
            <button className="flex items-center space-x-4 w-full text-left p-3 rounded-xl hover:bg-gray-700/70 transition-all duration-200 group">
              <Download className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-base font-medium">Downloads</span>
            </button>
            <button className="flex items-center space-x-4 w-full text-left p-3 rounded-xl hover:bg-gray-700/70 transition-all duration-200 group">
              <Image className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-base font-medium">Pictures</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-5 p-4 rounded-xl hover:bg-gray-800/70 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-700/50"
              >
                <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {file.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium truncate group-hover:text-blue-300 transition-colors">
                    {file.name}
                  </div>
                  {file.type === 'file' && (
                    <div className="text-sm text-gray-400 mt-1">
                      File
                    </div>
                  )}
                </div>
                
                {file.size && (
                  <div className="text-sm text-gray-400 w-24 text-right font-medium">
                    {file.size}
                  </div>
                )}
                
                {file.modified && (
                  <div className="text-sm text-gray-400 w-32 text-right">
                    {file.modified}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-12 bg-gray-800/50 border-t border-gray-700/50 flex items-center justify-between px-6 text-sm text-gray-300">
        <span className="font-medium">{files.length} items</span>
        <span>
          {files.filter(f => f.type === 'folder').length} folders, {files.filter(f => f.type === 'file').length} files
        </span>
      </div>
    </div>
  );
}