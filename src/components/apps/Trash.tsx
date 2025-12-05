'use client';

import React, { useState, useEffect } from 'react';
import { FileImage, HardDrive, Trash2, Download, Monitor } from 'lucide-react';
import Image from 'next/image';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  extension?: string;
}

const TrashApp: React.FC = () => {
  // Windows 11 ISO file
  const [trashItems, setTrashItems] = useState<FileItem[]>([
    {
      name: 'Windows11.iso',
      type: 'file',
      extension: 'iso',
      size: '5.4 GB',
      modified: 'Dec 05, 2025',
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleOpenItem = (item: FileItem) => {
    // In a real implementation, this would open the file
    console.log(`Opening ${item.name}`);
  };

  const handleRestore = (item: FileItem) => {
    // In a real implementation, this would restore the file to its original location
    console.log(`Restoring ${item.name}`);
  };

  const handleDelete = (item: FileItem) => {
    // In a real implementation, this would permanently delete the file
    console.log(`Permanently deleting ${item.name}`);
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return { icon: HardDrive, className: 'text-amber-600' };
    }

    switch (item.extension) {
      case 'iso':
        return { icon: Download, className: 'text-purple-600' };
      case 'jpg':
      case 'png':
        return { icon: FileImage, className: 'text-green-600' };
      default:
        return { icon: Monitor, className: 'text-primary' };
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg window-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-color bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <div className="text-lg font-medium text-primary">Trash</div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex h-8 w-8 items-center justify-center rounded text-sm transition-colors duration-200 ${
              viewMode === 'grid' 
                ? 'bg-accent-soft text-primary' 
                : 'hover:bg-surface-hover'
            }`}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex h-8 w-8 items-center justify-center rounded text-sm transition-colors duration-200 ${
              viewMode === 'list' 
                ? 'bg-accent-soft text-primary' 
                : 'hover:bg-surface-hover'
            }`}
            aria-label="List view"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-surface">
        <div className="flex h-full flex-col">
          <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-2 border-b border-color pb-4 mb-4">
              <h1 className="text-xl font-semibold text-primary">Trash</h1>
              <p className="text-sm text-secondary">
                {trashItems.length} {trashItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {trashItems.length === 0 ? (
              <div className="mt-8 flex h-32 flex-col items-center justify-center rounded border border-dashed border-color bg-surface-muted text-center text-sm text-secondary">
                Trash is empty
                <span className="mt-1 text-xs text-muted">No deleted items</span>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {trashItems.map((item, index) => {
                  const { icon: Icon, className } = getFileIcon(item);
                  const isSelected = selectedItem === item.name;

                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className={`group flex flex-col gap-3 rounded p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border border-accent bg-accent-soft'
                          : 'hover:bg-surface-hover'
                      }`}
                    >
                      {item.name.toLowerCase().includes('windows') && item.extension === 'iso' ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded">
                          <Image
                            src="/windows-logo.svg"
                            alt="Windows Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                          />
                        </div>
                      ) : (
                        <div className={`${className} flex h-12 w-12 items-center justify-center rounded`}>
                          <Icon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold leading-tight text-primary">
                          {item.name}
                        </span>
                        <span className="text-xs text-secondary">
                          {item.size ? item.size : '—'}
                        </span>
                      </div>

                      {/* Action buttons for trash items */}
                      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(item)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded border border-color bg-surface">
                <div className="grid grid-cols-[minmax(0,2fr)_120px_150px_150px] gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted border-b border-color">
                  <span>Name</span>
                  <span>Size</span>
                  <span>Type</span>
                  <span>Modified</span>
                </div>
                <div className="divide-y border-color">
                  {trashItems.map((item, index) => {
                    const { icon: Icon, className } = getFileIcon(item);
                    const isSelected = selectedItem === item.name;

                    return (
                      <div
                        key={`${item.name}-${index}`}
                        className={`grid grid-cols-[minmax(0,2fr)_120px_150px_150px] items-center gap-2 px-4 py-3 text-left text-sm ${
                          isSelected
                            ? 'bg-accent text-white'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.name.toLowerCase().includes('windows') && item.extension === 'iso' ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded">
                              <Image
                                src="/windows-logo.svg"
                                alt="Windows Logo"
                                width={24}
                                height={24}
                                className="h-4 w-4"
                              />
                            </div>
                          ) : (
                            <div className={`${className} flex h-8 w-8 items-center justify-center rounded`}>
                              <Icon className="h-4 w-4" />
                            </div>
                          )}
                          <span className={`${isSelected ? 'text-white' : 'text-primary'} font-medium`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={isSelected ? 'text-white/80' : 'text-secondary'}>
                          {item.size ? item.size : '—'}
                        </span>
                        <span className={isSelected ? 'text-white/80' : 'text-secondary'}>
                          {item.extension ? `${item.extension.toUpperCase()} File` : 'File'}
                        </span>
                        <span className={isSelected ? 'text-white/80' : 'text-secondary'}>
                          {item.modified ? item.modified : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-color bg-surface px-4 py-3 text-sm text-secondary">
            {selectedItem ? '1 item selected' : `${trashItems.length} item${trashItems.length === 1 ? '' : 's'}`}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrashApp;