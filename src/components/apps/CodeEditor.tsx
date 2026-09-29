'use client';

import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, Loader2, Search } from 'lucide-react';
import { extractRepoFromUrl } from '@/lib/github';
import { profile } from '@/lib/profile';

interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

interface FileContent {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'dir';
}

interface CodeEditorProps {
  githubUrl?: string;
  projectName?: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  htmlUrl: string;
}

export default function CodeEditor({ githubUrl, projectName }: CodeEditorProps) {
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(githubUrl); // Track the current repository URL
  const [loading, setLoading] = useState(!!githubUrl); // Only load if we have a URL
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openTabs, setOpenTabs] = useState<FileContent[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<'repos' | 'files'>('repos'); // Add view mode state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);

  useEffect(() => {
    if (repoUrl) {
      setViewMode('files'); // Switch to files view if URL is provided
      fetchRepoTree(repoUrl);
    } else {
      // Show repository selection view if no URL provided
      setViewMode('repos'); // Ensure we're in repos view initially
      fetchUserRepos(); // Fetch user repositories
    }
  }, [repoUrl]);

  const fetchUserRepos = async () => {
    try {
      setViewMode('repos');
      setReposLoading(true);
      setError(null);

      const username = profile.githubUrl.split('/').filter(Boolean).pop();
      if (!username) throw new Error('GitHub profile URL is not configured');

      const response = await fetch(`/api/github/repos?username=${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repositories');
      }

      setRepos(data.repos || []);
      setViewMode('repos'); // Set view mode to repos
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repositories');
    } finally {
      setReposLoading(false);
    }
  };

  // Helper function to fetch repo for a specific URL
  const fetchRepoForUrl = (url: string) => {
    setTree([]);
    setSelectedFile(null);
    setOpenTabs([]);
    setExpandedFolders(new Set());
    setError(null);
    setRepoUrl(url);
    setViewMode('files');
  };

  const getLanguageColor = (language: string): string => ({
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
  })[language as 'JavaScript' | 'TypeScript' | 'Python' | 'Go' | 'Rust'] || '#888888';

  const fetchRepoTree = async (url?: string) => {
    const repoUrlToUse = url || repoUrl;
    if (!repoUrlToUse) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/github/tree?url=${encodeURIComponent(repoUrlToUse)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repository tree');
      }

      setTree(data.tree || []);
    } catch (error) {
      console.error('Error fetching tree:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repository');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath: string) => {
    const activeRepoUrl = repoUrl || githubUrl;
    if (!activeRepoUrl) return;
    
    try {
      setFileLoading(true);
      
      const response = await fetch(`/api/github/file?url=${encodeURIComponent(activeRepoUrl)}&path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch file content');
      }
      
      const file = data.file;
      setSelectedFile(file);

      // Add to tabs if not already open
      const existingTabIndex = openTabs.findIndex(tab => tab.path === file.path);
      if (existingTabIndex === -1) {
        setOpenTabs([...openTabs, file]);
        setActiveTabIndex(openTabs.length);
      } else {
        setActiveTabIndex(existingTabIndex);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      const errorFile = {
        name: filePath.split('/').pop() || 'Unknown',
        path: filePath,
        content: `Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'file' as const
      };
      setSelectedFile(errorFile);
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileClick = (item: TreeItem) => {
    if (item.type === 'blob') {
      fetchFileContent(item.path);
    } else {
      toggleFolder(item.path);
    }
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const closeTab = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newTabs = openTabs.filter((_, i) => i !== index);
    setOpenTabs(newTabs);
    
    if (activeTabIndex === index) {
      if (newTabs.length === 0) {
        setSelectedFile(null);
        setActiveTabIndex(-1);
      } else {
        const newActiveIndex = Math.min(activeTabIndex, newTabs.length - 1);
        setActiveTabIndex(newActiveIndex);
        setSelectedFile(newTabs[newActiveIndex]);
      }
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  };

  const switchTab = (index: number) => {
    setActiveTabIndex(index);
    setSelectedFile(openTabs[index]);
  };

  const buildFileTree = () => {
    const root: { [key: string]: any } = {};
    
    tree.forEach(item => {
      const parts = item.path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: index === parts.length - 1 ? item.type : 'tree',
            children: {},
            item: index === parts.length - 1 ? item : null
          };
        }
        current = current[part].children;
      });
    });
    
    return root;
  };

  const filterTree = (node: any, query: string): any => {
    if (!query) return node;
    
    const filtered: any = {};
    Object.entries(node).forEach(([key, value]: [string, any]) => {
      if (value.name.toLowerCase().includes(query.toLowerCase())) {
        filtered[key] = value;
      } else if (value.type === 'tree') {
        const filteredChildren = filterTree(value.children, query);
        if (Object.keys(filteredChildren).length > 0) {
          filtered[key] = { ...value, children: filteredChildren };
        }
      }
    });
    
    return filtered;
  };

  const renderTree = (node: any, depth = 0) => {
    const entries = Object.entries(node).sort(([, a]: [string, any], [, b]: [string, any]) => {
      if (a.type === 'tree' && b.type !== 'tree') return -1;
      if (a.type !== 'tree' && b.type === 'tree') return 1;
      return a.name.localeCompare(b.name);
    });

    return entries.map(([key, value]: [string, any]) => {
      const isExpanded = expandedFolders.has(value.path);
      const hasChildren = Object.keys(value.children).length > 0;
      const isActive = selectedFile?.path === value.path;

      return (
        <div key={value.path}>
          <button
            type="button"
            className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-xs ${
              isActive ? 'bg-[#2a2d2e]' : ''
            }`}
            style={{ paddingLeft: `${depth * 18}px` }}
            onClick={() => value.type === 'tree' ? toggleFolder(value.path) : value.item && handleFileClick(value.item)}
            aria-expanded={value.type === 'tree' ? isExpanded : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              {value.type === 'tree' ? (
                <>{isExpanded ? <FolderOpen className="h-3 w-3 text-[color:var(--accent)]" /> : <Folder className="h-3 w-3 text-[#d7dae0]" />}</>
              ) : (
                <File className="h-3 w-3 text-[#9e9e9e]" />
              )}
            </div>
            <span className={`${isActive ? 'text-[#ffffff]' : 'text-[#cccccc]'}`}>{value.name}</span>
          </button>

          {value.type === 'tree' && isExpanded && hasChildren && (
            <div>
              {renderTree(value.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return langMap[ext || ''] || 'text';
  };

  if (viewMode === 'repos') {
    return (
      <section className="h-full overflow-y-auto bg-[color:var(--color-surface)] p-6 text-[color:var(--text-primary)] sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">Read-only source browser</p>
              <h2 className="text-2xl font-semibold tracking-tight">Choose a public repository</h2>
              <p className="mt-2 max-w-xl text-sm text-[color:var(--text-secondary)]">Browse files from GitHub. Select a project to inspect its current default branch.</p>
            </div>
            <a className="text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline" href={profile.githubUrl} target="_blank" rel="noreferrer">Open GitHub profile ↗</a>
          </div>

          {reposLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] p-5 text-sm text-[color:var(--text-secondary)]" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading public repositories…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5" role="alert">
              <p className="font-medium">GitHub repositories could not be loaded.</p>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{error}</p>
              <button type="button" onClick={fetchUserRepos} className="mt-4 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white">Try again</button>
            </div>
          ) : repos.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--border)] p-5 text-sm text-[color:var(--text-secondary)]">No public repositories were found on this profile.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {repos.map((repo) => (
                <button
                  type="button"
                  key={repo.id}
                  onClick={() => fetchRepoForUrl(repo.htmlUrl)}
                  className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <Folder className="h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                      <span className="truncate font-semibold">{repo.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-[color:var(--text-secondary)]">↗</span>
                  </span>
                  <span className="mt-3 block min-h-10 text-sm leading-5 text-[color:var(--text-secondary)]">{repo.description || 'No repository description.'}</span>
                  <span className="mt-4 flex items-center gap-3 text-xs text-[color:var(--text-secondary)]">
                    {repo.language && <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />{repo.language}</span>}
                    <span>★ {repo.stargazersCount}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-[color:var(--color-surface)] flex items-center justify-center">
        <div className="text-center text-[color:var(--text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-[color:var(--color-surface)] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold mb-2">Error Loading Repository</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchRepoTree()}
            className="mt-4 px-4 py-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent-strong)] text-white rounded transition-colors"
          >
            Retry
          </button>
          <button type="button" onClick={fetchUserRepos} className="ml-2 mt-4 px-4 py-2 text-sm underline underline-offset-4">Choose another repository</button>
        </div>
      </div>
    );
  }

  const filteredTree = filterTree(buildFileTree(), searchQuery);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="flex h-10 items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-3 text-xs">
        <span className="text-[#d7dae0]">Read-only GitHub source</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchUserRepos} className="rounded px-2 py-1 text-[#cccccc] hover:bg-[#3c3c3c]">Switch repository</button>
          {(repoUrl || githubUrl) && <a className="text-[color:var(--accent)] hover:underline" href={repoUrl || githubUrl} target="_blank" rel="noreferrer">Open on GitHub ↗</a>}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 shrink-0 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          <div className="p-3 border-b border-[#3c3c3c]">
            <h3 className="truncate text-xs font-semibold tracking-wide text-[#d7dae0]">{projectName || extractRepoFromUrl(repoUrl || githubUrl || '') || 'Explorer'}</h3>

            {/* Search */}
            <div className="mt-2 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#a0a0a0]" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-xs text-[#cccccc] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tree.length === 0 ? (
              <p className="text-[#858585] text-xs p-3">No repository files are available.</p>
            ) : (
              renderTree(filteredTree)
            )}
          </div>
        </div>

        {/* Editor Area - Main Content */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Tab Bar - VS Code Style */}
          {openTabs.length > 0 && (
            <div role="tablist" aria-label="Open source files" className="flex bg-[#2d2d2d] border-b border-[#3c3c3c] h-8 overflow-x-auto">
              {openTabs.map((tab, index) => (
                <div
                  key={tab.path}
                  role="tab"
                  tabIndex={0}
                  aria-selected={activeTabIndex === index}
                  onClick={() => switchTab(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      switchTab(index);
                    }
                  }}
                  className={`flex items-center px-3 border-r border-[#3c3c3c] cursor-pointer text-xs h-full ${
                    activeTabIndex === index
                      ? 'bg-[#1e1e1e] border-t border-[#0078d4]'
                      : 'bg-[#2d2d2d] hover:bg-[#3a3d41]'
                  }`}
                >
                  <File className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{tab.name}</span>
                  <button
                    type="button"
                    onClick={(e) => closeTab(index, e)}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-label={`Close ${tab.name}`}
                    className="ml-2 hover:bg-[#424242] rounded w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedFile ? (
              <>
                {/* File Status Bar */}
                <div className="h-5 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between px-3 text-xs text-[#9d9d9d]">
                  <div className="flex items-center space-x-4">
                    <span>{getLanguageFromFilename(selectedFile.name)}</span>
                    <span>UTF-8</span>
                    <span>LF</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Ln {selectedFile.content.split('\n').length}, Col 1</span>
                    <span>Spaces: 2</span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                  <div className="p-4">
                    <pre className="text-sm font-mono leading-relaxed">
                      <code className="source-code">
                        {selectedFile.content.split('\n').map((line, index) => (
                          <span className="source-code-line" key={`${selectedFile.path}-${index}`}>
                            <span className="source-code-number" aria-hidden="true">{index + 1}</span>
                            <span>{line || ' '}</span>
                          </span>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
                <div className="text-center">
                  <div className="text-[#d7dae0] text-5xl mb-4"> &lt;/&gt; </div>
                  <p className="text-[#d7dae0] text-lg font-medium mb-2">
                    Choose a file to inspect
                  </p>
                  <p className="text-[#9d9d9d] text-sm max-w-md mx-auto">
                    Select a file from the repository tree. File contents are displayed as plain text.
                  </p>
                  {(repoUrl || githubUrl) && !selectedFile && (
                    <div className="mt-6 text-left max-w-md mx-auto">
                      <p className="text-[#d7dae0] text-sm mb-2">Quick Start</p>
                      <ul className="text-[#9d9d9d] text-xs space-y-1">
                        <li>• Click on any file in the explorer to open it</li>
                        <li>• Use the search bar to find specific files</li>
                        <li>• Multiple files can be opened in tabs</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar - Bottom */}
      <div className="h-6 bg-[#22334a] text-white text-xs flex items-center justify-between px-3">
        <div className="flex items-center space-x-3">
          <span>Read-only</span>
          <span>{extractRepoFromUrl(repoUrl || githubUrl || '') || 'GitHub'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>UTF-8</span>
          {selectedFile && <span>{getLanguageFromFilename(selectedFile.name)}</span>}
        </div>
      </div>
    </div>
  );
}
