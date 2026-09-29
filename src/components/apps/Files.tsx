'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  Download,
  ExternalLink,
  File,
  FileCode,
  FileImage,
  FileText,
  Folder,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Monitor,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { profile } from '@/lib/profile';
import { projects } from '@/lib/projects';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'type' | 'size';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  externalUrl?: string;
  sizeBytes?: number;
  children?: FileNode[];
}

interface SidebarDestination {
  icon: LucideIcon;
  label: string;
  path: string[];
}

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
const draftKey = (path: string) => `portfolio-text-editor:${path}`;

const projectFiles: FileNode[] = projects.map((project) => {
  const readme = [
    `# ${project.name}`,
    '',
    project.category,
    '',
    project.description,
    '',
    `## Built with\n${project.techStack.join(' · ')}`,
    project.githubUrl ? `\nRepository: ${project.githubUrl}` : '',
    project.liveUrl ? `\nLive site: ${project.liveUrl}` : '',
  ].filter(Boolean).join('\n');

  return {
    name: project.name,
    type: 'folder',
    children: [
      { name: 'README.md', type: 'file', extension: 'md', content: readme },
      ...(project.image ? [{
        name: `preview.${project.image.split('.').pop() ?? 'png'}`,
        type: 'file' as const,
        extension: project.image.split('.').pop()?.toLowerCase() ?? 'png',
        imageUrl: project.image,
        imageAlt: project.imageAlt,
      }] : []),
      ...(project.githubUrl ? [{ name: 'Repository.url', type: 'file' as const, extension: 'url', externalUrl: project.githubUrl, content: project.githubUrl }] : []),
      ...(project.liveUrl ? [{ name: 'Live site.url', type: 'file' as const, extension: 'url', externalUrl: project.liveUrl, content: project.liveUrl }] : []),
    ],
  };
});

const fileSystem: FileNode = {
  name: 'Home',
  type: 'folder',
  children: [
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'resume.pdf', type: 'file', extension: 'pdf', externalUrl: profile.resumeUrl, sizeBytes: 94705 },
        {
          name: 'README.md',
          type: 'file',
          extension: 'md',
          content: `# ${profile.name}\n\n${profile.title} based in ${profile.location}.\n\n${profile.summary}\n\n## Find me\n\nGitHub: ${profile.githubUrl}\nLinkedIn: ${profile.linkedinUrl}\nEmail: ${profile.email}`,
        },
        {
          name: 'Experience.md',
          type: 'file',
          extension: 'md',
          content: `# Experience\n\n${profile.experience.map((role) => `## ${role.role} · ${role.organization}\n${role.period} — ${role.type}\n\n${role.summary}`).join('\n\n')}`,
        },
        {
          name: 'Toolbox.md',
          type: 'file',
          extension: 'md',
          content: `# Toolbox\n\n${profile.capabilities.map(({ area, tools }) => `## ${area}\n${tools}`).join('\n\n')}`,
        },
      ],
    },
    { name: 'Projects', type: 'folder', children: projectFiles },
    {
      name: 'Pictures',
      type: 'folder',
      children: projects.filter((project) => project.image).map((project) => ({
        name: `${project.name}.${project.image?.split('.').pop() ?? 'png'}`,
        type: 'file' as const,
        extension: project.image?.split('.').pop()?.toLowerCase() ?? 'png',
        imageUrl: project.image,
        imageAlt: project.imageAlt,
      })),
    },
    { name: 'Downloads', type: 'folder', children: [] },
    { name: 'Videos', type: 'folder', children: [] },
    { name: 'Desktop', type: 'folder', children: [] },
    { name: 'Trash', type: 'folder', children: [] },
  ],
};

const sidebarDestinations: SidebarDestination[] = [
  { icon: Home, label: 'Home', path: [] },
  { icon: FileText, label: 'Documents', path: ['Documents'] },
  { icon: Folder, label: 'Projects', path: ['Projects'] },
  { icon: Download, label: 'Downloads', path: ['Downloads'] },
  { icon: ImageIcon, label: 'Pictures', path: ['Pictures'] },
  { icon: Video, label: 'Videos', path: ['Videos'] },
  { icon: Monitor, label: 'Desktop', path: ['Desktop'] },
  { icon: Trash2, label: 'Trash', path: ['Trash'] },
];

const recentFiles = [
  { name: 'README.md', path: ['Documents'], file: 'README.md' },
  { name: 'resume.pdf', path: ['Documents'], file: 'resume.pdf' },
];

function buildPathFromSegments(segments: string[]): FileNode[] {
  let current = fileSystem;
  const chain = [fileSystem];
  for (const segment of segments) {
    const next = current.children?.find((child) => child.name === segment && child.type === 'folder');
    if (!next) return [fileSystem];
    chain.push(next);
    current = next;
  }
  return chain;
}

function nodePath(pathStack: FileNode[], node: FileNode) {
  return [...pathStack.map((item) => item.name), node.name].join('/');
}

function getTypeLabel(node: FileNode): string {
  if (node.type === 'folder') return 'Folder';
  if (node.extension === 'url') return 'Internet shortcut';
  if (node.extension === 'pdf') return 'PDF document';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(node.extension ?? '')) return 'Image';
  return node.extension ? `${node.extension.toUpperCase()} document` : 'File';
}

function getNodeIcon(node: FileNode): { icon: LucideIcon; className: string } {
  if (node.type === 'folder') return { icon: Folder, className: 'text-amber-500' };
  if (node.extension === 'pdf') return { icon: FileText, className: 'text-red-500' };
  if (node.extension === 'md') return { icon: FileCode, className: 'text-sky-500' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(node.extension ?? '')) return { icon: FileImage, className: 'text-emerald-500' };
  if (node.extension === 'url') return { icon: ExternalLink, className: 'text-indigo-500' };
  return { icon: File, className: 'text-[color:var(--text-secondary)]' };
}

function formatSize(size?: number): string {
  if (!size) return '—';
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(size > 10240 ? 0 : 1)} KB`;
}

function contentFor(path: string, node: FileNode): string {
  try {
    return localStorage.getItem(draftKey(path)) ?? node.content ?? '';
  } catch {
    return node.content ?? '';
  }
}

export default function Files() {
  const { openWindow } = useDesktop();
  const [pathStack, setPathStack] = useState<FileNode[]>([fileSystem]);
  const [backStack, setBackStack] = useState<FileNode[][]>([]);
  const [forwardStack, setForwardStack] = useState<FileNode[][]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortDescending, setSortDescending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [savedFileRevision, setSavedFileRevision] = useState(0);

  const currentFolder = pathStack[pathStack.length - 1];
  const currentItems = currentFolder.children ?? [];
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const matches = currentItems.filter((item) => !query || item.name.toLocaleLowerCase().includes(query));
    const sorted = [...matches].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      const left = sortBy === 'name' ? a.name : sortBy === 'type' ? getTypeLabel(a) : String(a.sizeBytes ?? contentFor(nodePath(pathStack, a), a).length).padStart(12, '0');
      const right = sortBy === 'name' ? b.name : sortBy === 'type' ? getTypeLabel(b) : String(b.sizeBytes ?? contentFor(nodePath(pathStack, b), b).length).padStart(12, '0');
      return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }) * (sortDescending ? -1 : 1);
    });
    return sorted;
  }, [currentItems, pathStack, searchQuery, sortBy, sortDescending]);

  useEffect(() => {
    const onSavedFile = () => setSavedFileRevision((revision) => revision + 1);
    window.addEventListener('portfolio-file-saved', onSavedFile);
    return () => window.removeEventListener('portfolio-file-saved', onSavedFile);
  }, []);

  const selectedNode = currentItems.find((item) => nodePath(pathStack, item) === selectedKey) ?? null;
  const selectedContent = selectedNode && selectedNode.type === 'file'
    ? contentFor(nodePath(pathStack, selectedNode), selectedNode)
    : '';

  function navigate(path: FileNode[]) {
    if (path.map((item) => item.name).join('/') === pathStack.map((item) => item.name).join('/')) return;
    setBackStack((stack) => [...stack, pathStack]);
    setPathStack(path);
    setForwardStack([]);
    setSelectedKey(null);
    setSearchQuery('');
  }

  function openItem(node: FileNode) {
    if (node.type === 'folder') {
      navigate([...pathStack, node]);
      return;
    }

    if (node.externalUrl) {
      window.open(node.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (node.imageUrl) {
      window.open(node.imageUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const path = nodePath(pathStack, node);
    openWindow('text-editor', `Text Editor · ${node.name}`, {
      fileName: node.name,
      filePath: path,
      content: contentFor(path, node),
    });
  }

  function openRecent(item: (typeof recentFiles)[number]) {
    const path = buildPathFromSegments(item.path);
    setBackStack((stack) => [...stack, pathStack]);
    setPathStack(path);
    setForwardStack([]);
    setSearchQuery('');
    const file = path.at(-1)?.children?.find((node) => node.name === item.file);
    setSelectedKey(file ? nodePath(path, file) : null);
  }

  function goBack() {
    const previous = backStack.at(-1);
    if (!previous) return;
    setBackStack((stack) => stack.slice(0, -1));
    setForwardStack((stack) => [...stack, pathStack]);
    setPathStack(previous);
    setSelectedKey(null);
  }

  function goForward() {
    const next = forwardStack.at(-1);
    if (!next) return;
    setForwardStack((stack) => stack.slice(0, -1));
    setBackStack((stack) => [...stack, pathStack]);
    setPathStack(next);
    setSelectedKey(null);
  }

  function goUp() {
    if (pathStack.length > 1) navigate(pathStack.slice(0, -1));
  }

  function navigateSidebar(destination: SidebarDestination) {
    navigate(destination.path.length ? buildPathFromSegments(destination.path) : [fileSystem]);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg window-surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-color bg-surface px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-1" aria-label="File navigation">
          <button type="button" onClick={goBack} disabled={!backStack.length} className="rounded p-2 text-secondary hover:bg-surface-hover disabled:opacity-40" aria-label="Go back"><ArrowLeft size={16} /></button>
          <button type="button" onClick={goForward} disabled={!forwardStack.length} className="rounded p-2 text-secondary hover:bg-surface-hover disabled:opacity-40" aria-label="Go forward"><ArrowRight size={16} /></button>
          <button type="button" onClick={goUp} disabled={pathStack.length === 1} className="rounded p-2 text-secondary hover:bg-surface-hover disabled:opacity-40" aria-label="Go up"><ArrowUp size={16} /></button>
        </div>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm" aria-label="Current folder path">
          {pathStack.map((folder, index) => (
            <React.Fragment key={`${folder.name}-${index}`}>
              {index > 0 && <ChevronRight size={13} className="shrink-0 text-muted" aria-hidden="true" />}
              <button type="button" onClick={() => navigate(pathStack.slice(0, index + 1))} aria-current={index === pathStack.length - 1 ? 'location' : undefined} className="shrink-0 rounded px-1.5 py-1 text-secondary hover:bg-surface-hover hover:text-primary aria-[current=location]:font-semibold aria-[current=location]:text-primary">{folder.name}</button>
            </React.Fragment>
          ))}
        </nav>

        <label className="flex h-9 items-center gap-2 rounded-lg border border-color px-2.5 text-secondary focus-within:border-accent">
          <Search size={14} aria-hidden="true" />
          <input aria-label="Search this folder" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search here" className="w-24 bg-transparent text-sm text-primary outline-none placeholder:text-muted sm:w-32" />
        </label>
        <label className="sr-only" htmlFor="files-sort">Sort files</label>
        <select id="files-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="h-9 rounded-lg border border-color bg-surface px-2 text-xs text-secondary" title="Sort files by">
          <option value="name">Name</option><option value="type">Type</option><option value="size">Size</option>
        </select>
        <button type="button" onClick={() => setSortDescending((value) => !value)} className="rounded-lg border border-color p-2 text-secondary hover:bg-surface-hover" aria-label={`Sort ${sortDescending ? 'ascending' : 'descending'}`} title={`Sort ${sortDescending ? 'ascending' : 'descending'}`}>
          {sortDescending ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
        </button>
        <div className="flex items-center rounded-lg border border-color p-0.5">
          <button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={cx('rounded p-1.5', viewMode === 'grid' ? 'bg-accent-soft text-accent' : 'text-muted hover:text-primary')}><LayoutGrid size={15} /></button>
          <button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'} className={cx('rounded p-1.5', viewMode === 'list' ? 'bg-accent-soft text-accent' : 'text-muted hover:text-primary')}><List size={15} /></button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-52 shrink-0 flex-col border-r border-color bg-surface-muted/70 md:flex" aria-label="Places">
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
            <section>
              <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Places</h2>
              <div className="space-y-1">
                {sidebarDestinations.map(({ icon: Icon, ...destination }) => {
                  const currentPath = pathStack.map((item) => item.name);
                  const destinationPath = destination.path.length ? ['Home', ...destination.path] : ['Home'];
                  const isActive = destination.path.length
                    ? destinationPath.every((segment, index) => currentPath[index] === segment)
                    : currentPath.length === 1;
                  return <button key={destination.label} type="button" onClick={() => navigateSidebar({ icon: Icon, ...destination })} aria-current={isActive ? 'location' : undefined} className={cx('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors', isActive ? 'bg-accent text-white' : 'text-secondary hover:bg-surface-hover hover:text-primary')}><Icon size={16} aria-hidden="true" /><span>{destination.label}</span></button>;
                })}
              </div>
            </section>
            <section>
              <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Quick access</h2>
              <div className="space-y-1">
                {recentFiles.map((recent) => <button key={recent.file} type="button" onClick={() => openRecent(recent)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-secondary hover:bg-surface-hover hover:text-primary"><FileText size={15} aria-hidden="true" /><span className="truncate">{recent.name}</span></button>)}
              </div>
            </section>
          </div>
          <p className="border-t border-color px-4 py-3 text-xs leading-5 text-muted">Curated portfolio files live in this browser preview. It cannot read your device storage.</p>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
          <div className="flex min-h-0 flex-1">
            <section className="custom-scrollbar min-w-0 flex-1 overflow-auto p-4" aria-label={`${currentFolder.name} contents`}>
              <div className="mb-3 flex items-end justify-between gap-2 border-b border-color pb-3">
                <div><h1 className="text-base font-semibold text-primary">{currentFolder.name}</h1><p className="mt-1 text-xs text-secondary">{currentItems.length} {currentItems.length === 1 ? 'item' : 'items'} · sorted by {sortBy}{sortDescending ? ' descending' : ' ascending'}</p></div>
                {selectedNode && <button type="button" onClick={() => openItem(selectedNode)} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90">Open</button>}
              </div>

              {filteredItems.length === 0 ? <div className="grid min-h-40 place-content-center rounded-xl border border-dashed border-color bg-surface-muted px-5 text-center"><p className="text-sm font-medium text-secondary">{searchQuery ? 'No matching files' : 'This folder is empty'}</p><p className="mt-1 text-xs text-muted">{searchQuery ? `Nothing in ${currentFolder.name} matches “${searchQuery}”.` : 'Nothing has been saved here in this browser preview.'}</p></div> : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                  {filteredItems.map((item) => {
                    const { icon: Icon, className } = getNodeIcon(item);
                    const key = nodePath(pathStack, item);
                    const selected = key === selectedKey;
                    return <button key={key} type="button" onClick={() => setSelectedKey(key)} onDoubleClick={() => openItem(item)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); openItem(item); } }} aria-pressed={selected} className={cx('flex min-h-28 min-w-0 flex-col items-start justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent', selected ? 'border-accent bg-accent-soft' : 'border-transparent hover:border-color hover:bg-surface-muted')}>
                      <Icon size={28} className={className} aria-hidden="true" />
                      <span className="mt-3 w-full truncate text-sm font-medium text-primary" title={item.name}>{item.name}</span>
                      <span className="mt-1 text-[11px] text-muted">{item.type === 'folder' ? `${item.children?.length ?? 0} items` : getTypeLabel(item)}</span>
                    </button>;
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-color">
                  <div className="grid min-w-[410px] grid-cols-[minmax(0,1fr)_76px_110px] gap-2 border-b border-color px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted"><span>Name</span><span>Size</span><span>Type</span></div>
                  {filteredItems.map((item) => {
                    const { icon: Icon, className } = getNodeIcon(item);
                    const key = nodePath(pathStack, item);
                    const selected = key === selectedKey;
                    return <button key={key} type="button" onClick={() => setSelectedKey(key)} onDoubleClick={() => openItem(item)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); openItem(item); } }} aria-pressed={selected} className={cx('grid w-full min-w-[410px] grid-cols-[minmax(0,1fr)_76px_110px] items-center gap-2 border-b border-color/70 px-3 py-2.5 text-left text-xs last:border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent', selected ? 'bg-accent-soft' : 'hover:bg-surface-muted')}>
                      <span className="flex min-w-0 items-center gap-2"><Icon size={17} className={className} aria-hidden="true" /><span className="truncate text-primary">{item.name}</span></span><span className="text-muted">{formatSize(item.sizeBytes ?? contentFor(nodePath(pathStack, item), item).length)}</span><span className="truncate text-muted">{getTypeLabel(item)}</span>
                    </button>;
                  })}
                </div>
              )}
            </section>

            <aside key={savedFileRevision} className="hidden w-60 shrink-0 flex-col border-l border-color bg-surface-muted/50 p-4 md:flex" aria-label="File preview">
              {selectedNode ? <>
                <div className="flex min-h-7 items-center justify-between gap-2"><span className="truncate text-xs font-semibold text-primary" title={selectedNode.name}>{selectedNode.name}</span><span className="shrink-0 text-[10px] text-muted">{getTypeLabel(selectedNode)}</span></div>
                {selectedNode.type === 'folder' ? <div className="grid flex-1 place-content-center text-center"><Folder size={30} className="mx-auto text-amber-500" /><p className="mt-3 text-sm font-medium text-primary">{selectedNode.children?.length ?? 0} items</p><button type="button" onClick={() => openItem(selectedNode)} className="mt-3 text-xs font-semibold text-accent hover:underline">Open folder</button></div>
                  : selectedNode.imageUrl ? <div className="mt-4 flex-1 overflow-auto"><a href={selectedNode.imageUrl} target="_blank" rel="noreferrer" aria-label={`Open full image ${selectedNode.name}`}><img src={selectedNode.imageUrl} alt={selectedNode.imageAlt ?? `${selectedNode.name} preview`} className="max-h-56 w-full rounded-lg border border-color bg-surface object-contain" /></a><p className="mt-2 text-xs leading-5 text-muted">Repository screenshot preview. Select Open to view the full image.</p></div>
                    : selectedNode.extension === 'url' ? <div className="mt-4 grid flex-1 place-content-center text-center"><ExternalLink size={24} className="mx-auto text-accent" /><p className="mt-3 break-all text-xs text-secondary">{selectedNode.externalUrl}</p><button type="button" onClick={() => openItem(selectedNode)} className="mt-3 text-xs font-semibold text-accent hover:underline">Open link</button></div>
                      : selectedNode.extension === 'pdf' ? <div className="mt-4 grid flex-1 place-content-center text-center"><FileText size={28} className="mx-auto text-red-500" /><p className="mt-3 text-xs text-secondary">August 2026 résumé</p><button type="button" onClick={() => openItem(selectedNode)} className="mt-3 text-xs font-semibold text-accent hover:underline">Open PDF</button></div>
                        : <div className="custom-scrollbar mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-color bg-surface p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-5 text-secondary">{selectedContent}</pre></div>}
                <button type="button" onClick={() => openItem(selectedNode)} className="mt-3 flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-color bg-surface text-xs font-semibold text-secondary hover:bg-surface-hover hover:text-primary">{selectedNode.externalUrl ? 'Open link' : selectedNode.imageUrl ? 'Open image' : selectedNode.type === 'folder' ? 'Open folder' : 'Open in editor'}<ExternalLink size={13} aria-hidden="true" /></button>
              </> : <div className="grid flex-1 place-content-center text-center"><FileText size={28} className="mx-auto text-muted" /><p className="mt-3 text-sm font-medium text-secondary">Preview</p><p className="mt-1 max-w-40 text-xs leading-5 text-muted">Select a file or folder to inspect it.</p></div>}
            </aside>
          </div>
          <footer className="flex items-center justify-between border-t border-color px-4 py-2 text-xs text-muted"><span>{selectedNode ? `Selected: ${selectedNode.name}` : `${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'}`}</span><span>Browser-local preview · no host filesystem access</span></footer>
        </main>
      </div>
    </div>
  );
}
