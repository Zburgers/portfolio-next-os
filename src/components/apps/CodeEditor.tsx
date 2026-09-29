'use client';

import { FileTree, useFileTree } from '@pierre/trees/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  ExternalLink,
  FileCode2,
  GitBranch,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { type GitHubFileContent, type GitHubRepository, type GitHubRepositoryTree } from '@/lib/github';
import { extractRepoFromUrl } from '@/lib/github-url';
import { profile } from '@/lib/profile';

interface CodeEditorProps {
  githubUrl?: string;
  projectName?: string;
}

interface RepositoryListResponse {
  repos: GitHubRepository[];
}

interface RepositoryTreeResponse extends GitHubRepositoryTree {
  fetchedAt: string;
}

interface FileResponse {
  file: GitHubFileContent;
}

async function readResponse<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function languageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', Go: '#00add8',
    Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d', CSS: '#663399', HTML: '#e34c26',
  };
  return colors[language] || '#8b95a7';
}

function formatPushedAt(value: string): string {
  const pushedAt = new Date(value);
  if (Number.isNaN(pushedAt.getTime())) return 'Push date unavailable';
  const days = Math.max(0, Math.floor((Date.now() - pushedAt.getTime()) / 86_400_000));
  if (days === 0) return 'Pushed today';
  if (days === 1) return 'Pushed yesterday';
  if (days < 30) return `Pushed ${days}d ago`;
  return `Pushed ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(pushedAt)}`;
}

const treeStyle: CSSProperties = {
  height: '100%',
  width: '100%',
  '--trees-bg-override': 'rgba(21, 25, 34, 0.72)',
  '--trees-bg-muted-override': 'rgba(118, 141, 183, 0.12)',
  '--trees-fg-override': '#dce3ef',
  '--trees-fg-muted-override': '#8995a8',
  '--trees-border-color-override': 'rgba(255, 255, 255, 0.06)',
  '--trees-selected-bg-override': 'rgba(116, 155, 225, 0.2)',
  '--trees-selected-fg-override': '#f4f7ff',
  '--trees-accent-override': '#86a9e8',
  '--trees-font-family-override': 'ui-monospace, SFMono-Regular, Menlo, monospace',
  '--trees-font-size-override': '12px',
} as CSSProperties;

export default function CodeEditor({ githubUrl, projectName }: CodeEditorProps) {
  const [repoUrl, setRepoUrl] = useState(githubUrl || '');
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [repoQuery, setRepoQuery] = useState('');
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState('');
  const [reposRevision, setReposRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<RepositoryTreeResponse | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState('');
  const [treeRevision, setTreeRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [openFiles, setOpenFiles] = useState<GitHubFileContent[]>([]);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [fileLoadingPath, setFileLoadingPath] = useState('');
  const [fileError, setFileError] = useState<{ path: string; message: string } | null>(null);
  const fileRequestRef = useRef<AbortController | null>(null);
  const selectedPathRef = useRef('');
  const treeModelRef = useRef<ReturnType<typeof useFileTree>['model'] | null>(null);
  const openFileRef = useRef<(path: string) => void>(() => {});

  const onTreeSelectionChange = useCallback((paths: readonly string[]) => {
    const model = treeModelRef.current;
    const path = paths[paths.length - 1];
    if (!path || model?.getItem(path)?.isDirectory()) return;
    openFileRef.current(path);
  }, []);

  const { model: treeModel } = useFileTree({
    paths: [],
    initialExpansion: 1,
    fileTreeSearchMode: 'hide-non-matches',
    search: true,
    density: 'compact',
    icons: { set: 'complete', colored: true },
    onSelectionChange: onTreeSelectionChange,
  });
  treeModelRef.current = treeModel;

  const repositoryPath = extractRepoFromUrl(repoUrl);
  const tree = snapshot?.tree || [];
  const activeFile = openFiles.find((file) => file.path === activeFilePath) || null;
  const visibleRepos = useMemo(() => {
    const query = repoQuery.trim().toLowerCase();
    return query ? repos.filter((repo) => `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase().includes(query)) : repos;
  }, [repos, repoQuery]);
  const treePaths = useMemo(() => tree.map((item) => item.type === 'tree' ? `${item.path.replace(/\/+$/, '')}/` : item.path), [tree]);

  useEffect(() => {
    setRepoUrl(githubUrl || '');
    fileRequestRef.current?.abort();
    fileRequestRef.current = null;
    setSnapshot(null);
    setOpenFiles([]);
    setActiveFilePath('');
    setFileLoadingPath('');
    selectedPathRef.current = '';
  }, [githubUrl]);

  useEffect(() => () => fileRequestRef.current?.abort(), []);

  useEffect(() => {
    if (repoUrl) return;
    const controller = new AbortController();
    const username = profile.githubUrl.split('/').filter(Boolean).pop();
    if (!username) {
      setReposError('The GitHub profile is not configured.');
      return () => controller.abort();
    }

    setReposLoading(true);
    setReposError('');
    void readResponse<RepositoryListResponse>(`/api/github/repos?username=${encodeURIComponent(username)}`, controller.signal)
      .then((result) => setRepos(result.repos || []))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setReposError(error instanceof Error ? error.message : 'Could not load public repositories.');
      })
      .finally(() => { if (!controller.signal.aborted) setReposLoading(false); });

    return () => controller.abort();
  }, [repoUrl, reposRevision]);

  useEffect(() => {
    if (!repoUrl) {
      setSnapshot(null);
      setTreeError('');
      return;
    }
    if (!repositoryPath) {
      setTreeError('Choose a valid GitHub repository URL.');
      return;
    }

    const controller = new AbortController();
    setTreeLoading(true);
    setTreeError('');
    void readResponse<RepositoryTreeResponse>(`/api/github/tree?url=${encodeURIComponent(repoUrl)}`, controller.signal)
      .then((result) => setSnapshot(result))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setTreeError(error instanceof Error ? error.message : 'Could not load this repository.');
      })
      .finally(() => { if (!controller.signal.aborted) setTreeLoading(false); });

    return () => controller.abort();
  }, [repoUrl, repositoryPath, treeRevision]);

  useEffect(() => {
    const topLevelFolders = treePaths.filter((path) => path.endsWith('/') && path.slice(0, -1).indexOf('/') === -1);
    treeModel.resetPaths(treePaths, { initialExpandedPaths: topLevelFolders });
  }, [treeModel, treePaths]);

  useEffect(() => {
    treeModel.setSearch(searchQuery.trim() || null);
  }, [searchQuery, treeModel]);

  const openFile = useCallback((path: string) => {
    selectedPathRef.current = path;
    setFileError(null);
    const existing = openFiles.find((file) => file.path === path);
    if (existing) {
      fileRequestRef.current?.abort();
      fileRequestRef.current = null;
      setFileLoadingPath('');
      setActiveFilePath(path);
      return;
    }
    if (!repoUrl) return;

    fileRequestRef.current?.abort();
    const branch = snapshot?.branch;
    const query = new URLSearchParams({ url: repoUrl, path });
    if (branch) query.set('branch', branch);
    const controller = new AbortController();
    fileRequestRef.current = controller;
    setFileLoadingPath(path);
    void readResponse<FileResponse>(`/api/github/file?${query.toString()}`, controller.signal)
      .then(({ file }) => {
        if (controller.signal.aborted) return;
        setOpenFiles((current) => current.some((item) => item.path === file.path) ? current : [...current, file]);
        if (selectedPathRef.current === path) setActiveFilePath(file.path);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && selectedPathRef.current === path) {
          setFileError({ path, message: error instanceof Error ? error.message : 'Could not load this file.' });
        }
      })
      .finally(() => {
        if (fileRequestRef.current === controller) {
          fileRequestRef.current = null;
          setFileLoadingPath((current) => current === path ? '' : current);
        }
      });
  }, [openFiles, repoUrl, snapshot?.branch]);
  openFileRef.current = openFile;

  const chooseRepository = (url: string) => {
    fileRequestRef.current?.abort();
    fileRequestRef.current = null;
    setSnapshot(null);
    setOpenFiles([]);
    setActiveFilePath('');
    setFileError(null);
    setFileLoadingPath('');
    setSearchQuery('');
    selectedPathRef.current = '';
    setRepoUrl(url);
  };

  const switchRepository = () => {
    fileRequestRef.current?.abort();
    fileRequestRef.current = null;
    setSnapshot(null);
    setOpenFiles([]);
    setActiveFilePath('');
    setFileError(null);
    setFileLoadingPath('');
    setSearchQuery('');
    selectedPathRef.current = '';
    setRepoUrl('');
  };

  const activateFile = (path: string) => {
    selectedPathRef.current = path;
    setActiveFilePath(path);
    setFileError(null);
    treeModel.getItem(path)?.select();
    treeModel.scrollToPath(path, { focus: true, offset: 'center' });
  };

  const closeFile = (path: string) => {
    const index = openFiles.findIndex((file) => file.path === path);
    const remaining = openFiles.filter((file) => file.path !== path);
    setOpenFiles(remaining);
    if (activeFilePath === path) {
      const next = remaining[Math.min(index, remaining.length - 1)];
      if (next) activateFile(next.path);
      else {
        selectedPathRef.current = '';
        setActiveFilePath('');
      }
    }
  };

  const navigateBreadcrumb = (path: string) => {
    const item = treeModel.getItem(path);
    if (item?.isDirectory() && 'expand' in item) item.expand();
    treeModel.scrollToPath(path, { focus: true, offset: 'center' });
    if (path === activeFilePath) openFile(path);
  };

  if (!repoUrl) {
    return (
      <section className="h-full overflow-y-auto bg-[color:var(--color-surface)] p-5 text-[color:var(--text-primary)] sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live · public GitHub source</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Choose a repository</h2>
              <p className="mt-2 max-w-xl text-sm text-[color:var(--text-secondary)]">Read the current default branch and inspect source files. This browser never edits remote repositories.</p>
            </div>
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent)] hover:underline" href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub profile <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>

          <label className="mb-4 flex max-w-lg items-center gap-2 rounded-xl border border-[color:var(--border)] bg-black/5 px-3 py-2.5 focus-within:ring-2 focus-within:ring-[color:var(--accent)]">
            <Search size={16} className="shrink-0 text-[color:var(--text-secondary)]" aria-hidden="true" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--text-secondary)]" placeholder="Filter repositories by name or language" value={repoQuery} onChange={(event) => setRepoQuery(event.target.value)} />
            <button type="button" className="rounded-md p-1 text-[color:var(--text-secondary)] hover:bg-black/10 disabled:opacity-40" onClick={() => setReposRevision((value) => value + 1)} disabled={reposLoading} aria-label="Refresh repositories" title="Refresh repositories"><RefreshCw size={14} className={reposLoading ? 'animate-spin' : ''} /></button>
          </label>

          {reposLoading && repos.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] p-5 text-sm text-[color:var(--text-secondary)]" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading public repositories from GitHub…</div>
          ) : reposError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5" role="alert">
              <p className="font-medium">GitHub repositories could not be loaded.</p>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{reposError}</p>
              <button type="button" onClick={() => setReposRevision((value) => value + 1)} className="mt-4 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white">Try again</button>
            </div>
          ) : visibleRepos.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--border)] p-5 text-sm text-[color:var(--text-secondary)]">{repos.length ? 'No repositories match this search.' : 'No public repositories were found on this profile.'}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRepos.map((repo) => (
                <button type="button" key={repo.id} onClick={() => chooseRepository(repo.htmlUrl)} className="group min-w-0 rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] sm:p-5">
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3"><FileCode2 className="h-5 w-5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" /><span className="truncate font-semibold">{repo.name}</span></span>
                    <ExternalLink size={14} className="shrink-0 text-[color:var(--text-secondary)] transition group-hover:text-[color:var(--accent)]" aria-hidden="true" />
                  </span>
                  <span className="mt-3 block min-h-10 text-sm leading-5 text-[color:var(--text-secondary)]">{repo.description || 'No repository description.'}</span>
                  <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--text-secondary)]">
                    {repo.language && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />{repo.language}</span>}
                    <span>★ {repo.stargazersCount}</span><span>{formatPushedAt(repo.pushedAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {reposLoading && repos.length > 0 && <p className="mt-3 text-xs text-[color:var(--text-secondary)]" role="status">Refreshing live repository data…</p>}
        </div>
      </section>
    );
  }

  const sourceStyle: CSSProperties = { background: 'rgba(14, 17, 24, 0.82)' };
  const treeEmpty = tree.length === 0 && !treeLoading && !treeError;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#10131a] text-[#dce3ef]">
      <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] bg-[#191d27]/90 px-2.5 text-xs backdrop-blur-xl sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={switchRepository} aria-label="Choose repository" title="Choose repository" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#a9b4c6] hover:bg-white/[0.08] hover:text-white"><ArrowLeft size={15} /></button>
          <span className="truncate font-medium text-[#eef2fa]">{projectName || snapshot?.repository || repositoryPath || 'GitHub source'}</span>
          <span className="hidden text-white/25 sm:inline">/</span>
          <span className="hidden items-center gap-1.5 text-[#9aa6ba] sm:flex"><GitBranch size={12} aria-hidden="true" />{snapshot?.branch || 'default branch'}</span>
          {treeLoading && <Loader2 size={13} className="shrink-0 animate-spin text-[#86a9e8]" aria-label="Refreshing repository" />}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => setExplorerOpen((open) => !open)} className="grid h-7 w-7 place-items-center rounded-lg text-[#a9b4c6] hover:bg-white/[0.08] hover:text-white" aria-label={explorerOpen ? 'Hide file explorer' : 'Show file explorer'} title={explorerOpen ? 'Hide explorer' : 'Show explorer'}>
            {explorerOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
          <button type="button" onClick={() => setTreeRevision((value) => value + 1)} disabled={treeLoading} className="grid h-7 w-7 place-items-center rounded-lg text-[#a9b4c6] hover:bg-white/[0.08] hover:text-white disabled:opacity-40" aria-label="Refresh repository tree" title="Refresh current branch"><RefreshCw size={14} className={treeLoading ? 'animate-spin' : ''} /></button>
          {repoUrl && <a className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[color:var(--accent)] hover:bg-white/[0.08]" href={repoUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} aria-hidden="true" /></a>}
        </div>
      </header>

      {treeError && <div className="flex shrink-0 items-center justify-between gap-3 border-b border-rose-400/20 bg-rose-400/[0.08] px-3 py-2 text-xs text-rose-100" role="alert"><span>{treeError}</span><button type="button" onClick={() => setTreeRevision((value) => value + 1)} className="shrink-0 underline underline-offset-2">Retry</button></div>}
      {snapshot?.truncated && <div className="shrink-0 border-b border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5 text-[11px] text-amber-100">GitHub limited this very large repository tree. The files shown are the current API results.</div>}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {explorerOpen && (
          <aside className="flex min-h-0 w-[min(16rem,43vw)] shrink-0 flex-col border-r border-white/[0.07] bg-[#171b24]/80 backdrop-blur-xl sm:w-64">
            <div className="shrink-0 border-b border-white/[0.06] px-3 pb-2.5 pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9ca8ba]">Explorer</h2>
                <span className="shrink-0 text-[10px] text-[#768196]">{tree.length.toLocaleString()} items</span>
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1.5 focus-within:border-[#86a9e8]/50 focus-within:ring-1 focus-within:ring-[#86a9e8]/30">
                <Search size={13} className="shrink-0 text-[#77849a]" aria-hidden="true" />
                <input className="min-w-0 w-full bg-transparent text-[11px] text-[#e5ebf5] outline-none placeholder:text-[#77849a]" placeholder="Filter files" aria-label="Filter repository files" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                {searchQuery && <button type="button" className="text-[#9ba8bb] hover:text-white" onClick={() => setSearchQuery('')} aria-label="Clear file filter"><X size={13} /></button>}
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-auto" aria-label="Repository files">
              {treeLoading && tree.length === 0 ? <div className="flex items-center gap-2 p-3 text-xs text-[#9aa6ba]" role="status"><Loader2 size={13} className="animate-spin" /> Loading file tree…</div>
                : treeEmpty ? <p className="p-3 text-xs text-[#8591a5]">This repository has no files on the selected branch.</p>
                  : treeError && tree.length === 0 ? <p className="p-3 text-xs text-[#8591a5]">The file tree is unavailable.</p>
                    : <FileTree model={treeModel} className="h-full min-h-0 w-full" style={treeStyle} />}
              {searchQuery && tree.length > 0 && treeModel.getSearchMatchingPaths().length === 0 && <p className="px-3 py-2 text-xs text-[#8591a5]">No files match “{searchQuery}”.</p>}
            </div>
          </aside>
        )}

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#10131a]" aria-label="Source viewer">
          <div className="flex h-9 shrink-0 items-center gap-2 overflow-x-auto border-b border-white/[0.07] bg-[#171b24]/70">
            {openFiles.length > 0 ? (
              <div role="tablist" aria-label="Open source files" className="flex h-full min-w-0 items-stretch">
                {openFiles.map((file) => (
                  <div key={file.path} role="presentation" className={`flex max-w-48 min-w-0 items-center border-r border-white/[0.06] ${activeFilePath === file.path ? 'bg-[#10131a] shadow-[inset_0_2px_0_#86a9e8]' : 'bg-transparent hover:bg-white/[0.04]'}`}>
                    <button type="button" role="tab" aria-selected={activeFilePath === file.path} onClick={() => activateFile(file.path)} className="flex h-full min-w-0 items-center gap-2 px-3 text-[11px] text-[#c8d0dd] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#86a9e8]"><FileCode2 size={13} className="shrink-0 text-[#8ea8d5]" /><span className="truncate">{file.name}</span></button>
                    <button type="button" onClick={() => closeFile(file.path)} aria-label={`Close ${file.name}`} className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded text-[#77849a] hover:bg-white/10 hover:text-white"><X size={12} /></button>
                  </div>
                ))}
              </div>
            ) : <div className="flex h-full items-center gap-2 px-3 text-[11px] text-[#8995a8]"><FileCode2 size={13} /> No file open</div>}
          </div>

          {activeFile ? (
            <>
              <nav className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-white/[0.05] px-3 text-[11px] text-[#9aa6ba]" aria-label="File path">
                {activeFile.path.split('/').map((part, index, parts) => {
                  const path = parts.slice(0, index + 1).join('/') + (index < parts.length - 1 ? '/' : '');
                  return <span key={path} className="flex shrink-0 items-center gap-1">{index > 0 && <span className="text-white/20">/</span>}<button type="button" onClick={() => navigateBreadcrumb(path)} className="rounded px-1 py-0.5 hover:bg-white/[0.07] hover:text-white" aria-current={index === parts.length - 1 ? 'location' : undefined}>{part}</button></span>;
                })}
                <span className="ml-auto hidden shrink-0 items-center gap-1 text-[#768196] sm:flex"><Clock3 size={11} />{snapshot ? `Fetched ${new Date(snapshot.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live source'}</span>
              </nav>
              <div className="min-h-0 flex-1 overflow-auto" style={sourceStyle}>
                <pre className="m-0 min-w-max py-3 font-mono text-[12px] leading-6 text-[#d7deea] sm:text-[12.5px]"><code className="block">{activeFile.content.split('\n').map((line, index) => (
                  <span className="grid min-h-6 grid-cols-[3.5rem_minmax(0,1fr)] gap-3 pr-6" key={`${activeFile.path}-${index}`}>
                    <span className="sticky left-0 select-none bg-[#10131a]/95 pl-2 pr-3 text-right text-[#647087]" aria-hidden="true">{index + 1}</span>
                    <span className="whitespace-pre">{line || ' '}</span>
                  </span>
                ))}</code></pre>
              </div>
            </>
          ) : fileError && fileError.path === selectedPathRef.current ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-5 text-center" role="alert">
              <div className="max-w-md"><p className="font-medium text-[#eef2fa]">Could not preview this file</p><p className="mt-2 break-words text-sm text-[#9aa6ba]">{fileError.message}</p><button type="button" onClick={() => openFile(fileError.path)} className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs hover:bg-white/10">Try again</button></div>
            </div>
          ) : fileLoadingPath ? (
            <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#9aa6ba]" role="status"><Loader2 size={16} className="mr-2 animate-spin text-[#86a9e8]" /> Loading {fileLoadingPath.split('/').pop()} from GitHub…</div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-5 text-center">
              <div className="max-w-sm"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[#86a9e8]"><FileCode2 size={22} aria-hidden="true" /></div><p className="text-base font-medium text-[#eef2fa]">Browse the source</p><p className="mt-2 text-sm leading-6 text-[#9aa6ba]">Select a file in the explorer to read its current contents from GitHub. Open files stay available in tabs.</p><p className="mt-4 text-[11px] text-[#768196]">Read-only · UTF-8 text previews up to 250 KB</p></div>
            </div>
          )}
        </section>
      </div>

      <footer className="flex h-6 shrink-0 items-center justify-between gap-3 bg-[#283650] px-3 text-[10px] text-[#e4ebf8]">
        <div className="flex min-w-0 items-center gap-3"><span className="shrink-0">Read-only</span><span className="truncate">{snapshot?.repository || repositoryPath || 'GitHub'}</span><span className="hidden shrink-0 items-center gap-1 sm:flex"><GitBranch size={10} />{snapshot?.branch || '—'}</span></div>
        <div className="flex shrink-0 items-center gap-3"><span>{activeFile ? `${activeFile.content.split('\n').length} lines` : 'Public source'}</span><span>{snapshot?.fetchedAt ? `Updated ${new Date(snapshot.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live data · 30s cache'}</span></div>
      </footer>
    </div>
  );
}
