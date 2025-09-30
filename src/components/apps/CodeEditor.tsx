'use client';

import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { extractRepoFromUrl } from '@/lib/github';

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

export default function CodeEditor({ githubUrl, projectName }: CodeEditorProps) {
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (githubUrl) {
      fetchRepoTree();
    }
  }, [githubUrl]);

  const fetchRepoTree = async () => {
    if (!githubUrl) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/github/tree?url=${encodeURIComponent(githubUrl)}`);
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
    if (!githubUrl) return;
    
    try {
      setFileLoading(true);
      
      const response = await fetch(`/api/github/file?url=${encodeURIComponent(githubUrl)}&path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch file content');
      }
      
      setSelectedFile(data.file);
    } catch (error) {
      console.error('Error fetching file:', error);
      setSelectedFile({
        name: filePath.split('/').pop() || 'Unknown',
        path: filePath,
        content: `Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'file'
      });
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

  const renderTree = (node: any, depth = 0) => {
    const entries = Object.entries(node).sort(([, a]: [string, any], [, b]: [string, any]) => {
      if (a.type === 'tree' && b.type !== 'tree') return -1;
      if (a.type !== 'tree' && b.type === 'tree') return 1;
      return a.name.localeCompare(b.name);
    });

    return entries.map(([key, value]: [string, any]) => {
      const isExpanded = expandedFolders.has(value.path);
      const hasChildren = Object.keys(value.children).length > 0;

      return (
        <div key={value.path}>
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm ${
              selectedFile?.path === value.path ? 'bg-blue-600' : ''
            }`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => value.item && handleFileClick(value.item)}
          >
            {value.type === 'tree' ? (
              <>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 mr-2 text-blue-400" />
                ) : (
                  <Folder className="w-4 h-4 mr-2 text-blue-400" />
                )}
              </>
            ) : (
              <File className="w-4 h-4 mr-2 text-gray-400" />
            )}
            <span className="truncate">{value.name}</span>
          </div>
          
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

  if (loading) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading repository...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold mb-2">Error Loading Repository</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchRepoTree}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex">
      {/* File Explorer */}
      <div className="w-64 border-r border-gray-700 overflow-y-auto">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white truncate">
            {projectName || extractRepoFromUrl(githubUrl || '')?.split('/')[1] || 'Repository'}
          </h3>
        </div>
        <div className="p-2">
          {tree.length === 0 ? (
            <p className="text-gray-500 text-sm">No files found</p>
          ) : (
            renderTree(buildFileTree())
          )}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <File className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {getLanguageFromFilename(selectedFile.name)}
                </span>
              </div>
              {fileLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-y-auto">
              <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a file to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}