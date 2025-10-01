'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Save,
  FolderOpen,
  FilePlus,
  Undo,
  Redo,
  Search,
  Replace,
  Settings,
  ZoomIn,
  ZoomOut,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Scissors,
  ClipboardPaste,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Menu,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  content: string;
  lastModified: Date;
  wordCount: number;
  characterCount: number;
  saved: boolean;
}

interface FindReplaceState {
  isOpen: boolean;
  findText: string;
  replaceText: string;
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  showLineNumbers: boolean;
  wordWrap: boolean;
  showInvisibles: boolean;
  autoSave: boolean;
  tabSize: number;
}

const defaultSettings: EditorSettings = {
  fontSize: 14,
  fontFamily: 'var(--font-mono)',
  lineHeight: 1.6,
  theme: 'light',
  showLineNumbers: true,
  wordWrap: true,
  showInvisibles: false,
  autoSave: true,
  tabSize: 2,
};

const fontOptions = [
  { value: 'var(--font-mono)', label: 'JetBrains Mono' },
  { value: 'var(--font-sans)', label: 'Inter' },
  { value: '"Cascadia Code", monospace', label: 'Cascadia Code' },
  { value: '"SF Mono", monospace', label: 'SF Mono' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

export default function TextEditor() {
  // Core state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);
  
  // UI state
  const [findReplace, setFindReplace] = useState<FindReplaceState>({
    isOpen: false,
    findText: '',
    replaceText: '',
    matchCase: false,
    wholeWord: false,
    useRegex: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Editor refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get active document
  const activeDocument = documents.find(doc => doc.id === activeDocumentId);

  // Initialize with welcome document
  useEffect(() => {
    const welcomeDoc: Document = {
      id: 'welcome',
      name: 'Welcome.md',
      content: `# Welcome to Text Editor

This is a fully-featured text editor built into the Fedora desktop environment.

## Features

- **Multi-document support** - Open and edit multiple files
- **Advanced find & replace** - With regex and case-sensitive options
- **Customizable interface** - Adjust fonts, themes, and layout
- **Real-time statistics** - Track word count, character count, and line numbers
- **Auto-save functionality** - Never lose your work
- **File management** - Import and export documents

## Getting Started

1. Start typing to begin editing this document
2. Use Ctrl+N to create a new document
3. Use Ctrl+O to open existing files
4. Use Ctrl+S to save your work
5. Access settings via the gear icon

## Keyboard Shortcuts

- **Ctrl+N** - New document
- **Ctrl+O** - Open file
- **Ctrl+S** - Save document
- **Ctrl+F** - Find & replace
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl++** - Zoom in
- **Ctrl+-** - Zoom out

Happy writing!`,
      lastModified: new Date(),
      wordCount: 0,
      characterCount: 0,
      saved: true,
    };

    setDocuments([welcomeDoc]);
    setActiveDocumentId(welcomeDoc.id);
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((content: string) => {
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characterCount = content.length;
    return { wordCount, characterCount };
  }, []);

  // Update document content
  const updateDocumentContent = useCallback((content: string) => {
    if (!activeDocumentId) return;

    const stats = calculateStats(content);
    
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { 
            ...doc, 
            content, 
            lastModified: new Date(),
            saved: false,
            ...stats
          }
        : doc
    ));

    // Auto-save after 2 seconds of inactivity
    if (settings.autoSave) {
      setTimeout(() => {
        saveDocument();
      }, 2000);
    }
  }, [activeDocumentId, settings.autoSave, calculateStats]);

  // Document operations
  const createNewDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: 'Untitled.txt',
      content: '',
      lastModified: new Date(),
      wordCount: 0,
      characterCount: 0,
      saved: false,
    };

    setDocuments(prev => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
    setStatusMessage('New document created');
  };

  const saveDocument = () => {
    if (!activeDocument) return;

    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, saved: true }
        : doc
    ));

    setStatusMessage(`Saved: ${activeDocument.name}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const renameDocument = (newName: string) => {
    if (!activeDocumentId || !newName.trim()) return;

    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, name: newName.trim() }
        : doc
    ));
  };

  const closeDocument = (docId: string) => {
    if (documents.length === 1) return; // Don't close the last document

    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    if (docId === activeDocumentId) {
      const remainingDocs = documents.filter(doc => doc.id !== docId);
      setActiveDocumentId(remainingDocs[0]?.id || null);
    }
  };

  // File operations
  const handleFileOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newDoc: Document = {
        id: `file-${Date.now()}`,
        name: file.name,
        content,
        lastModified: new Date(),
        ...calculateStats(content),
        saved: true,
      };

      setDocuments(prev => [...prev, newDoc]);
      setActiveDocumentId(newDoc.id);
      setStatusMessage(`Opened: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const downloadDocument = () => {
    if (!activeDocument) return;

    const blob = new Blob([activeDocument.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDocument.name;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Downloaded: ${activeDocument.name}`);
  };

  // Find and replace functionality
  const performFind = () => {
    if (!textareaRef.current || !findReplace.findText) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const searchText = findReplace.findText;
    
    let flags = 'g';
    if (!findReplace.matchCase) flags += 'i';
    
    const regex = findReplace.useRegex 
      ? new RegExp(searchText, flags)
      : new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    
    const matches = Array.from(text.matchAll(regex));
    if (matches.length > 0) {
      const firstMatch = matches[0];
      textarea.setSelectionRange(firstMatch.index!, firstMatch.index! + firstMatch[0].length);
      textarea.focus();
      setStatusMessage(`Found ${matches.length} matches`);
    } else {
      setStatusMessage('No matches found');
    }
  };

  const performReplace = () => {
    if (!textareaRef.current || !findReplace.findText) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    
    let flags = 'g';
    if (!findReplace.matchCase) flags += 'i';
    
    const regex = findReplace.useRegex 
      ? new RegExp(findReplace.findText, flags)
      : new RegExp(findReplace.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    
    const newText = text.replace(regex, findReplace.replaceText);
    updateDocumentContent(newText);
    
    if (textareaRef.current) {
      textareaRef.current.value = newText;
    }
    
    setStatusMessage('Text replaced');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            createNewDocument();
            break;
          case 's':
            e.preventDefault();
            saveDocument();
            break;
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          case 'f':
            e.preventDefault();
            setFindReplace(prev => ({ ...prev, isOpen: !prev.isOpen }));
            break;
          case '=':
          case '+':
            e.preventDefault();
            setSettings(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 1, 24) }));
            break;
          case '-':
            e.preventDefault();
            setSettings(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 1, 8) }));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-update stats when content changes
  useEffect(() => {
    if (activeDocument) {
      const stats = calculateStats(activeDocument.content);
      if (stats.wordCount !== activeDocument.wordCount || stats.characterCount !== activeDocument.characterCount) {
        setDocuments(prev => prev.map(doc => 
          doc.id === activeDocumentId 
            ? { ...doc, ...stats }
            : doc
        ));
      }
    }
  }, [activeDocument?.content, activeDocumentId, calculateStats]);

  if (!activeDocument) {
    return (
      <div className="h-full bg-surface flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">No document selected</p>
          <button 
            onClick={createNewDocument}
            className="btn btn-primary mt-4"
          >
            Create New Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-surface flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-color bg-surface-muted px-md py-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            {/* File operations */}
            <button 
              onClick={createNewDocument}
              className="btn-icon"
              title="New document (Ctrl+N)"
            >
              <FilePlus className="h-4 w-4" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.py,.java,.cpp,.c,.h,.php,.rb,.go,.rs,.swift"
              onChange={handleFileOpen}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon"
              title="Open file (Ctrl+O)"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            
            <button 
              onClick={saveDocument}
              className="btn-icon"
              title="Save document (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
            </button>
            
            <button 
              onClick={downloadDocument}
              className="btn-icon"
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <div className="h-6 w-px bg-border mx-sm" />
            
            {/* Edit operations */}
            <button 
              onClick={() => setFindReplace(prev => ({ ...prev, isOpen: !prev.isOpen }))}
              className="btn-icon"
              title="Find & Replace (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </button>
            
            <div className="h-6 w-px bg-border mx-sm" />
            
            {/* View options */}
            <button 
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="btn-icon"
              title="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setSettings(prev => ({ ...prev, showLineNumbers: !prev.showLineNumbers }))}
              className={`btn-icon ${settings.showLineNumbers ? 'bg-accent-soft text-accent' : ''}`}
              title="Toggle line numbers"
            >
              <List className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="btn-icon"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          
          {/* Document info */}
          <div className="flex items-center gap-md text-sm text-text-secondary">
            <input
              type="text"
              value={activeDocument.name}
              onChange={(e) => renameDocument(e.target.value)}
              className="bg-transparent border-none outline-none text-text-primary font-medium min-w-0 max-w-48"
            />
            <span className={`px-sm py-xs rounded text-xs ${activeDocument.saved ? 'text-success' : 'text-warning'}`}>
              {activeDocument.saved ? '●' : '●'} {activeDocument.saved ? 'Saved' : 'Modified'}
            </span>
          </div>
        </div>
      </div>

      {/* Find & Replace Panel */}
      {findReplace.isOpen && (
        <div className="flex-shrink-0 border-b border-color bg-surface-muted p-md">
          <div className="flex items-center gap-md">
            <div className="flex-1 flex items-center gap-sm">
              <input
                type="text"
                placeholder="Find..."
                value={findReplace.findText}
                onChange={(e) => setFindReplace(prev => ({ ...prev, findText: e.target.value }))}
                className="flex-1 px-sm py-xs border border-color rounded-md bg-surface"
              />
              <input
                type="text"
                placeholder="Replace..."
                value={findReplace.replaceText}
                onChange={(e) => setFindReplace(prev => ({ ...prev, replaceText: e.target.value }))}
                className="flex-1 px-sm py-xs border border-color rounded-md bg-surface"
              />
            </div>
            
            <div className="flex items-center gap-sm">
              <button onClick={performFind} className="btn btn-secondary">
                Find
              </button>
              <button onClick={performReplace} className="btn btn-primary">
                Replace All
              </button>
              <button 
                onClick={() => setFindReplace(prev => ({ ...prev, isOpen: false }))}
                className="btn-icon"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-md mt-sm">
            <label className="flex items-center gap-xs text-sm">
              <input
                type="checkbox"
                checked={findReplace.matchCase}
                onChange={(e) => setFindReplace(prev => ({ ...prev, matchCase: e.target.checked }))}
              />
              Match case
            </label>
            <label className="flex items-center gap-xs text-sm">
              <input
                type="checkbox"
                checked={findReplace.wholeWord}
                onChange={(e) => setFindReplace(prev => ({ ...prev, wholeWord: e.target.checked }))}
              />
              Whole word
            </label>
            <label className="flex items-center gap-xs text-sm">
              <input
                type="checkbox"
                checked={findReplace.useRegex}
                onChange={(e) => setFindReplace(prev => ({ ...prev, useRegex: e.target.checked }))}
              />
              Use regex
            </label>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-64 border-r border-color bg-surface-muted flex flex-col">
            {/* Documents list */}
            <div className="p-md border-b border-color">
              <h3 className="font-semibold text-text-primary mb-sm">Documents</h3>
              <div className="space-y-xs">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between px-sm py-xs rounded cursor-pointer transition-colors ${
                      doc.id === activeDocumentId 
                        ? 'bg-accent-soft text-accent' 
                        : 'hover:bg-surface-hover'
                    }`}
                    onClick={() => setActiveDocumentId(doc.id)}
                  >
                    <div className="flex items-center gap-xs min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">{doc.name}</span>
                      {!doc.saved && <span className="text-warning">●</span>}
                    </div>
                    {documents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeDocument(doc.id);
                        }}
                        className="btn-icon p-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="p-md">
              <h3 className="font-semibold text-text-primary mb-sm">Statistics</h3>
              <div className="space-y-xs text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span>{activeDocument.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span>{activeDocument.characterCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lines:</span>
                  <span>{activeDocument.content.split('\n').length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modified:</span>
                  <span>{activeDocument.lastModified.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Settings panel overlay */}
          {showSettings && (
            <div className="absolute inset-0 bg-surface-muted/95 backdrop-blur-sm z-10 p-lg">
              <div className="max-w-md mx-auto bg-surface border border-color rounded-lg p-lg">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="text-lg font-semibold">Editor Settings</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="btn-icon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-lg">
                  {/* Font settings */}
                  <div>
                    <label className="block text-sm font-medium mb-sm">Font Family</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-sm py-xs border border-color rounded-md bg-surface"
                    >
                      {fontOptions.map(font => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-sm">
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-sm">
                      Line Height: {settings.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) => setSettings(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Checkbox settings */}
                  <div className="space-y-sm">
                    <label className="flex items-center gap-xs">
                      <input
                        type="checkbox"
                        checked={settings.showLineNumbers}
                        onChange={(e) => setSettings(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
                      />
                      Show line numbers
                    </label>
                    <label className="flex items-center gap-xs">
                      <input
                        type="checkbox"
                        checked={settings.wordWrap}
                        onChange={(e) => setSettings(prev => ({ ...prev, wordWrap: e.target.checked }))}
                      />
                      Word wrap
                    </label>
                    <label className="flex items-center gap-xs">
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      />
                      Auto-save
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            {settings.showLineNumbers && (
              <div 
                className="w-16 bg-surface-muted border-r border-color p-sm text-right font-mono text-sm text-text-muted select-none overflow-hidden"
                style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
              >
                {Array.from({ length: activeDocument.content.split('\n').length }, (_, i) => (
                  <div key={i + 1} className="leading-[inherit]">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            
            {/* Text area */}
            <textarea
              ref={textareaRef}
              value={activeDocument.content}
              onChange={(e) => updateDocumentContent(e.target.value)}
              className="flex-1 p-md resize-none outline-none bg-surface text-text-primary custom-scrollbar"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
                tabSize: settings.tabSize,
              }}
              placeholder="Start typing..."
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 border-t border-color bg-surface-muted px-md py-xs">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center gap-lg">
            <span>Line {activeDocument.content.split('\n').length}</span>
            <span>Column 1</span>
            <span>{settings.fontSize}px</span>
            {statusMessage && <span className="text-accent">{statusMessage}</span>}
          </div>
          
          <div className="flex items-center gap-lg">
            <span>UTF-8</span>
            <span>Text</span>
            <span>{Math.round(settings.fontSize * 100 / 14)}% zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}