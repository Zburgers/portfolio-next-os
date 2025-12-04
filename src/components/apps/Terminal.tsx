'use client';

import React, { useState, useEffect, useRef } from 'react';
import { projects } from '@/lib/projects';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: Date;
}

const AVAILABLE_COMMANDS = [
  'help', 'clear', 'echo', 'whoami', 'date', 'neofetch', 'projects',
  'cat', 'ls', 'pwd', 'cd', 'uname', 'uptime', 'hostname', 'history',
  'man', 'sudo', 'exit', 'reboot', 'shutdown', 'dnf'
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Fedora Linux 42 (Workstation Edition)', timestamp: new Date() },
    { type: 'output', content: 'Kernel: Linux 6.5.6-300.fc39.x86_64', timestamp: new Date() },
    { type: 'output', content: '', timestamp: new Date() },
    { type: 'success', content: 'Type "help" to see available commands.', timestamp: new Date() },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('~');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const username = 'nakshatra';
  const hostname = 'fedora';

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const addLines = (type: TerminalLine['type'], contents: string[]) => {
    setLines(prev => [
      ...prev,
      ...contents.map(content => ({ type, content, timestamp: new Date() }))
    ]);
  };

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    
    // Add command to history
    if (trimmedCommand && trimmedCommand !== commandHistory[commandHistory.length - 1]) {
      setCommandHistory(prev => [...prev, trimmedCommand]);
    }

    // Add input line
    addLine('input', `${username}@${hostname}:${currentDir}$ ${trimmedCommand}`);

    if (!trimmedCommand) return;

    // Handle sudo prefix
    let actualCommand = trimmedCommand;
    let isSudo = false;
    if (trimmedCommand.startsWith('sudo ')) {
      isSudo = true;
      actualCommand = trimmedCommand.slice(5).trim();
      if (!actualCommand) {
        addLine('error', 'usage: sudo command');
        return;
      }
    }

    const [cmd, ...args] = actualCommand.split(' ');

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
          '',
          '  dnf search <pkg>  Search for packages',
          '  sudo <cmd>        Run command as superuser',
          '  exit              Close terminal session',
        ]);
        addLine('output', '');
        break;

      case 'clear':
        setLines([]);
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
        addLine('output', currentDir === '~' ? `/home/${username}` : currentDir);
        break;

      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentDir('~');
        } else if (args[0] === '..') {
          if (currentDir !== '~' && currentDir !== '/') {
            const parts = currentDir.split('/');
            parts.pop();
            setCurrentDir(parts.join('/') || '/');
          }
        } else if (args[0] === '/') {
          setCurrentDir('/');
        } else if (args[0].startsWith('/')) {
          setCurrentDir(args[0]);
        } else {
          const newDir = currentDir === '~' 
            ? `~/${args[0]}` 
            : `${currentDir}/${args[0]}`;
          setCurrentDir(newDir);
        }
        break;

      case 'ls':
        if (currentDir === '~' || currentDir === `/home/${username}`) {
          addLines('output', [
            'Desktop    Documents  Downloads  Music',
            'Pictures   Projects   Public     Templates',
            'Videos     .config    .local     .bashrc'
          ]);
        } else if (currentDir.includes('Projects')) {
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
          commandHistory.forEach((cmd, i) => {
            addLine('output', ` ${(i + 1).toString().padStart(4)} ${cmd}`);
          });
        }
        break;

      case 'man':
        if (!args[0]) {
          addLine('error', 'What manual page do you want?');
          addLine('output', 'For example, try \'man ls\'');
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
          }
        } else if (args[0]) {
          addLine('error', `cat: ${args[0]}: No such file or directory`);
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
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (newIndex === -1) {
          setCurrentInput('');
        } else {
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion
      if (currentInput) {
        const matching = AVAILABLE_COMMANDS.filter(c => c.startsWith(currentInput.toLowerCase()));
        if (matching.length === 1) {
          setCurrentInput(matching[0]);
        } else if (matching.length > 1) {
          addLine('input', `${username}@${hostname}:${currentDir}$ ${currentInput}`);
          addLine('output', matching.join('  '));
        }
      }
    }
  };

  const getPrompt = () => `${username}@${hostname}:${currentDir}$ `;

  return (
    <div className="h-full bg-[#1a1b26] text-[#c0caf5] font-mono text-sm overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === 'error' ? 'text-[#f7768e]' : 
              line.type === 'success' ? 'text-[#9ece6a]' :
              line.type === 'input' ? 'text-[#7aa2f7]' : 
              'text-[#a9b1d6]'
            }`}
          >
            {line.content}
          </div>
        ))}
        
        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-[#7aa2f7]">{username}</span>
          <span className="text-[#c0caf5]">@</span>
          <span className="text-[#bb9af7]">{hostname}</span>
          <span className="text-[#c0caf5]">:</span>
          <span className="text-[#7dcfff]">{currentDir}</span>
          <span className="text-[#c0caf5]">$ </span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-[#c0caf5] font-mono caret-[#7aa2f7]"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
            />
          </form>
        </div>
      </div>
    </div>
  );
}