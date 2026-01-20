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
  const [repos, setRepos] = useState<any[]>([]); // Store user repositories
  const [reposLoading, setReposLoading] = useState(false); // Loading state for repos

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

  // Effect to handle when repoUrl changes externally
  useEffect(() => {
    if (repoUrl && viewMode === 'files') {
      fetchRepoTree(repoUrl);
    }
  }, [repoUrl, viewMode]);

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

  const fetchUserRepos = async () => {
    try {
      setReposLoading(true);
      setError(null);

      // Use the same username as in Portfolio.tsx
      const username = 'Zburgers'; // This could be configurable

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
      // Fall back to demo content if there's an error
      loadDemoContent();
      setViewMode('files');
    } finally {
      setReposLoading(false);
    }
  };

  // Helper function to fetch repo for a specific URL
  const fetchRepoForUrl = async (url: string, name: string) => {
    // Update the repoUrl state and call fetchRepoTree with the new URL
    try {
      setRepoUrl(url); // Set the new repository URL
      setViewMode('files'); // Switch to file view first
      await fetchRepoTree(url); // Fetch the tree for the new URL
    } catch (error) {
      console.error('Error fetching repository:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repository');
    }
  };

  // Function to get color for programming language
  const getLanguageColor = (language: string): string => {
    const languageColors: { [key: string]: string } = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#178600',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Scala': '#c22d40',
      'R': '#198CE7',
      'Shell': '#89e051',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'SCSS': '#c6538c',
      'Sass': '#c6538c',
      'Vue': '#41b883',
      'React': '#61dafb',
      'Angular': '#dd0031',
      'Dockerfile': '#384d54',
      'JSON': '#292929',
      'YAML': '#cb171e',
      'Markdown': '#083fa1',
      'Jupyter Notebook': '#DA5B0B',
      'Dart': '#00B4AB',
      'Flutter': '#61DAFB',
      'Perl': '#0298c3',
      'Haskell': '#5e5086',
      'Elixir': '#6e4a7e',
      'Erlang': '#B83998',
      'Clojure': '#5881d8',
      'Lua': '#000080',
      'OCaml': '#3be133',
      'Julia': '#a270ba',
      'Vim script': '#199c4b',
      'Assembly': '#6E4C13',
      'COBOL': '#005CA5',
      'Fortran': '#4d41b1',
      'Lisp': '#3fb68b',
      'MATLAB': '#e16737',
      'Objective-C': '#438eff',
      'Pascal': '#E3F171',
      'SQL': '#e38c00',
      'TeX': '#3D6117',
      'D': '#ba595e',
      'Delphi': '#b0ce4e',
      'Groovy': '#e69f56',
      'PowerShell': '#012456',
      'Raku': '#0000fb',
      'Scheme': '#1e4aec',
      'Smalltalk': '#596706',
      'Standard ML': '#dc566d',
      'Tcl': '#e4cc98',
      'Verilog': '#b2b7f8',
      'VHDL': '#adb2cb',
      'Common Lisp': '#3fb68b',
      'Emacs Lisp': '#c0dc41',
      'AutoHotkey': '#6594b9',
      'Crystal': '#000100',
      'DM': '#447265',
      'Dogescript': '#cca760',
      'Eiffel': '#4d6977',
      'Gherkin': '#5B2063',
      'Gradle': '#02303a',
      'J': '#9EEDFF',
      'LLVM': '#185619',
      'Makefile': '#427819',
      'Max': '#c4a79c',
      'NewLISP': '#87AED7',
      'Nu': '#c9df40',
      'OCaml': '#3be133',
      'Octave': '#0790C0',
      'SQF': '#3F3F3F',
      'Self': '#0579aa',
      'SystemVerilog': '#DAE1C2',
      'TI Program': '#A0AA87',
      'WebAssembly': '#04133b',
      'Batchfile': '#C1F12E',
      'BitBake': '#00bce4',
      'C Shell': '#447265',
      'C#': '#178600',
      'C++': '#f34b7d',
      'CUDA': '#3A4E3A',
      'Cap\'n Proto': '#c42727',
      'CartoCSS': '#bb9d23',
      'Chapel': '#8dc63f',
      'Clean': '#3F85AF',
      'Click': '#E4E6F3',
      'Component Pascal': '#b0ce4e',
      'Coq': '#d0b68c',
      'F#': '#b845fc',
      'FLUX': '#88ccff',
      'Gnuplot': '#f0a9f0',
      'HaXe': '#df7900',
      'Hy': '#7790B2',
      'IDL': '#a3522f',
      'IPython Notebook': '#DA5B0B',
      'Idris': '#b30000',
      'Inform 7': '#324d7c',
      'JFlex': '#DBCA00',
      'JSONiq': '#40d47e',
      'JSX': '#555555',
      'KRL': '#28431f',
      'LabVIEW': '#fede06',
      'Lex': '#DBCA00',
      'Logos': '#000070',
      'M4': '#b07219',
      'MAXScript': '#00a6a6',
      'MTML': '#b7e1f4',
      'MUF': '#008080',
      'Mako': '#7e78d3',
      'Mathematica': '#ddaf4c',
      'Mirah': '#c7a938',
      'Moocode': '#6a86ef',
      'Myghty': '#fedf54',
      'NetLinx': '#0aa0ff',
      'NetLinx+ERB': '#747fa0',
      'Nix': '#7eafe9',
      'NuSMV': '#b4fd8c',
      'NumPy': '#9C80D2',
      'OpenEdge ABL': '#5ce600',
      'OpenRC runscript': '#EBCB8B',
      'Parrot': '#f3ca0c',
      'Pike': '#005390',
      'Pod': '#13538A',
      'PogoScript': '#d9a3e3',
      'Processing': '#0096D8',
      'Propeller Spin': '#7fa2a7',
      'Protocol Buffer': '#a42e2b',
      'Public Key': '#005390',
      'RenderScript': '#526e9c',
      'RobotFramework': '#00c0b5',
      'Rouge': '#cc0088',
      'Ruby': '#701516',
      'SAS': '#B34936',
      'SLIM': '#ff8f77',
      'SPARQL': '#0C4597',
      'SRecode Template': '#348a34',
      'Sage': '#30a3cc',
      'SaltStack': '#646464',
      'SourcePawn': '#f69e1d',
      'Stata': '#1a5f91',
      'Turing': '#cf142b',
      'TXL': '#0178b8',
      'Unified Parallel C': '#4e3617',
      'Unix Assembly': '#6E4C13',
      'Uno': '#9933cc',
      'UnrealScript': '#a54c4d',
      'XL': '#2274A5',
      'XProc': '#52e052',
      'XQuery': '#5232e5',
      'XSLT': '#EB8CEB',
      'Yacc': '#4B6C4B',
      'Zephir': '#118f9e',
      'Zimpl': '#d67711',
      'desktop': '#008080',
      'dircolors': '#608000',
      'eC': '#913960',
      'edn': '#db5855',
      'fish': '#4aae47',
      'jq': '#c72e0f',
      'mIRC Script': '#3d57c3',
      'mcfunction': '#E22837',
      'nesC': '#94B0C7',
      'ooc': '#b0b77e',
      'reStructuredText': '#148AA8',
      'sed': '#64b970',
      'wdl': '#42f1f4',
      'wisp': '#7582D1',
      'xBase': '#403a40',
      'Dockerfile': '#384d54',
      'EditorConfig': '#fff',
      'Git': '#f00',
      'GraphQL': '#e10098',
      'HTML+ECR': '#525D69',
      'HTML+EEX': '#6e4a7e',
      'HTML+ERB': '#701516',
      'HTML+PHP': '#4f5d95',
      'HTTP': '#000',
      'Haml': '#ece2a9',
      'Ini': '#d1dbe0',
      'JSON': '#292929',
      'Java Server Pages': '#2a6277',
      'JavaScript+ERB': '#f1e05a',
      'Jinja': '#a52a22',
      'Less': '#345',
      'Liquid': '#67b11d',
      'Makefile': '#427819',
      'Mustache': '#724b3b',
      'NPM Config': '#cb3837',
      'Nginx': '#009639',
      'Nix': '#7ebae4',
      'PostCSS': '#dc3545',
      'PostScript': '#da291c',
      'Properties': '#d1dbe0',
      'Pug': '#a86454',
      'Pure Data': '#91de79',
      'RAML': '#77d9fb',
      'RDoc': '#701516',
      'Ren\'Py': '#ff7f7f',
      'SMT': '#62a91a',
      'Scaml': '#ece2a9',
      'Slim': '#ff8f77',
      'Standard ML': '#dc566d',
      'StringTemplate': '#3fb68b',
      'Stylus': '#333333',
      'SystemVerilog': '#DAE1C2',
      'TOML': '#9c58b0',
      'Template Toolkit': '#fb773c',
      'Twig': '#c8c8c8',
      'UNKNOWN': '#ccc',
      'VCL': '#148AA8',
      'VHDL': '#adb2cb',
      'Vala': '#a56de2',
      'Verilog': '#b2b7f8',
      'Vim Snippet': '#199c4b',
      'Visual Basic': '#945db7',
      'Volt': '#1f085e',
      'Vue': '#41b883',
      'Web Ontology Language': '#5b70bd',
      'XML': '#0060ac',
      'XPages': '#00abee',
      'XSLT': '#EB8CEB',
      'YAML': '#cb171e',
      'YANG': '#e683d9',
      'ZBrush Scripting Language': '#00447C',
      'Zeek': '#0070a8',
      'eC': '#913960',
      'edn': '#db5855',
      'fish': '#4aae47',
      'hoon': '#00b171',
      'jq': '#c72e0f',
      'mupad': '#244963',
      'nanorc': '#2d004d',
      'nesC': '#94B0C7',
      'ooc': '#b0b77e',
      'reStructuredText': '#148AA8',
      'sed': '#64b970',
      'wdl': '#42f1f4',
      'wisp': '#7582D1',
      'xBase': '#403a40'
    };

    return languageColors[language] || '#888888'; // Default color if language not found
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
            className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-xs ${
              isActive ? 'bg-[#2a2d2e]' : ''
            }`}
            style={{ paddingLeft: `${depth * 18}px` }}
            onClick={() => value.item && handleFileClick(value.item)}
          >
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              {value.type === 'tree' ? (
                <>
                  {hasChildren && (
                    <div className="w-3 h-3 flex items-center justify-center">
                      {isExpanded ? (
                        <div className="text-[#d7dae0]">▼</div>
                      ) : (
                        <div className="text-[#d7dae0]">▶</div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-3 h-3 flex items-center justify-center">
                  <File className="w-3 h-3 text-[#9e9e9e]" />
                </div>
              )}
            </div>
            <span className={`${isActive ? 'text-[#ffffff]' : 'text-[#cccccc]'}`}>{value.name}</span>
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

  // Repository Selection View
  if (viewMode === 'repos') {
    if (reposLoading) {
      return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
          {/* Top Menu Bar - VS Code Style */}
          <div className="h-7 bg-[#3c3c3c] flex items-center px-4 text-sm">
            <div className="flex space-x-4">
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">File</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Edit</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">View</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Run</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Terminal</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Help</span>
            </div>
          </div>

          {/* Main Content Area - Welcome Screen */}
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center max-w-4xl w-full p-8">
              <div className="text-[#d7dae0] text-6xl mb-6 font-bold">VS Code</div>
              <h2 className="text-2xl font-light text-[#d7dae0] mb-10">Welcome to Visual Studio Code</h2>

              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl">
                  <div className="text-left mb-8">
                    <h3 className="text-lg text-[#d7dae0] mb-4">Recent Repositories</h3>

                    {repos.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="inline-block p-4 bg-[#2d2d2d] rounded-lg mb-4">
                          <Folder className="w-12 h-12 text-[#858585] mx-auto" />
                        </div>
                        <p className="text-[#858585]">No repositories found</p>
                        <p className="text-[#858585] text-sm mt-2">Loading repositories...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repos.slice(0, 6).map((repo) => (
                          <div
                            key={repo.id}
                            onClick={() => {
                              const newGithubUrl = repo.htmlUrl;
                              fetchRepoForUrl(newGithubUrl, repo.name);
                            }}
                            className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] rounded-md p-4 cursor-pointer transition-all duration-200 flex items-center"
                          >
                            <div className="mr-3">
                              <Folder className="w-6 h-6 text-[#75beff]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[#d7dae0] font-medium truncate">{repo.name}</div>
                              <div className="text-[#858585] text-sm truncate">{repo.description || 'No description'}</div>
                              <div className="flex items-center mt-1 text-xs">
                                {repo.language && (
                                  <span className="flex items-center mr-3">
                                    <div
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                                    ></div>
                                    {repo.language}
                                  </span>
                                )}
                                <span className="text-[#858585]">★ {repo.stargazersCount}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className="text-lg text-[#d7dae0] mb-4">Get Started</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={fetchUserRepos}
                        className="bg-[#0e639c] hover:bg-[#1177bb] text-white py-3 px-4 rounded-md transition-colors text-left"
                      >
                        <div className="font-medium">Clone Repository</div>
                        <div className="text-sm opacity-80">Connect to a Git repository</div>
                      </button>
                      <button className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#d7dae0] py-3 px-4 rounded-md transition-colors text-left">
                        <div className="font-medium">Open Repository</div>
                        <div className="text-sm opacity-80">Open a local repository</div>
                      </button>
                      <button className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#d7dae0] py-3 px-4 rounded-md transition-colors text-left">
                        <div className="font-medium">Continue Without Repository</div>
                        <div className="text-sm opacity-80">Start coding without a repository</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar - Bottom */}
          <div className="h-6 bg-[#0078d4] text-white text-xs flex items-center justify-between px-3">
            <div className="flex items-center space-x-3">
              <span>main*</span>
              <span>Ln 1, Col 1</span>
              <span>Spaces: 2</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>UTF-8</span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
          {/* Top Menu Bar - VS Code Style */}
          <div className="h-7 bg-[#3c3c3c] flex items-center px-4 text-sm">
            <div className="flex space-x-4">
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">File</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Edit</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">View</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Run</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Terminal</span>
              <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Help</span>
            </div>
          </div>

          {/* Main Content Area - Error Screen */}
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center max-w-md">
              <div className="text-[#f14c4c] text-5xl mb-4">!</div>
              <h2 className="text-xl font-medium text-[#d7dae0] mb-2">Error Loading Repositories</h2>
              <p className="text-[#9d9d9d] mb-4">{error}</p>
              <button
                onClick={fetchUserRepos}
                className="bg-[#0e639c] hover:bg-[#1177bb] text-white py-2 px-4 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Status Bar - Bottom */}
          <div className="h-6 bg-[#0078d4] text-white text-xs flex items-center justify-between px-3">
            <div className="flex items-center space-x-3">
              <span>Error</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
        {/* Top Menu Bar - VS Code Style */}
        <div className="h-7 bg-[#3c3c3c] flex items-center px-4 text-sm">
          <div className="flex space-x-4">
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">File</span>
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Edit</span>
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">View</span>
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Run</span>
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Terminal</span>
            <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Help</span>
          </div>
        </div>

        {/* Main Content Area - Welcome Screen */}
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
          <div className="text-center max-w-4xl w-full p-8">
            <div className="text-[#d7dae0] text-6xl mb-6 font-bold">VS Code</div>
            <h2 className="text-2xl font-light text-[#d7dae0] mb-10">Welcome to Visual Studio Code</h2>

            <div className="flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <div className="text-left mb-8">
                  <h3 className="text-lg text-[#d7dae0] mb-4">Recent Repositories</h3>

                  {repos.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="inline-block p-4 bg-[#2d2d2d] rounded-lg mb-4">
                        <Folder className="w-12 h-12 text-[#858585] mx-auto" />
                      </div>
                      <p className="text-[#858585]">No repositories found</p>
                      <p className="text-[#858585] text-sm mt-2">Connect to GitHub to see your repositories</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repos.slice(0, 6).map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => {
                            const newGithubUrl = repo.htmlUrl;
                            fetchRepoForUrl(newGithubUrl, repo.name);
                          }}
                          className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] rounded-md p-4 cursor-pointer transition-all duration-200 flex items-center"
                        >
                          <div className="mr-3">
                            <Folder className="w-6 h-6 text-[#75beff]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#d7dae0] font-medium truncate">{repo.name}</div>
                            <div className="text-[#858585] text-sm truncate">{repo.description || 'No description'}</div>
                            <div className="flex items-center mt-1 text-xs">
                              {repo.language && (
                                <span className="flex items-center mr-3">
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                                  ></div>
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-[#858585]">★ {repo.stargazersCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-left">
                  <h3 className="text-lg text-[#d7dae0] mb-4">Get Started</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={fetchUserRepos}
                      className="bg-[#0e639c] hover:bg-[#1177bb] text-white py-3 px-4 rounded-md transition-colors text-left"
                    >
                      <div className="font-medium">Clone Repository</div>
                      <div className="text-sm opacity-80">Connect to a Git repository</div>
                    </button>
                    <button className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#d7dae0] py-3 px-4 rounded-md transition-colors text-left">
                      <div className="font-medium">Open Repository</div>
                      <div className="text-sm opacity-80">Open a local repository</div>
                    </button>
                    <button className="bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] text-[#d7dae0] py-3 px-4 rounded-md transition-colors text-left">
                      <div className="font-medium">Continue Without Repository</div>
                      <div className="text-sm opacity-80">Start coding without a repository</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar - Bottom */}
        <div className="h-6 bg-[#0078d4] text-white text-xs flex items-center justify-between px-3">
          <div className="flex items-center space-x-3">
            <span>main*</span>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>UTF-8</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    );
  }

  // File Browser View (existing code)
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
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      {/* Top Menu Bar - VS Code Style */}
      <div className="h-7 bg-[#3c3c3c] flex items-center px-4 text-sm">
        <div className="flex space-x-4">
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">File</span>
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Edit</span>
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">View</span>
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Run</span>
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Terminal</span>
          <span className="hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">Help</span>
        </div>
      </div>

      {/* Main Content Area - VS Code Style */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar - Left Side Icons */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2">
          <div className="mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2d2e] cursor-pointer">
              <Folder className="w-5 h-5 text-[#d7dae0]" />
            </div>
          </div>
          <div className="mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2d2e] cursor-pointer">
              <Search className="w-5 h-5 text-[#d7dae0]" />
            </div>
          </div>
          <div className="mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2d2e] cursor-pointer">
              <div className="w-5 h-5 text-[#d7dae0]">⎇</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2d2e] cursor-pointer">
              <div className="w-5 h-5 text-[#d7dae0]">⚙️</div>
            </div>
          </div>
        </div>

        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          <div className="p-3 border-b border-[#3c3c3c]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-semibold text-[#d7dae0] tracking-wide">
                {projectName || extractRepoFromUrl(repoUrl || githubUrl || '')?.split('/')[1] || (repoUrl || githubUrl ? 'Explorer' : 'Demo Explorer')}
              </h3>
              <div className="flex space-x-1">
                <button className="text-[#d7dae0] hover:bg-[#2a2d2e] p-1 rounded">
                  +
                </button>
                <button className="text-[#d7dae0] hover:bg-[#2a2d2e] p-1 rounded">
                  ...
                </button>
              </div>
            </div>

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
              <p className="text-[#858585] text-xs p-3">No files found</p>
            ) : (
              renderTree(filteredTree)
            )}
          </div>
        </div>

        {/* Editor Area - Main Content */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Tab Bar - VS Code Style */}
          {openTabs.length > 0 && (
            <div className="flex bg-[#2d2d2d] border-b border-[#3c3c3c] h-8 overflow-x-auto">
              {openTabs.map((tab, index) => (
                <div
                  key={tab.path}
                  onClick={() => switchTab(index)}
                  className={`flex items-center px-3 border-r border-[#3c3c3c] cursor-pointer text-xs h-full ${
                    activeTabIndex === index
                      ? 'bg-[#1e1e1e] border-t border-[#0078d4]'
                      : 'bg-[#2d2d2d] hover:bg-[#3a3d41]'
                  }`}
                >
                  <File className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{tab.name}</span>
                  <button
                    onClick={(e) => closeTab(index, e)}
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
              <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
                <div className="text-center">
                  <div className="text-[#d7dae0] text-5xl mb-4"> &lt;/&gt; </div>
                  <p className="text-[#d7dae0] text-lg font-medium mb-2">
                    {repoUrl || githubUrl ? 'Welcome to Code Editor' : 'Demo Code Editor'}
                  </p>
                  <p className="text-[#9d9d9d] text-sm max-w-md mx-auto">
                    {repoUrl || githubUrl
                      ? 'Select a file from the explorer to view its content'
                      : 'This is a demo version. Select a file to see syntax highlighting and code formatting.'
                    }
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
      <div className="h-6 bg-[#0078d4] text-white text-xs flex items-center justify-between px-3">
        <div className="flex items-center space-x-3">
          <span>main*</span>
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>UTF-8</span>
          <span>{getLanguageFromFilename(selectedFile?.name || 'text')}</span>
        </div>
      </div>
    </div>
  );
}