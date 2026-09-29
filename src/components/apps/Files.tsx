'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  FileCode,
  FileImage,
  FileText,
  File,
  Folder,
  Home,
  Image,
  Monitor,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { profile } from '@/lib/profile';

type ViewMode = 'grid' | 'list';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  extension?: string;
  content?: string;
  children?: FileNode[];
}

interface SidebarDestination {
  icon: LucideIcon;
  label: string;
  path: string[];
}

interface RecentItem {
  icon: LucideIcon;
  name: string;
  detail: string;
  path: string[];
  target?: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const fileTypeLabels: Record<string, string> = {
  pdf: 'PDF Document',
  jpg: 'JPEG Image',
  md: 'Markdown Document',
};

const fileSystem: FileNode = {
  name: 'Home',
  type: 'folder',
  children: [
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'resume.pdf', type: 'file', extension: 'pdf' },
        {
          name: 'README.md',
          type: 'file',
          extension: 'md',
          content: `${profile.name}\n\n${profile.title} based in ${profile.location}.\n\n${profile.summary}\n\nGitHub: ${profile.githubUrl}\nLinkedIn: ${profile.linkedinUrl}`,
        },
      ],
    },
    { name: 'Downloads', type: 'folder', children: [] },
    {
      name: 'Pictures',
      type: 'folder',
      children: [{ name: 'Fedora wallpaper.jpg', type: 'file', extension: 'jpg' }],
    },
    { name: 'Videos', type: 'folder', children: [] },
    { name: 'Desktop', type: 'folder', children: [] },
    { name: 'Trash', type: 'folder', children: [] },
  ],
};

const sidebarDestinations: SidebarDestination[] = [
  { icon: Home, label: 'Home', path: [] },
  { icon: FileText, label: 'Documents', path: ['Documents'] },
  { icon: Download, label: 'Downloads', path: ['Downloads'] },
  { icon: Image, label: 'Pictures', path: ['Pictures'] },
  { icon: Video, label: 'Videos', path: ['Videos'] },
  { icon: Monitor, label: 'Desktop', path: ['Desktop'] },
  { icon: Trash2, label: 'Trash', path: ['Trash'] },
];

const recentItems: RecentItem[] = [
  { icon: FileText, name: 'resume.pdf', detail: 'Documents', path: ['Documents'], target: 'resume.pdf' },
  { icon: FileCode, name: 'README.md', detail: 'Documents', path: ['Documents'], target: 'README.md' },
];

function buildPathFromSegments(segments: string[]): FileNode[] {
  let current = fileSystem;
  const chain: FileNode[] = [fileSystem];

  for (const segment of segments) {
    const next = current.children?.find(
      (child) => child.name === segment && child.type === 'folder',
    );
    if (!next) {
      return chain;
    }
    chain.push(next);
    current = next;
  }

  return chain;
}

function getNodeIcon(node: FileNode): { icon: LucideIcon; className: string } {
  if (node.type === 'folder') {
    return { icon: Folder, className: 'text-amber-600' };
  }

  switch (node.extension) {
    case 'pdf':
      return { icon: FileText, className: 'text-red-600' };
    case 'jpg':
      return { icon: FileImage, className: 'text-green-600' };
    case 'md':
      return { icon: FileCode, className: 'text-blue-600' };
    default:
      return { icon: File, className: 'text-[color:var(--text-secondary)]' };
  }
}

function getTypeLabel(node: FileNode): string {
  if (node.type === 'folder') {
    return 'Folder';
  }

  if (!node.extension) {
    return 'File';
  }

  return fileTypeLabels[node.extension] ?? `${node.extension.toUpperCase()} File`;
}

function getFolderSummary(node: FileNode): string {
  if (node.type === 'folder') {
    const count = node.children?.length ?? 0;
    return count === 1 ? '1 item' : `${count} items`;
  }

  return node.size ?? getTypeLabel(node);
}

export default function Files() {
  const { openWindow } = useDesktop();
  const [pathStack, setPathStack] = useState<FileNode[]>([fileSystem]);
  const [backStack, setBackStack] = useState<FileNode[][]>([]);
  const [forwardStack, setForwardStack] = useState<FileNode[][]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);

  const currentFolder = pathStack[pathStack.length - 1];
  const currentItems = useMemo(() => currentFolder.children ?? [], [currentFolder]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentItems;
    }

    const lowered = searchQuery.toLowerCase();
    return currentItems.filter((item) => item.name.toLowerCase().includes(lowered));
  }, [currentItems, searchQuery]);

  useEffect(() => {
    if (!pendingSelection) {
      return;
    }

    const match = currentItems.find((item) => item.name === pendingSelection);
    if (match) {
      setSelectedItem(buildNodeKey(match));
    }
    setPendingSelection(null);
  }, [currentItems, pendingSelection]);

  const canGoBack = backStack.length > 0;
  const canGoForward = forwardStack.length > 0;
  const canGoUp = pathStack.length > 1;

  function buildNodeKey(node: FileNode) {
    return [...pathStack.map((item) => item.name), node.name].join('/');
  }

  function handleNavigateTo(path: FileNode[]) {
    setBackStack((prev) => [...prev, [...pathStack]]);
    setPathStack(path);
    setForwardStack([]);
    setSelectedItem(null);
    setPendingSelection(null);
  }

  function handleOpenItem(node: FileNode) {
    if (node.type === 'folder') {
      const nextPath = [...pathStack, node];
      setBackStack((prev) => [...prev, [...pathStack]]);
      setPathStack(nextPath);
      setForwardStack([]);
      setSelectedItem(null);
      setPendingSelection(null);
    } else if (node.type === 'file') {
      // Handle file opening based on file extension
      const extension = node.name.split('.').pop()?.toLowerCase();
      
      // Text files that should open in text editor
      const textExtensions = ['txt', 'md', 'markdown', 'json', 'csv', 'xml', 'log', 'yaml', 'yml', 'conf', 'config', 'ini', 'env'];
      
      // Code files that should open in code editor
      const codeExtensions = ['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'vue', 'svelte'];
      
      if (node.name.toLowerCase() === 'resume.pdf') {
        window.open(profile.resumeUrl, '_blank', 'noopener,noreferrer');
      } else if (extension === 'jpg' || extension === 'png') {
        window.open('/F42-01-day.jpg', '_blank', 'noopener,noreferrer');
      } else if ((extension && textExtensions.includes(extension)) || (extension && codeExtensions.includes(extension))) {
        openWindow('text-editor', `Text Editor - ${node.name}`, {
          fileName: node.name,
          filePath: pathStack.map(p => p.name).join('/') + '/' + node.name,
          content: node.content ?? '',
        });
      }
      // For other file types, we could add more handlers here
    }
  }

  function handleBreadcrumbClick(index: number) {
    if (index === pathStack.length - 1) {
      return;
    }

    const targetPath = pathStack.slice(0, index + 1);
    setBackStack((prev) => [...prev, [...pathStack]]);
    setPathStack(targetPath);
    setForwardStack([]);
    setSelectedItem(null);
    setPendingSelection(null);
  }

  function handleGoBack() {
    if (!canGoBack) return;

    setBackStack((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      const previousPath = updated.pop();

      if (previousPath) {
        setForwardStack((forward) => [...forward, [...pathStack]]);
        setPathStack(previousPath);
        setSelectedItem(null);
        setPendingSelection(null);
      }

      return updated;
    });
  }

  function handleGoForward() {
    if (!canGoForward) return;

    setForwardStack((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      const nextPath = updated.pop();

      if (nextPath) {
        setBackStack((back) => [...back, [...pathStack]]);
        setPathStack(nextPath);
        setSelectedItem(null);
        setPendingSelection(null);
      }

      return updated;
    });
  }

  function handleGoUp() {
    if (!canGoUp) return;

    const targetPath = pathStack.slice(0, -1);
    setBackStack((prev) => [...prev, [...pathStack]]);
    setPathStack(targetPath);
    setForwardStack([]);
    setSelectedItem(null);
    setPendingSelection(null);
  }

  function handleGoHome() {
    if (pathStack.length === 1) return;

    handleNavigateTo([fileSystem]);
  }

  function handleSidebarNavigate(destination: SidebarDestination) {
    if (destination.path.length === 0 && destination.label !== 'Home') {
      return;
    }

    const targetPath = destination.path.length ? buildPathFromSegments(destination.path) : [fileSystem];

    if (targetPath.length === 0) {
      return;
    }

    setBackStack((prev) => [...prev, [...pathStack]]);
    setPathStack(targetPath);
    setForwardStack([]);
    setSelectedItem(null);
    setPendingSelection(null);
  }

  function handleOpenRecent(item: RecentItem) {
    const targetPath = item.path.length ? buildPathFromSegments(item.path) : [fileSystem];

    setBackStack((prev) => [...prev, [...pathStack]]);
    setPathStack(targetPath);
    setForwardStack([]);
    setSelectedItem(null);
    setPendingSelection(item.target ?? null);
  }

  const selectionSummary = selectedItem
    ? '1 item selected'
    : `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg window-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-color bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Navigation Pills */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleGoBack}
              disabled={!canGoBack}
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded text-lg transition-colors duration-200',
                canGoBack
                  ? 'hover:bg-surface-hover text-primary'
                  : 'text-muted cursor-not-allowed'
              )}
          aria-label="Go back"
          >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleGoForward}
              disabled={!canGoForward}
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded text-lg transition-colors duration-200',
                canGoForward
                  ? 'hover:bg-surface-hover text-primary'
                  : 'text-muted cursor-not-allowed'
              )}
              aria-label="Go forward"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleGoUp}
              disabled={!canGoUp}
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded text-lg transition-colors duration-200',
                canGoUp
                  ? 'hover:bg-surface-hover text-primary'
                  : 'text-muted cursor-not-allowed'
              )}
              aria-label="Go up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          {/* Current Folder Name */}
          <div className="ml-4 text-lg font-medium text-primary">
            {currentFolder.name}
            <span className="ml-3 hidden text-xs font-normal text-secondary sm:inline">Curated portfolio files · browser preview</span>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2">
          <label className="flex h-8 items-center gap-2 rounded border border-color px-2 text-secondary">
            <Search className="h-3.5 w-3.5" />
            <input
              aria-label="Search this folder"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="w-24 bg-transparent text-sm text-primary outline-none placeholder:text-muted sm:w-36"
            />
          </label>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cx(
              'flex h-8 w-8 items-center justify-center rounded text-sm transition-colors duration-200',
              viewMode === 'grid' ? 'bg-accent-soft text-primary' : 'hover:bg-surface-hover'
            )}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cx(
              'flex h-8 w-8 items-center justify-center rounded text-sm transition-colors duration-200',
              viewMode === 'list' ? 'bg-accent-soft text-primary' : 'hover:bg-surface-hover'
            )}
            aria-label="List view"
          >
            ≡
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - GLASSMORPHISM */}
        <aside className="hidden lg:flex w-64 flex-col sidebar-surface border-r border-color">
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Places
              </p>
              <div className="space-y-1">
                {sidebarDestinations.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path.length
                    ? pathStack[pathStack.length - 1].name === item.path[item.path.length - 1]
                    : pathStack.length === 1;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSidebarNavigate(item)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded px-3 py-3 text-sm font-medium transition-colors duration-200',
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-secondary hover:bg-surface-hover hover:text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Quick access
              </p>
              <div className="space-y-1">
                {recentItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleOpenRecent(item)}
                      className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-secondary transition-colors duration-200 hover:bg-surface-hover hover:text-primary"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">
                        <span className="block font-medium">{item.name}</span>
                        <span className="text-xs text-muted">{item.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-color px-4 py-4">
            <div className="rounded bg-surface-muted p-3">
              <div className="flex items-center justify-between text-xs font-medium text-secondary mb-2">
                <span>Browser preview</span>
              </div>
              <p className="text-xs leading-5 text-muted">This file browser cannot read your device storage.</p>
            </div>
          </div>
        </aside>

        {/* Main Content - SOLID BACKGROUND */}
        <main className="flex-1 overflow-hidden bg-surface">
          <div className="flex h-full flex-col">
            <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-2 border-b border-color pb-4 mb-4">
                <h1 className="text-xl font-semibold text-primary">
                  {currentFolder.name}
                </h1>
                <p className="text-sm text-secondary">
                  {getFolderSummary({ ...currentFolder, type: 'folder' })}
                </p>
              </div>

              {filteredItems.length === 0 ? (
                <div className="mt-8 flex h-32 flex-col items-center justify-center rounded border border-dashed border-color bg-surface-muted text-center text-sm text-secondary">
                  No items match "{searchQuery}".
                  <span className="mt-1 text-xs text-muted">Try a different search term or clear the filter.</span>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item) => {
                    const Icon = getNodeIcon(item).icon;
                    const iconColor = getNodeIcon(item).className;
                    const key = buildNodeKey(item);
                    const isSelected = selectedItem === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedItem(key)}
                        onDoubleClick={() => handleOpenItem(item)}
                        onKeyDown={(event) => { if (event.key === 'Enter') handleOpenItem(item); }}
                        className={cx(
                          'group flex flex-col gap-3 rounded p-4 text-left transition-all duration-200',
                          isSelected
                            ? 'border border-accent bg-accent-soft'
                            : 'hover:bg-surface-hover'
                        )}
                      >
                        <span className={cx('flex h-12 w-12 items-center justify-center rounded', iconColor)}>
                          <Icon className="h-8 w-8" />
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold leading-tight text-primary">
                            {item.name}
                          </span>
                          <span className="text-xs text-secondary">
                            {getFolderSummary(item)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded border border-color bg-surface">
                  <div className="grid grid-cols-[minmax(0,2fr)_120px_150px] gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted border-b border-color">
                    <span>Name</span>
                    <span>Size</span>
                    <span>Type</span>
                  </div>
                  <div className="divide-y border-color">
                    {filteredItems.map((item) => {
                      const { icon: Icon, className } = getNodeIcon(item);
                      const key = buildNodeKey(item);
                      const isSelected = selectedItem === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedItem(key)}
                          onDoubleClick={() => handleOpenItem(item)}
                          onKeyDown={(event) => { if (event.key === 'Enter') handleOpenItem(item); }}
                          className={cx(
                            'grid w-full grid-cols-[minmax(0,2fr)_120px_150px] items-center gap-2 px-4 py-3 text-left text-sm transition-colors duration-200',
                            isSelected
                              ? 'bg-accent text-white'
                              : 'hover:bg-surface-hover'
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cx('flex h-8 w-8 items-center justify-center rounded', className)}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className={cx('truncate font-medium', isSelected ? 'text-white' : 'text-primary')}>{item.name}</span>
                          </span>
                          <span className={cx('text-sm', isSelected ? 'text-white/80' : 'text-secondary')}>
                            {item.type === 'folder' ? '—' : item.size ?? '—'}
                          </span>
                          <span className={cx('text-sm', isSelected ? 'text-white/80' : 'text-secondary')}>
                            {getTypeLabel(item)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-color bg-surface px-4 py-3 text-sm text-secondary">
              {selectionSummary}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
