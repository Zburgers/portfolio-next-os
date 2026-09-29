'use client';

import { useState, useCallback, useRef } from 'react';
import { projects } from '@/lib/projects';
import { profile } from '@/lib/profile';

// Terminal line types
export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: Date;
}

// Terminal status for the Tux agent state machine
export type TerminalStatus = 'idle' | 'processing' | 'error' | 'success' | 'panic';

// Available commands for autocomplete
export const AVAILABLE_COMMANDS = [
  'help', 'clear', 'echo', 'whoami', 'date', 'neofetch', 'projects',
  'cat', 'ls', 'pwd', 'cd', 'uname', 'uptime', 'hostname', 'history',
  'sudo', 'open'
];

const projectDirectories = projects.map((project) => project.name.toLowerCase().replace(/\s+/g, '-'));

function resolveDirectory(input: string | undefined, currentDirectory: string): string | undefined {
  if (!input || input === '~') return '~';
  const current = currentDirectory === '~' ? [] : currentDirectory.replace(/^~\/?/, '').split('/').filter(Boolean);
  const requested = input.startsWith('~/')
    ? input.slice(2).split('/')
    : input.startsWith('/')
      ? input.replace(/^\/home\/nakshatra\/?/, '').split('/')
      : [...current, ...input.split('/')];
  const parts: string[] = [];
  for (const part of requested) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  const path = parts.length ? `~/${parts.join('/')}` : '~';
  const baseDirectories = ['~', '~/profile', '~/projects', '~/profile/projects'];
  const projectPaths = projectDirectories.flatMap((name) => [`~/projects/${name}`, `~/profile/projects/${name}`]);
  return [...baseDirectories, ...projectPaths].includes(path) ? path : undefined;
}

// Terminal configuration
export interface TerminalConfig {
  username?: string;
  hostname?: string;
  initialDirectory?: string;
  welcomeLines?: TerminalLine[];
  readOnly?: boolean;
  onOpen?: (item: string) => void;
}

// Default welcome lines
const DEFAULT_WELCOME_LINES: TerminalLine[] = [
  { type: 'output', content: 'Project Next OS shell · simulated', timestamp: new Date() },
  { type: 'output', content: 'Commands run in this page and do not access your computer.', timestamp: new Date() },
  { type: 'output', content: '', timestamp: new Date() },
  { type: 'success', content: 'Type "help" to see available commands.', timestamp: new Date() },
];

export interface UseTerminalReturn {
  // State
  lines: TerminalLine[];
  currentInput: string;
  commandHistory: string[];
  historyIndex: number;
  currentDirectory: string;
  status: TerminalStatus;
  isTyping: boolean;
  
  // Configuration
  username: string;
  hostname: string;
  
  // Core actions
  executeCommand: (command: string) => void;
  simulateTyping: (command: string, onComplete?: () => void) => void;
  setCurrentInput: (input: string) => void;
  setHistoryIndex: (index: number) => void;
  
  // Terminal control
  clearTerminal: () => void;
  addLine: (type: TerminalLine['type'], content: string) => void;
  addLines: (type: TerminalLine['type'], contents: string[]) => void;
  
  // History navigation
  navigateHistory: (direction: 'up' | 'down') => void;
  
  // Tab completion
  getCompletions: (partial: string) => string[];
  
  // Prompt getter
  getPrompt: () => string;
}

export function useTerminal(config: TerminalConfig = {}): UseTerminalReturn {
  const {
    username = 'nakshatra',
    hostname = 'fedora',
    initialDirectory = '~',
    welcomeLines = DEFAULT_WELCOME_LINES,
    readOnly = false,
    onOpen,
  } = config;

  const [lines, setLines] = useState<TerminalLine[]>(welcomeLines);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState(initialDirectory);
  const [status, setStatus] = useState<TerminalStatus>('idle');
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add a single line
  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content, timestamp: new Date() }]);
  }, []);

  // Add multiple lines
  const addLines = useCallback((type: TerminalLine['type'], contents: string[]) => {
    setLines(prev => [
      ...prev,
      ...contents.map(content => ({ type, content, timestamp: new Date() }))
    ]);
  }, []);

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setLines([]);
    setStatus('idle');
  }, []);

  // Execute command - the core logic
  const executeCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    
    // Add command to history
    if (trimmedCommand && trimmedCommand !== commandHistory[commandHistory.length - 1]) {
      setCommandHistory(prev => [...prev, trimmedCommand]);
    }

    // Add input line
    addLine('input', `${username}@${hostname}:${currentDirectory}$ ${trimmedCommand}`);

    if (!trimmedCommand) {
      setStatus('idle');
      return;
    }

    setStatus('processing');

    const actualCommand = trimmedCommand;

    const [cmd, ...args] = actualCommand.split(' ');
    let commandStatus: TerminalStatus = 'success';

    // Check for panic commands (Easter eggs)
    if (trimmedCommand === 'rm -rf /' || trimmedCommand === 'sudo rm -rf /') {
      setStatus('panic');
      addLine('error', '🚨 WOAH THERE! Nice try, but this is a simulated terminal.');
      addLine('output', "Your system (and my dignity) remain intact. 🐧");
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    switch (cmd.toLowerCase()) {
      case 'help':
        addLine('output', '');
        addLine('success', '📋 Available Commands:');
        addLine('output', '');
        addLines('output', [
          '  help              Show this help message',
          '  clear             Clear the terminal screen',
          '  echo <text>       Print text to terminal',
          '  whoami            Display current user',
          '  hostname          Display system hostname',
          '  date              Show current date and time',
          '  uptime            Show system uptime',
          '  pwd               Print working directory',
          '  ls                List directory contents',
          '  cd <dir>          Change directory',
          '  uname [-a]        Show system information',
          '  neofetch          Display system info with ASCII art',
          '  history           Show command history',
          '',
          '  projects          List all portfolio projects',
          '  cat <file>        Read about.md, experience.md, links.md',
          '  cat readme <name> Show a project summary',
          '  open <item>       Open resume, projects, or contact',
          '',
          '  sudo <cmd>        Host privileges are unavailable here',
        ]);
        addLine('output', '');
        break;

      case 'clear':
        clearTerminal();
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'whoami':
        addLine('output', username);
        break;

      case 'hostname':
        addLine('output', hostname);
        break;

      case 'pwd':
        addLine('output', currentDirectory === '~' ? `/home/${username}` : currentDirectory);
        break;

      case 'cd': {
        const directory = resolveDirectory(args[0], currentDirectory);
        if (directory) setCurrentDirectory(directory);
        else {
          addLine('error', `cd: ${args[0]}: no such directory in this profile`);
          commandStatus = 'error';
        }
        break;
      }

      case 'ls':
        if (currentDirectory === '~' || currentDirectory === `/home/${username}` || currentDirectory === '~/profile') {
          addLines('output', [
            'about.md  experience.md  links.md  resume.pdf',
            'projects/'
          ]);
        } else if (currentDirectory.endsWith('/projects')) {
          addLines('output', projects.map((project) => `${project.name.replace(/\s+/g, '-').toLowerCase()}/`));
        } else if (projectDirectories.some((name) => currentDirectory.endsWith(`/projects/${name}`))) {
          addLine('output', 'README.md');
        } else {
          addLine('error', `ls: ${currentDirectory}: no such directory`);
          commandStatus = 'error';
        }
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'uptime':
        addLine('output', `Browser session started at ${new Date(performance.timeOrigin).toLocaleTimeString()}`);
        break;

      case 'uname':
        addLine('output', args.includes('-a') ? 'Project Next OS · browser simulation' : 'Project Next OS');
        break;

      case 'history':
        if (commandHistory.length === 0) {
          addLine('output', 'No commands in history');
        } else {
          commandHistory.forEach((histCmd, i) => {
            addLine('output', ` ${(i + 1).toString().padStart(4)} ${histCmd}`);
          });
        }
        break;

      case 'sudo':
        addLine('error', 'sudo: this profile shell has no host privileges');
        commandStatus = 'error';
        break;

      case 'neofetch':
        addLines('output', [
          `\x1b[36m${profile.name}\x1b[0m`,
          '-'.repeat(profile.name.length),
          `\x1b[36mRole:\x1b[0m ${profile.title}`,
          `\x1b[36mLocation:\x1b[0m ${profile.location}`,
          `\x1b[36mFocus:\x1b[0m ${profile.focus.join(', ')}`,
          `\x1b[36mShell:\x1b[0m portfolio simulation`,
          '',
        ]);
        break;

      case 'projects':
        addLine('output', '');
        addLine('success', '📂 Portfolio Projects');
        addLine('output', '━'.repeat(50));
        projects.forEach((project, index) => {
          addLine('output', '');
          addLine('output', `${index + 1}. \x1b[1m${project.name}\x1b[0m`);
          addLine('output', `   ${project.description}`);
          addLine('output', `   \x1b[36mTech:\x1b[0m ${project.techStack.slice(0, 4).join(', ')}`);
          if (project.githubUrl) addLine('output', `   \x1b[33mGitHub:\x1b[0m ${project.githubUrl}`);
        });
        addLine('output', '');
        addLine('output', '━'.repeat(50));
        addLine('output', 'Use "cat readme <project-name>" to view a project summary.');
        break;

      case 'open':
        if (!args[0]) {
          addLine('output', 'Usage: open <item>');
          addLine('output', 'Items: resume, work, contact, github, linkedin, x');
        } else {
          const item = args[0].toLowerCase();
          switch (item) {
            case 'resume':
            case 'resume.pdf':
              onOpen?.('resume');
              addLine('success', '📄 Opening resume...');
              break;
            case 'projects':
            case 'work':
              onOpen?.('projects');
              addLine('success', '📂 Opening portfolio projects...');
              break;
            case 'contact':
            case 'email':
              onOpen?.('contact');
              addLine('success', '📧 Opening email client...');
              break;
            case 'github':
              onOpen?.('github');
              addLine('success', '🐙 Opening GitHub profile...');
              break;
            case 'linkedin':
              onOpen?.('linkedin');
              addLine('success', 'Opening LinkedIn profile...');
              break;
            case 'x':
              onOpen?.('x');
              addLine('success', 'Opening X profile...');
              break;
            default:
              addLine('error', `open: ${item}: not a recognized item`);
              addLine('output', 'Try: resume, projects, contact, github, linkedin, x');
              commandStatus = 'error';
          }
        }
        break;

      case 'cat':
        if ((args[0] === 'readme' || args[0] === 'project-readme') && args[1]) {
          const projectName = args.slice(1).join(' ').toLowerCase();
          const project = projects.find(p =>
            p.name.toLowerCase().includes(projectName)
          );

          if (project) {
            addLine('output', '');
            addLine('success', `📄 README.md - ${project.name}`);
            addLine('output', '═'.repeat(50));
            addLine('output', '');
            addLine('output', `# ${project.name}`);
            addLine('output', '');
            addLine('output', project.description);
            addLine('output', '');
            addLine('output', '## 🛠 Technologies Used');
            project.techStack.forEach(tech => {
              addLine('output', `  • ${tech}`);
            });
            addLine('output', '');
            addLine('output', '## 🔗 Links');
            addLine('output', `  • GitHub: ${project.githubUrl}`);
            if (project.liveUrl) {
              addLine('output', `  • Live Demo: ${project.liveUrl}`);
            }
            addLine('output', '');
            addLine('output', '═'.repeat(50));
          } else {
            addLine('error', `cat: ${args.slice(1).join(' ')}: No such project`);
            addLine('output', 'Use "projects" to list available projects.');
            commandStatus = 'error';
          }
        } else if (['about.md', 'profile.md'].includes(args[0]?.toLowerCase() ?? '')) {
          addLine('output', '');
          addLine('success', `# ${profile.name}`);
          addLine('output', profile.title);
          addLine('output', `${profile.location} · ${profile.education.institution}`);
          addLine('output', '');
          addLine('output', profile.summary);
          addLine('output', `Focus: ${profile.focus.join(' · ')}`);
        } else if (args[0]?.toLowerCase() === 'experience.md') {
          addLine('output', '');
          profile.experience.forEach((role) => {
            addLine('success', `${role.role} · ${role.period}`);
            addLine('output', `${role.organization} — ${role.type}`);
            addLine('output', role.summary);
            addLine('output', '');
          });
        } else if (args[0]?.toLowerCase() === 'links.md') {
          addLines('output', [
            `GitHub   ${profile.githubUrl}`,
            `LinkedIn ${profile.linkedinUrl}`,
            `Email    ${profile.email}`,
            `Resume   ${profile.resumeUrl}`,
          ]);
        } else if (args[0]) {
          addLine('error', `cat: ${args[0]}: No such file or directory`);
          commandStatus = 'error';
        } else {
          addLine('output', 'Usage: cat readme <project-name>');
        }
        break;

      default:
        // Check for typos and suggest
        const similar = AVAILABLE_COMMANDS.find(c => 
          c.startsWith(cmd.slice(0, 2)) || 
          c.includes(cmd)
        );
        
        addLine('error', `bash: ${cmd}: command not found`);
        if (similar) {
          addLine('output', `Did you mean: ${similar}?`);
        }
        addLine('output', 'Type "help" to see available commands.');
        commandStatus = 'error';
        break;
    }

    // Set final status after a brief delay
    setTimeout(() => {
      setStatus(commandStatus);
      // Reset to idle after showing status
      setTimeout(() => setStatus('idle'), 1500);
    }, 100);
  }, [username, hostname, currentDirectory, commandHistory, addLine, addLines, clearTerminal, onOpen]);

  // Simulate typing effect for the Welcome widget macros
  const simulateTyping = useCallback((command: string, onComplete?: () => void) => {
    if (isTyping) return;
    
    setIsTyping(true);
    setStatus('processing');
    
    let charIndex = 0;
    const typeChar = () => {
      if (charIndex <= command.length) {
        setCurrentInput(command.slice(0, charIndex));
        charIndex++;
        typingTimeoutRef.current = setTimeout(typeChar, 50 + Math.random() * 30);
      } else {
        // Typing complete, execute command
        setTimeout(() => {
          executeCommand(command);
          setCurrentInput('');
          setIsTyping(false);
          onComplete?.();
        }, 200);
      }
    };

    typeChar();
  }, [isTyping, executeCommand]);

  // Navigate command history
  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else {
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (newIndex === -1) {
          setCurrentInput('');
        } else {
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    }
  }, [commandHistory, historyIndex]);

  // Get tab completions
  const getCompletions = useCallback((partial: string): string[] => {
    if (!partial) return [];
    return AVAILABLE_COMMANDS.filter(c => c.startsWith(partial.toLowerCase()));
  }, []);

  // Get prompt string
  const getPrompt = useCallback(() => {
    return `${username}@${hostname}:${currentDirectory}$ `;
  }, [username, hostname, currentDirectory]);

  return {
    // State
    lines,
    currentInput,
    commandHistory,
    historyIndex,
    currentDirectory,
    status,
    isTyping,
    
    // Configuration
    username,
    hostname,
    
    // Core actions
    executeCommand,
    simulateTyping,
    setCurrentInput,
    setHistoryIndex,
    
    // Terminal control
    clearTerminal,
    addLine,
    addLines,
    
    // History navigation
    navigateHistory,
    
    // Tab completion
    getCompletions,
    
    // Prompt getter
    getPrompt,
  };
}
