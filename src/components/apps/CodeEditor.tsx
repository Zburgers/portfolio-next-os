'use client';

import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, Loader2, Search, Code, Settings } from 'lucide-react';
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

// Simple syntax highlighting for common languages
const highlightCode = (code: string, language: string): string => {
  if (!code) return '';
  
  // Basic regex patterns for syntax highlighting
  const patterns: { [key: string]: { pattern: RegExp; className: string }[] } = {
    javascript: [
      { pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await)\b/g, className: 'text-purple-400' },
      { pattern: /'([^'\\]|\\.)*'/g, className: 'text-green-400' },
      { pattern: /"([^"\\]|\\.)*"/g, className: 'text-green-400' },
      { pattern: /\/\/.*$/gm, className: 'text-gray-500' },
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500' },
      { pattern: /\b\d+\b/g, className: 'text-orange-400' },
    ],
    typescript: [
      { pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|interface|type|enum)\b/g, className: 'text-purple-400' },
      { pattern: /'([^'\\]|\\.)*'/g, className: 'text-green-400' },
      { pattern: /"([^"\\]|\\.)*"/g, className: 'text-green-400' },
      { pattern: /\/\/.*$/gm, className: 'text-gray-500' },
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500' },
      { pattern: /\b\d+\b/g, className: 'text-orange-400' },
    ],
    css: [
      { pattern: /([a-zA-Z-]+)\s*:/g, className: 'text-blue-400' },
      { pattern: /'([^'\\]|\\.)*'/g, className: 'text-green-400' },
      { pattern: /"([^"\\]|\\.)*"/g, className: 'text-green-400' },
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500' },
      { pattern: /#[a-fA-F0-9]{3,6}\b/g, className: 'text-orange-400' },
    ],
    html: [
      { pattern: /<\/?[a-zA-Z][^>]*>/g, className: 'text-blue-400' },
      { pattern: /\s[a-zA-Z-]+=/g, className: 'text-yellow-400' },
      { pattern: /'([^'\\]|\\.)*'/g, className: 'text-green-400' },
      { pattern: /"([^"\\]|\\.)*"/g, className: 'text-green-400' },
    ],
  };

  let highlightedCode = code;
  const langPatterns = patterns[language] || [];

  langPatterns.forEach(({ pattern, className }) => {
    highlightedCode = highlightedCode.replace(pattern, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
  });

  return highlightedCode;
};

export default function CodeEditor({ githubUrl, projectName }: CodeEditorProps) {
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(!!githubUrl); // Only load if we have a URL
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openTabs, setOpenTabs] = useState<FileContent[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);

  useEffect(() => {
    if (githubUrl) {
      fetchRepoTree();
    } else {
      // Load demo content if no GitHub URL provided
      loadDemoContent();
    }
  }, [githubUrl]);

  const loadDemoContent = () => {
    // Create demo file tree
    const demoTree: TreeItem[] = [
      { path: 'src/app/page.tsx', type: 'blob', sha: 'demo1', size: 1234 },
      { path: 'src/components/Button.tsx', type: 'blob', sha: 'demo2', size: 567 },
      { path: 'src/components/Card.tsx', type: 'blob', sha: 'demo3', size: 890 },
      { path: 'src/lib/utils.ts', type: 'blob', sha: 'demo4', size: 345 },
      { path: 'package.json', type: 'blob', sha: 'demo5', size: 678 },
      { path: 'README.md', type: 'blob', sha: 'demo6', size: 234 },
      { path: 'tailwind.config.js', type: 'blob', sha: 'demo7', size: 456 },
    ];
    
    setTree(demoTree);
    setLoading(false);
  };

  const getDemoFileContent = (filePath: string): FileContent => {
    const demoContent: { [key: string]: string } = {
      'src/app/page.tsx': `'use client';

import React from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Next.js 15
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            title="Getting Started" 
            description="Learn how to build amazing web applications"
          />
          <Card 
            title="Components" 
            description="Reusable UI components for your project"
          />
        </div>
        
        <div className="mt-8">
          <Button onClick={() => console.log('Hello World!')}>
            Click me!
          </Button>
        </div>
      </div>
    </div>
  );
}`,
      'src/components/Button.tsx': `interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variantClasses[variant]} \${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }\`}
    >
      {children}
    </button>
  );
}`,
      'src/components/Card.tsx': `interface CardProps {
  title: string;
  description: string;
  image?: string;
}

export default function Card({ title, description, image }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {image && (
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}`,
      'package.json': `{
  "name": "nextjs-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}`,
      'README.md': `# Next.js Portfolio

A modern portfolio built with Next.js 15, React 18, and Tailwind CSS.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🔥 TypeScript for type safety
- 📱 Responsive design
- ✨ Modern UI components

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

\`\`\`
src/
├── app/          # Next.js App Router
├── components/   # Reusable components
└── lib/          # Utility functions
\`\`\``,
      'src/lib/utils.ts': `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\\w ]+/g, '')
    .replace(/ +/g, '-');
}`,
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}`
    };

    return {
      name: filePath.split('/').pop() || 'Unknown',
      path: filePath,
      content: demoContent[filePath] || `// Demo content for ${filePath}\n\n// This is a placeholder file to demonstrate the code editor.\n// In a real application, this would load actual file content.`,
      type: 'file'
    };
  };

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
    if (!githubUrl) {
      // Handle demo content
      setFileLoading(true);
      setTimeout(() => {
        const file = getDemoFileContent(filePath);
        setSelectedFile(file);

        // Add to tabs if not already open
        const existingTabIndex = openTabs.findIndex(tab => tab.path === file.path);
        if (existingTabIndex === -1) {
          setOpenTabs([...openTabs, file]);
          setActiveTabIndex(openTabs.length);
        } else {
          setActiveTabIndex(existingTabIndex);
        }
        setFileLoading(false);
      }, 300); // Simulate loading delay
      return;
    }
    
    try {
      setFileLoading(true);
      
      const response = await fetch(`/api/github/file?url=${encodeURIComponent(githubUrl)}&path=${encodeURIComponent(filePath)}`);
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
          <div
            className={`flex items-center py-2 px-2 hover:bg-[color:var(--color-surface-muted)] cursor-pointer text-sm transition-colors duration-200 ${
              isActive ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-primary)]'
            }`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => value.item && handleFileClick(value.item)}
          >
            {value.type === 'tree' ? (
              <>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 mr-2 text-[color:var(--accent)]" />
                ) : (
                  <Folder className="w-4 h-4 mr-2 text-[color:var(--accent)]" />
                )}
              </>
            ) : (
              <File className="w-4 h-4 mr-2 text-[color:var(--text-secondary)]" />
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

  const addLineNumbers = (content: string): string => {
    return content.split('\n').map((line, index) => {
      const lineNumber = index + 1;
      return `<div class="flex"><span class="text-[color:var(--text-muted)] mr-4 select-none w-8 text-right text-xs">${lineNumber}</span><span class="flex-1">${line || ' '}</span></div>`;
    }).join('');
  };

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
            onClick={fetchRepoTree}
            className="mt-4 px-4 py-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent-strong)] text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredTree = filterTree(buildFileTree(), searchQuery);

  return (
    <div className="h-full bg-[color:var(--color-surface)] flex text-[color:var(--text-primary)]">
      {/* File Explorer */}
      <div className="w-80 border-r border-[color:var(--color-border)] overflow-y-auto bg-[color:var(--color-surface-muted)]">
        <div className="p-4 border-b border-[color:var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-[color:var(--accent)]" />
            <h3 className="text-sm font-semibold text-[color:var(--text-primary)] truncate">
              {projectName || extractRepoFromUrl(githubUrl || '')?.split('/')[1] || (githubUrl ? 'Repository' : 'Demo Project')}
            </h3>
            {!githubUrl && (
              <span className="text-xs bg-[color:var(--accent-soft)] text-[color:var(--accent)] px-2 py-1 rounded">
                Demo
              </span>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/50"
            />
          </div>
        </div>
        
        <div className="p-2">
          {tree.length === 0 ? (
            <p className="text-[color:var(--text-muted)] text-sm">No files found</p>
          ) : (
            renderTree(filteredTree)
          )}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="flex border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            {openTabs.map((tab, index) => (
              <div
                key={tab.path}
                onClick={() => switchTab(index)}
                className={`flex items-center px-4 py-2 border-r border-[color:var(--color-border)] cursor-pointer text-sm max-w-48 ${
                  activeTabIndex === index 
                    ? 'bg-[color:var(--color-surface)] text-[color:var(--text-primary)]' 
                    : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--color-surface)]/50'
                }`}
              >
                <File className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{tab.name}</span>
                <button
                  onClick={(e) => closeTab(index, e)}
                  className="ml-2 hover:bg-[color:var(--color-border)] rounded p-1 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="p-4 border-b border-[color:var(--color-border)] flex items-center justify-between bg-[color:var(--color-surface)]">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-[color:var(--text-secondary)]" />
                <div className="flex items-center gap-3">
                  <span className="text-[color:var(--text-primary)] font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-[color:var(--text-muted)] bg-[color:var(--color-surface-muted)] px-2 py-1 rounded">
                    {getLanguageFromFilename(selectedFile.name)}
                  </span>
                </div>
              </div>
              {fileLoading && <Loader2 className="w-5 h-5 animate-spin text-[color:var(--text-secondary)]" />}
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-auto bg-[color:var(--color-surface)]">
              <div className="p-4">
                <pre className="text-sm font-mono leading-relaxed">
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: addLineNumbers(highlightCode(selectedFile.content, getLanguageFromFilename(selectedFile.name)))
                    }}
                  />
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[color:var(--text-muted)]">
            <div className="text-center max-w-md">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {githubUrl ? 'Welcome to Code Editor' : 'Demo Code Editor'}
              </p>
              <p className="text-sm mb-4">
                {githubUrl 
                  ? 'Select a file from the explorer to view its content' 
                  : 'This is a demo version. Select a file to see syntax highlighting and code formatting.'
                }
              </p>
              {!githubUrl && (
                <div className="bg-[color:var(--color-surface-muted)] rounded-lg p-4 text-left">
                  <p className="text-xs text-[color:var(--text-secondary)] mb-2">💡 Demo Features:</p>
                  <ul className="text-xs text-[color:var(--text-secondary)] space-y-1">
                    <li>• Syntax highlighting</li>
                    <li>• Multi-tab editing</li>
                    <li>• File search</li>
                    <li>• Line numbers</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}