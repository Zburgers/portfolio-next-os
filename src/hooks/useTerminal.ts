'use client';

import { useState, useCallback, useRef } from 'react';
import { projects } from '@/lib/projects';

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
  'man', 'sudo', 'exit', 'reboot', 'shutdown', 'dnf', 'open'
];

// Terminal configuration
export interface TerminalConfig {
  username?: string;
  hostname?: string;
  initialDirectory?: string;
  welcomeLines?: TerminalLine[];
  readOnly?: boolean;
}

// Default welcome lines
const DEFAULT_WELCOME_LINES: TerminalLine[] = [
  { type: 'output', content: 'Fedora Linux 42 (Workstation Edition)', timestamp: new Date() },
  { type: 'output', content: 'Kernel: Linux 6.5.6-300.fc39.x86_64', timestamp: new Date() },
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

    // Handle sudo prefix
    let actualCommand = trimmedCommand;
    let isSudo = false;
    if (trimmedCommand.startsWith('sudo ')) {
      isSudo = true;
      actualCommand = trimmedCommand.slice(5).trim();
      if (!actualCommand) {
        addLine('error', 'usage: sudo command');
        setStatus('error');
        return;
      }
    }

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
          '  man <cmd>         Show manual for command',
          '',
          '  projects          List all portfolio projects',
          '  cat readme <name> Show project README',
          '  open <item>       Open resume, projects, or contact',
          '',
          '  dnf search <pkg>  Search for packages',
          '  sudo <cmd>        Run command as superuser',
          '  exit              Close terminal session',
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

      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentDirectory('~');
        } else if (args[0] === '..') {
          if (currentDirectory !== '~' && currentDirectory !== '/') {
            const parts = currentDirectory.split('/');
            parts.pop();
            setCurrentDirectory(parts.join('/') || '/');
          }
        } else if (args[0] === '/') {
          setCurrentDirectory('/');
        } else if (args[0].startsWith('/')) {
          setCurrentDirectory(args[0]);
        } else if (args[0] === 'Trash' || args[0] === './Trash') {
          const newDir = currentDirectory === '~'
            ? `~/Trash`
            : `${currentDirectory}/Trash`;
          setCurrentDirectory(newDir);
        } else {
          const newDir = currentDirectory === '~'
            ? `~/${args[0]}`
            : `${currentDirectory}/${args[0]}`;
          setCurrentDirectory(newDir);
        }
        break;

      case 'ls':
        if (currentDirectory === '~' || currentDirectory === `/home/${username}`) {
          addLines('output', [
            'Desktop    Documents  Downloads  Music',
            'Pictures   Projects   Public     Templates',
            'Videos     .config    .local     .bashrc',
            'Trash'
          ]);
        } else if (currentDirectory === '/home/nakshatra/Trash' || currentDirectory === '~/Trash') {
          addLine('output', 'Windows11.iso');
        } else if (currentDirectory.includes('Projects')) {
          projects.forEach(p => {
            addLine('output', `📁 ${p.name.replace(/\s+/g, '-').toLowerCase()}/`);
          });
        } else {
          addLine('output', '.');
          addLine('output', '..');
        }
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'uptime':
        const hours = Math.floor(Math.random() * 24) + 1;
        const mins = Math.floor(Math.random() * 60);
        addLine('output', ` ${new Date().toLocaleTimeString()}  up ${hours}:${mins.toString().padStart(2, '0')},  1 user,  load average: 0.42, 0.38, 0.35`);
        break;

      case 'uname':
        if (args.includes('-a')) {
          addLine('output', 'Linux fedora 6.12.0-300.fc42.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux');
        } else if (args.includes('-r')) {
          addLine('output', '6.5.6-300.fc39.x86_64');
        } else if (args.includes('-s')) {
          addLine('output', 'Linux');
        } else {
          addLine('output', 'Linux');
        }
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

      case 'man':
        if (!args[0]) {
          addLine('error', 'What manual page do you want?');
          addLine('output', 'For example, try \'man ls\'');
          commandStatus = 'error';
        } else {
          addLine('output', '');
          addLine('success', `${args[0].toUpperCase()}(1)           User Commands           ${args[0].toUpperCase()}(1)`);
          addLine('output', '');
          addLine('output', 'NAME');
          addLine('output', `       ${args[0]} - ${args[0] === 'ls' ? 'list directory contents' : args[0] === 'cd' ? 'change directory' : 'portfolio command'}`);
          addLine('output', '');
          addLine('output', 'DESCRIPTION');
          addLine('output', `       This is a simulated man page for the ${args[0]} command.`);
          addLine('output', '       For the full experience, visit the desktop on a larger screen.');
          addLine('output', '');
        }
        break;

      case 'dnf':
        if (isSudo && args[0] === 'install') {
          addLine('output', `Last metadata expiration check: 0:42:15 ago.`);
          addLine('output', `Package ${args[1] || 'package'} is already installed.`);
          addLine('output', 'Dependencies resolved.');
          addLine('output', 'Nothing to do.');
          addLine('success', 'Complete!');
        } else if (args[0] === 'search' && args[1]) {
          addLine('output', `Last metadata expiration check: 0:42:15 ago.`);
          addLine('output', `======================== Name Matched: ${args[1]} =========================`);
          addLine('output', `${args[1]}.x86_64 : The ${args[1]} package for Fedora`);
          addLine('output', `${args[1]}-devel.x86_64 : Development files for ${args[1]}`);
        } else if (args[0] === 'update' || args[0] === 'upgrade') {
          if (!isSudo) {
            addLine('error', 'This command has to be run with superuser privileges (under the root user on most systems).');
            commandStatus = 'error';
          } else {
            addLine('output', 'Last metadata expiration check: 0:42:15 ago.');
            addLine('output', 'Dependencies resolved.');
            addLine('output', 'Nothing to do.');
            addLine('success', 'Complete!');
          }
        } else {
          addLine('output', 'usage: dnf [options] COMMAND');
          addLine('output', '');
          addLine('output', 'Commands: search, install, update, upgrade, info');
        }
        break;

      case 'neofetch':
        addLines('output', [
          '             .',
          '           .',
          '          .',
          '         .',
          '        .',
          '       .',
          '      .',
          '     .',
          '       .',
          '         .',
          '           .',
          '             .',
          '           .',
          '         .',
          '       .',
          '      .',
          '     .',
          '      .',
          '        .',
          '          .',
          '            .',
          '',
          `\x1b[36m${username}@${hostname}\x1b[0m`,
          '-'.repeat(username.length + hostname.length + 1),
          `\x1b[36mOS:\x1b[0m Fedora Linux 39 (Workstation Edition) x86_64`,
          `\x1b[36mHost:\x1b[0m ASUS ROG Strix`,
          `\x1b[36mKernel:\x1b[0m 6.5.6-300.fc39.x86_64`,
          `\x1b[36mUptime:\x1b[0m 2 hours, 34 mins`,
          `\x1b[36mPackages:\x1b[0m 2847 (rpm), 42 (flatpak)`,
          `\x1b[36mShell:\x1b[0m zsh 5.9`,
          `\x1b[36mResolution:\x1b[0m 1920x1080, 2560x1440`,
          `\x1b[36mDE:\x1b[0m GNOME 45.1`,
          `\x1b[36mWM:\x1b[0m Mutter`,
          `\x1b[36mTheme:\x1b[0m Adwaita-dark [GTK3]`,
          `\x1b[36mIcons:\x1b[0m Adwaita [GTK3]`,
          `\x1b[36mTerminal:\x1b[0m Portfolio Terminal`,
          `\x1b[36mCPU:\x1b[0m Intel i7-12700H (20) @ 4.70GHz`,
          `\x1b[36mGPU:\x1b[0m Intel Alder Lake-P GT2 [Iris Xe]`,
          `\x1b[36mGPU:\x1b[0m NVIDIA GeForce RTX 3060 Mobile`,
          `\x1b[36mMemory:\x1b[0m 7482MiB / 32768MiB`,
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
          addLine('output', `   \x1b[33mGitHub:\x1b[0m ${project.githubUrl}`);
        });
        addLine('output', '');
        addLine('output', '━'.repeat(50));
        addLine('output', 'Use "cat readme <project-name>" to view project details.');
        break;

      case 'open':
        if (!args[0]) {
          addLine('output', 'Usage: open <item>');
          addLine('output', 'Items: resume, projects, contact, github');
        } else {
          const item = args[0].toLowerCase();
          switch (item) {
            case 'resume':
            case 'resume.pdf':
              addLine('success', '📄 Opening resume...');
              // This will be handled by the component using the hook
              break;
            case 'projects':
              addLine('success', '📂 Opening portfolio projects...');
              break;
            case 'contact':
            case 'email':
              addLine('success', '📧 Opening email client...');
              break;
            case 'github':
              addLine('success', '🐙 Opening GitHub profile...');
              break;
            default:
              addLine('error', `open: ${item}: not a recognized item`);
              addLine('output', 'Try: resume, projects, contact, github');
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
        } else if (args[0] && currentDirectory.includes('Trash') && args[0] === 'Windows11.iso') {
          // Special handling for Windows ISO in Trash
          addLine('output', '');
          addLine('success', '💾 Windows11.iso (Disk Image)');
          addLine('output', '═'.repeat(50));
          addLine('output', '');
          addLine('output', 'Windows 11 Installation Disk Image');
          addLine('output', 'Size: 5.4 GB');
          addLine('output', 'Status: Trashed');
          addLine('output', 'Location: /home/nakshatra/Trash');
          addLine('output', '');
          addLine('output', 'Note: This is a Windows installation file that was moved to trash.');
          addLine('output', 'To restore, navigate to the Files app and use the trash functionality.');
          addLine('output', '');
          addLine('output', '═'.repeat(50));
        } else if (args[0]) {
          addLine('error', `cat: ${args[0]}: No such file or directory`);
          commandStatus = 'error';
        } else {
          addLine('output', 'Usage: cat readme <project-name>');
        }
        break;

      case 'exit':
        addLine('output', 'logout');
        addLine('output', '');
        addLine('success', 'Session closed. Thank you for visiting!');
        break;

      case 'reboot':
      case 'shutdown':
        if (!isSudo) {
          addLine('error', `${cmd}: Permission denied. Try using 'sudo ${cmd}'`);
          commandStatus = 'error';
        } else {
          addLine('output', `System ${cmd === 'reboot' ? 'reboot' : 'shutdown'} initiated...`);
          addLine('success', '(This is a simulated terminal - system remains operational)');
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
  }, [username, hostname, currentDirectory, commandHistory, addLine, addLines, clearTerminal]);

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
