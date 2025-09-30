'use client';

import React, { useState, useEffect, useRef } from 'react';
import { projects } from '@/lib/projects';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp?: Date;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Fedora Linux Terminal', timestamp: new Date() },
    { type: 'output', content: 'Type "help" to see available commands.', timestamp: new Date() },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const username = 'user';
  const hostname = 'fedora';
  const currentDir = '~';

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

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    
    // Add command to history
    if (trimmedCommand && !commandHistory.includes(trimmedCommand)) {
      setCommandHistory(prev => [...prev, trimmedCommand]);
    }

    // Add input line
    addLine('input', `${username}@${hostname}:${currentDir}$ ${trimmedCommand}`);

    if (!trimmedCommand) return;

    const [cmd, ...args] = trimmedCommand.split(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        addLine('output', 'Available commands:');
        addLine('output', '  help          - Show this help message');
        addLine('output', '  clear         - Clear the terminal');
        addLine('output', '  echo <text>   - Echo text to terminal');
        addLine('output', '  whoami        - Show current user');
        addLine('output', '  date          - Show current date and time');
        addLine('output', '  neofetch      - Show system information');
        addLine('output', '  projects      - List all projects');
        addLine('output', '  cat project-readme <name> - Show project README');
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

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'neofetch':
        addLine('output', '                     ........                    ');
        addLine('output', '                 ..... .. .....                 ');
        addLine('output', '               .   .........   .               ');
        addLine('output', '              ..  .........  ..               ');
        addLine('output', '             .... .........  ....              ');
        addLine('output', '            ....................               ');
        addLine('output', '           ......................              ');
        addLine('output', '          ........................             ');
        addLine('output', '         ..........................            ');
        addLine('output', '        ............................           ');
        addLine('output', '       ..............................          ');
        addLine('output', '      ................................         ');
        addLine('output', '     ..................................        ');
        addLine('output', '    ....................................       ');
        addLine('output', '   ......................................      ');
        addLine('output', '  ........................................     ');
        addLine('output', ' ..........................................    ');
        addLine('output', '............................................   ');
        addLine('output', '');
        addLine('output', `${username}@${hostname}`);
        addLine('output', '-'.repeat(username.length + hostname.length + 1));
        addLine('output', 'OS: Fedora Linux 39 (Workstation Edition)');
        addLine('output', 'Kernel: 6.5.6-300.fc39.x86_64');
        addLine('output', 'Uptime: 2 hours, 34 mins');
        addLine('output', 'Packages: 2847 (rpm), 0 (flatpak)');
        addLine('output', 'Shell: bash 5.2.15');
        addLine('output', 'Resolution: 1920x1080');
        addLine('output', 'DE: GNOME 45.1');
        addLine('output', 'WM: Mutter');
        addLine('output', 'Theme: Adwaita [GTK2/3]');
        addLine('output', 'Terminal: Portfolio Terminal');
        addLine('output', 'CPU: Intel i7-12700H (16) @ 3.500GHz');
        addLine('output', 'GPU: Intel Alder Lake-P GT2 [Iris Xe Graphics]');
        addLine('output', 'Memory: 4532MiB / 15872MiB');
        break;

      case 'projects':
        addLine('output', 'Available projects:');
        addLine('output', '');
        projects.forEach((project, index) => {
          addLine('output', `${index + 1}. ${project.name}`);
          addLine('output', `   ${project.description}`);
          addLine('output', `   Tech: ${project.techStack.join(', ')}`);
          addLine('output', `   GitHub: ${project.githubUrl}`);
          if (project.liveUrl) {
            addLine('output', `   Live: ${project.liveUrl}`);
          }
          addLine('output', '');
        });
        break;

      case 'cat':
        if (args[0] === 'project-readme' && args[1]) {
          const projectName = args.slice(1).join(' ').toLowerCase();
          const project = projects.find(p => 
            p.name.toLowerCase().includes(projectName)
          );
          
          if (project) {
            addLine('output', `Fetching README for ${project.name}...`);
            // This would normally fetch from API
            addLine('output', `# ${project.name}`);
            addLine('output', '');
            addLine('output', project.description);
            addLine('output', '');
            addLine('output', '## Technologies Used');
            project.techStack.forEach(tech => {
              addLine('output', `- ${tech}`);
            });
            addLine('output', '');
            addLine('output', '## Links');
            addLine('output', `- [GitHub Repository](${project.githubUrl})`);
            if (project.liveUrl) {
              addLine('output', `- [Live Demo](${project.liveUrl})`);
            }
          } else {
            addLine('error', `Project "${args.slice(1).join(' ')}" not found.`);
            addLine('output', 'Use "projects" command to see available projects.');
          }
        } else {
          addLine('error', 'Usage: cat project-readme <project-name>');
        }
        break;

      default:
        addLine('error', `bash: ${cmd}: command not found`);
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
    }
  };

  const getPrompt = () => `${username}@${hostname}:${currentDir}$ `;

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono text-sm overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${
            line.type === 'error' ? 'text-red-400' : 
            line.type === 'input' ? 'text-green-400' : 
            'text-gray-300'
          }`}>
            {line.content}
          </div>
        ))}
        
        {/* Current input line */}
        <div className="flex">
          <span className="text-green-400">{getPrompt()}</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </div>
    </div>
  );
}