'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Save,
  FolderOpen,
  FilePlus,
  Search,
  Settings,
  Download,
  List,
  Menu,
  X,
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

const draftStorageKey = (id: string) => `portfolio-text-editor:${id}`;
const documentIndexKey = 'portfolio-text-editor:documents';

function makeSearchRegex(options: FindReplaceState): RegExp {
  const source = options.useRegex
    ? options.findText
    : options.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundedSource = options.wholeWord ? `\\b(?:${source})\\b` : source;
  return new RegExp(boundedSource, options.matchCase ? 'g' : 'gi');
}

function persistDraft(id: string, name: string, content: string) {
  localStorage.setItem(draftStorageKey(id), content);
  const stored = JSON.parse(localStorage.getItem(documentIndexKey) ?? '[]') as unknown;
  const index = Array.isArray(stored)
    ? stored.filter((entry): entry is { id: string; name: string } => typeof entry?.id === 'string' && typeof entry?.name === 'string')
    : [];
  localStorage.setItem(documentIndexKey, JSON.stringify([
    ...index.filter((entry) => entry.id !== id),
    { id, name },
  ]));
  if (id.startsWith('Home/')) {
    window.dispatchEvent(new CustomEvent('portfolio-file-saved', { detail: { path: id } }));
  }
}

function loadSavedDocuments(): Document[] {
  try {
    const index = JSON.parse(localStorage.getItem(documentIndexKey) ?? '[]') as Array<{ id?: unknown; name?: unknown }>;
    if (!Array.isArray(index)) return [];
    return index.flatMap((entry) => {
      if (typeof entry?.id !== 'string' || typeof entry.name !== 'string') return [];
      const content = localStorage.getItem(draftStorageKey(entry.id));
      if (content === null) return [];
      return [{
        id: entry.id,
        name: entry.name,
        content,
        lastModified: new Date(),
        wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
        characterCount: content.length,
        saved: true,
      }];
    });
  } catch {
    return [];
  }
}

const fontOptions = [
  { value: 'var(--font-mono)', label: 'Geist Mono' },
  { value: 'var(--font-sans)', label: 'Geist Sans' },
  { value: '"Cascadia Code", monospace', label: 'Cascadia Code' },
  { value: '"SF Mono", monospace', label: 'SF Mono' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

export default function TextEditor({ initialFileName, initialFilePath, initialContent }: {
  initialFileName?: string;
  initialFilePath?: string;
  initialContent?: string;
}) {
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
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  
  // Editor refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get active document
  const activeDocument = documents.find(doc => doc.id === activeDocumentId);

  // Open the requested file, restoring its local draft when one exists.
  useEffect(() => {
    const id = initialFilePath || initialFileName || 'welcome';
    const name = initialFileName || 'Welcome.md';
    const defaultContent = initialFileName
      ? initialContent || ''
      : '# Welcome to Text Editor\n\nEdit a file, save a browser-local draft, or download a copy.';
    let content = defaultContent;
    let hasSavedDraft = false;
    try {
      const savedDraft = localStorage.getItem(draftStorageKey(id));
      if (savedDraft !== null) {
        content = savedDraft;
        hasSavedDraft = true;
      }
    } catch {
      // Browser storage may be disabled; the editor still works in memory.
    }
    const welcomeDoc: Document = {
      id,
      name,
      content,
      lastModified: new Date(),
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      characterCount: content.length,
      saved: hasSavedDraft,
    };

    setDocuments((previous) => {
      const restored = previous.length ? previous : loadSavedDocuments();
      const current = restored.find((doc) => doc.id === id);
      return current ? restored : [...restored, welcomeDoc];
    });
    setActiveDocumentId(welcomeDoc.id);
  }, [initialFileName, initialFilePath, initialContent]);

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

  }, [activeDocumentId, calculateStats]);

  const setCursorPosition = (position: number, content = activeDocument?.content ?? '') => {
    const beforeCursor = content.slice(0, position);
    const lines = beforeCursor.split('\n');
    setCursor({ line: lines.length, column: lines[lines.length - 1].length + 1 });
  };

  // Document operations
  const createNewDocument = () => {
    const newDoc: Document = {
      id: `local/Untitled-${Date.now()}.txt`,
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

  const saveDocument = useCallback(() => {
    if (!activeDocument) return;

    try {
      persistDraft(activeDocument.id, activeDocument.name, activeDocument.content);
    } catch {
      setStatusMessage('Browser storage unavailable — download a copy to keep this document');
      return;
    }

    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, saved: true }
        : doc
    ));

    setStatusMessage(`Saved: ${activeDocument.name}`);
    setTimeout(() => setStatusMessage(''), 3000);
  }, [activeDocument, activeDocumentId]);

  useEffect(() => {
    if (!settings.autoSave || !activeDocument || activeDocument.saved) return;
    const timeout = window.setTimeout(() => {
      try {
        persistDraft(activeDocument.id, activeDocument.name, activeDocument.content);
        setDocuments(prev => prev.map(doc => doc.id === activeDocument.id ? { ...doc, saved: true } : doc));
      } catch {
        setStatusMessage('Browser storage unavailable — download a copy to keep this document');
      }
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [activeDocument?.id, activeDocument?.name, activeDocument?.content, activeDocument?.saved, settings.autoSave]);

  const renameDocument = (newName: string) => {
    if (!activeDocumentId || !newName.trim()) return;

    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, name: newName.trim(), saved: false }
        : doc
    ));
  };

  const closeDocument = (docId: string) => {
    if (documents.length === 1) return; // Don't close the last document

    const closing = documents.find((doc) => doc.id === docId);
    if (closing && !closing.saved) {
      if (settings.autoSave) {
        try {
          persistDraft(closing.id, closing.name, closing.content);
        } catch {
          if (!window.confirm(`${closing.name} could not be saved in this browser. Close and lose the unsaved changes?`)) return;
        }
      } else if (!window.confirm(`Discard unsaved changes to ${closing.name}?`)) {
        return;
      }
    }

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
      const source = e.target?.result;
      if (typeof source !== 'string') {
        setStatusMessage(`Could not read ${file.name} as text`);
        return;
      }
      const id = `Imported/${file.name}`;
      let content = source;
      let hasSavedDraft = false;
      try {
        const savedDraft = localStorage.getItem(draftStorageKey(id));
        if (savedDraft !== null) {
          content = savedDraft;
          hasSavedDraft = true;
        }
      } catch {
        // Keep the selected file content in memory when storage is unavailable.
      }
      const newDoc: Document = {
        id,
        name: file.name,
        content,
        lastModified: new Date(),
        ...calculateStats(content),
        saved: hasSavedDraft,
      };

      setDocuments(prev => [...prev.filter((doc) => doc.id !== id), newDoc]);
      setActiveDocumentId(newDoc.id);
      setStatusMessage(`Opened: ${file.name}`);
    };
    reader.onerror = () => setStatusMessage(`Could not read ${file.name}`);
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadDocument = () => {
    if (!activeDocument) return;

    const blob = new Blob([activeDocument.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDocument.name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatusMessage(`Downloaded: ${activeDocument.name}`);
  };

  // Find and replace functionality
  const performFind = () => {
    const textarea = textareaRef.current;
    if (!textarea || !activeDocument || !findReplace.findText) return;

    try {
      const matches = Array.from(activeDocument.content.matchAll(makeSearchRegex(findReplace)));
      const match = matches.find((candidate) => (candidate.index ?? 0) >= textarea.selectionEnd) ?? matches[0];
      if (!match) {
        setStatusMessage('No matches found');
        return;
      }
      const start = match.index ?? 0;
      textarea.setSelectionRange(start, start + match[0].length);
      textarea.focus();
      setCursorPosition(start + match[0].length, activeDocument.content);
      setStatusMessage(`Match ${matches.indexOf(match) + 1} of ${matches.length}`);
    } catch {
      setStatusMessage('Invalid regular expression');
    }
  };

  const performReplace = () => {
    if (!activeDocument || !findReplace.findText) return;
    try {
      const regex = makeSearchRegex(findReplace);
      const matches = Array.from(activeDocument.content.matchAll(regex)).length;
      if (!matches) {
        setStatusMessage('No matches found');
        return;
      }
      updateDocumentContent(activeDocument.content.replace(regex, findReplace.replaceText));
      setStatusMessage(`Replaced ${matches} ${matches === 1 ? 'match' : 'matches'}`);
    } catch {
      setStatusMessage('Invalid regular expression');
    }
  };

  function handleAppKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return;
    switch (event.key.toLowerCase()) {
      case 'n': event.preventDefault(); createNewDocument(); break;
      case 's': event.preventDefault(); saveDocument(); break;
      case 'o': event.preventDefault(); fileInputRef.current?.click(); break;
      case 'f': event.preventDefault(); setFindReplace((previous) => ({ ...previous, isOpen: !previous.isOpen })); break;
      case '=': case '+': event.preventDefault(); setSettings((previous) => ({ ...previous, fontSize: Math.min(previous.fontSize + 1, 24) })); break;
      case '-': event.preventDefault(); setSettings((previous) => ({ ...previous, fontSize: Math.max(previous.fontSize - 1, 8) })); break;
    }
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab' || event.shiftKey) return;
    event.preventDefault();
    const textarea = event.currentTarget;
    textarea.setRangeText(' '.repeat(settings.tabSize), textarea.selectionStart, textarea.selectionEnd, 'end');
    updateDocumentContent(textarea.value);
    setCursorPosition(textarea.selectionStart, textarea.value);
  }

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
    <div className="h-full bg-surface flex flex-col overflow-hidden" onKeyDown={handleAppKeyDown}>
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-color bg-surface-muted px-md py-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            {/* File operations */}
            <button 
              onClick={createNewDocument}
              className="btn-icon"
              title="New document (Ctrl+N)"
              aria-label="New document"
            >
              <FilePlus className="h-4 w-4" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.json,.csv,.xml,.yaml,.yml,.log,.conf,.config,.ini,.env,.toml,.sql,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.php,.rb,.go,.rs,.swift,.kt,.scala,.vue,.svelte,.sh"
              onChange={handleFileOpen}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon"
              title="Open file (Ctrl+O)"
              aria-label="Open file"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            
            <button 
              onClick={saveDocument}
              className="btn-icon"
              title="Save document (Ctrl+S)"
              aria-label="Save document to this browser"
            >
              <Save className="h-4 w-4" />
            </button>
            
            <button 
              onClick={downloadDocument}
              className="btn-icon"
              title="Download document"
              aria-label="Download document"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <div className="h-6 w-px bg-border mx-sm" />
            
            {/* Edit operations */}
            <button 
              onClick={() => setFindReplace(prev => ({ ...prev, isOpen: !prev.isOpen }))}
              className="btn-icon"
              title="Find & Replace (Ctrl+F)"
              aria-label="Find and replace"
            >
              <Search className="h-4 w-4" />
            </button>
            
            <div className="h-6 w-px bg-border mx-sm" />
            
            {/* View options */}
            <button 
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="btn-icon"
              title="Toggle sidebar"
              aria-label="Toggle document list"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setSettings(prev => ({ ...prev, showLineNumbers: !prev.showLineNumbers }))}
              className={`btn-icon ${settings.showLineNumbers ? 'bg-accent-soft text-accent' : ''}`}
              title="Toggle line numbers"
              aria-label="Toggle line numbers"
              aria-pressed={settings.showLineNumbers}
            >
              <List className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="btn-icon"
              title="Settings"
              aria-label="Editor settings"
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
              aria-label="Document name"
              className="bg-transparent border-none outline-none text-text-primary font-medium min-w-0 max-w-48"
            />
            <span className={`px-sm py-xs rounded text-xs ${activeDocument.saved ? 'text-success' : 'text-warning'}`}>
              {activeDocument.saved ? 'Saved in this browser' : 'Unsaved changes'}
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
                aria-label="Find text"
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); performFind(); } }}
                className="flex-1 px-sm py-xs border border-color rounded-md bg-surface"
              />
              <input
                type="text"
                placeholder="Replace..."
                value={findReplace.replaceText}
                onChange={(e) => setFindReplace(prev => ({ ...prev, replaceText: e.target.value }))}
                aria-label="Replace with"
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
                  >
                    <button type="button" onClick={() => setActiveDocumentId(doc.id)} aria-current={doc.id === activeDocumentId ? 'page' : undefined} className="flex min-w-0 flex-1 items-center gap-xs text-left">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">{doc.name}</span>
                      {!doc.saved && <span className="text-warning" aria-label="Unsaved">●</span>}
                    </button>
                    {documents.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Close ${doc.name}`}
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
                    aria-label="Close editor settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-lg">
                  {/* Font settings */}
                  <div>
                    <label htmlFor="editor-font-family" className="block text-sm font-medium mb-sm">Font Family</label>
                    <select
                      id="editor-font-family"
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
                    <label htmlFor="editor-font-size" className="block text-sm font-medium mb-sm">
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      id="editor-font-size"
                      type="range"
                      min="8"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editor-line-height" className="block text-sm font-medium mb-sm">
                      Line Height: {settings.lineHeight}
                    </label>
                    <input
                      id="editor-line-height"
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
              onChange={(e) => { updateDocumentContent(e.target.value); setCursorPosition(e.target.selectionStart, e.target.value); }}
              onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart, e.currentTarget.value)}
              onKeyDown={handleEditorKeyDown}
              aria-label={`${activeDocument.name} contents`}
              wrap={settings.wordWrap ? 'soft' : 'off'}
              className="flex-1 min-w-0 p-md resize-none outline-none bg-surface text-text-primary custom-scrollbar"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
                overflowWrap: settings.wordWrap ? 'anywhere' : 'normal',
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
            <span>Line {cursor.line}</span>
            <span>Column {cursor.column}</span>
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
