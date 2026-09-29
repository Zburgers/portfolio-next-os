'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '@/lib/projects';
import { profile } from '@/lib/profile';

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: Date;
}

export type TerminalStatus = 'idle' | 'processing' | 'error' | 'success' | 'panic';

export const AVAILABLE_COMMANDS = [
  'help', 'clear', 'echo', 'whoami', 'date', 'neofetch', 'projects',
  'cat', 'ls', 'pwd', 'cd', 'uname', 'uptime', 'hostname', 'history',
  'sudo', 'open',
];

const projectSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
const projectDirectories = projects.map(({ name }) => projectSlug(name));
const profileFiles = ['about.md', 'experience.md', 'links.md', 'resume.pdf'];
const maxTerminalLines = 500;
const maxHistoryEntries = 100;

function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  const matcher = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(input))) {
    tokens.push(match[1] !== undefined ? match[1].replace(/\\(["\\])/g, '$1') : match[2] ?? match[3]);
  }
  return tokens;
}

function normalizeHomePath(input: string, currentDirectory: string, username: string): string | undefined {
  if (!input || input === '~') return '~';
  let relativePath: string;
  if (input.startsWith('~/')) {
    relativePath = input.slice(2);
  } else if (input.startsWith('/')) {
    const home = `/home/${username}`;
    if (input === home || input === `${home}/`) return '~';
    if (!input.startsWith(`${home}/`)) return undefined;
    relativePath = input.slice(home.length + 1);
  } else {
    const current = currentDirectory === '~' ? '' : currentDirectory.slice(2);
    relativePath = [current, input].filter(Boolean).join('/');
  }

  const parts: string[] = [];
  for (const part of relativePath.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.length ? `~/${parts.join('/')}` : '~';
}

function isVirtualDirectory(path: string): boolean {
  return [
    '~', '~/profile', '~/projects', '~/profile/projects',
    ...projectDirectories.flatMap((slug) => [`~/projects/${slug}`, `~/profile/projects/${slug}`]),
  ].includes(path);
}

function listDirectory(path: string): string[] {
  if (path === '~' || path === '~/profile') return [...profileFiles, 'projects/'];
  if (path === '~/projects' || path === '~/profile/projects') return projectDirectories.map((slug) => `${slug}/`);
  if (projectDirectories.some((slug) => path.endsWith(`/projects/${slug}`))) return ['README.md'];
  return [];
}

function findProject(query: string) {
  const normalized = query.toLowerCase();
  return projects.find((project) => projectSlug(project.name) === normalized || project.name.toLowerCase() === normalized)
    ?? projects.find((project) => project.name.toLowerCase().includes(normalized));
}

function formatElapsed(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return `${hours}h ${minutes}m ${remaining}s`;
}

export interface TerminalConfig {
  username?: string;
  hostname?: string;
  initialDirectory?: string;
  welcomeLines?: TerminalLine[];
  readOnly?: boolean;
  onOpen?: (item: string) => void;
}

const makeWelcomeLines = (): TerminalLine[] => [
  { type: 'output', content: 'Project Next OS profile shell · simulated', timestamp: new Date() },
  { type: 'output', content: 'Commands run in this page and never access your computer.', timestamp: new Date() },
  { type: 'output', content: '', timestamp: new Date() },
  { type: 'success', content: 'Type "help" to see available commands.', timestamp: new Date() },
];

export interface UseTerminalReturn {
  lines: TerminalLine[];
  currentInput: string;
  commandHistory: string[];
  historyIndex: number;
  currentDirectory: string;
  status: TerminalStatus;
  isTyping: boolean;
  username: string;
  hostname: string;
  executeCommand: (command: string) => void;
  simulateTyping: (command: string, onComplete?: () => void) => void;
  setCurrentInput: (input: string) => void;
  setHistoryIndex: (index: number) => void;
  clearTerminal: () => void;
  addLine: (type: TerminalLine['type'], content: string) => void;
  addLines: (type: TerminalLine['type'], contents: string[]) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
  getCompletions: (input: string) => string[];
  getPrompt: () => string;
}

export function useTerminal(config: TerminalConfig = {}): UseTerminalReturn {
  const {
    username = 'nakshatra',
    hostname = 'fedora',
    initialDirectory = '~',
    welcomeLines,
    readOnly = false,
    onOpen,
  } = config;

  const [lines, setLines] = useState<TerminalLine[]>(() => welcomeLines ?? makeWelcomeLines());
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState(initialDirectory);
  const [status, setStatus] = useState<TerminalStatus>('idle');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyDraft = useRef('');

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (statusTimer.current) clearTimeout(statusTimer.current);
  }, []);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines((previous) => [...previous, { type, content, timestamp: new Date() }].slice(-maxTerminalLines));
  }, []);

  const addLines = useCallback((type: TerminalLine['type'], contents: string[]) => {
    setLines((previous) => [
      ...previous,
      ...contents.map((content) => ({ type, content, timestamp: new Date() })),
    ].slice(-maxTerminalLines));
  }, []);

  const clearTerminal = useCallback(() => {
    setLines([]);
    setStatus('idle');
  }, []);

  const executeCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    const history = [...commandHistory, trimmed].slice(-maxHistoryEntries);
    setCommandHistory(history);
    setHistoryIndex(-1);
    addLine('input', `${username}@${hostname}:${currentDirectory}$ ${trimmed}`);

    const finish = (nextStatus: TerminalStatus = 'success') => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
      setStatus('processing');
      statusTimer.current = setTimeout(() => {
        setStatus(nextStatus);
        statusTimer.current = setTimeout(() => setStatus('idle'), 1400);
      }, 80);
    };

    if (readOnly) {
      addLine('error', 'This profile shell is read-only.');
      finish('error');
      return;
    }

    if (trimmed === 'rm -rf /' || trimmed === 'sudo rm -rf /') {
      addLine('error', 'No host commands run here. This is only a simulated profile shell.');
      addLine('output', 'Your computer is untouched.');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      setStatus('panic');
      statusTimer.current = setTimeout(() => setStatus('idle'), 1800);
      return;
    }

    // This shell accepts one local profile command; shell operators are never evaluated.
    if (/[|;&<>`]/.test(trimmed) || trimmed.includes('$(')) {
      addLine('error', 'This profile shell accepts one command at a time; pipes, redirects, and command substitution are unavailable.');
      finish('error');
      return;
    }

    const [commandName = '', ...args] = tokenizeCommand(trimmed);
    const commandKey = commandName.toLowerCase();
    let commandStatus: TerminalStatus = 'success';

    switch (commandKey) {
      case 'help':
        addLines('output', [
          'Profile shell commands (simulated; no host access):',
          '  help                     Show this list',
          '  ls [path]                List profile or project files',
          '  cd [path]                Move around the virtual profile tree',
          '  pwd                      Print the virtual working directory',
          '  cat <file>               Read about.md, experience.md, or links.md',
          '  cat README.md            Read the current project summary',
          '  cat readme <project>     Read a project summary',
          '  projects                 List projects and repository links',
          '  open <item>              Open resume, projects, contact, or profile links',
          '  echo <text>              Print text',
          '  whoami, hostname, date, uptime, uname, neofetch, history, clear',
          '  sudo <command>           Unavailable: this page has no host privileges',
          '',
          'Run one command per line. Quotes group text; pipes and redirects are unavailable.',
        ]);
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
        addLine('output', currentDirectory === '~' ? `/home/${username}` : `/home/${username}/${currentDirectory.slice(2)}`);
        break;

      case 'cd': {
        const inputPath = args.join(' ');
        const path = normalizeHomePath(inputPath, currentDirectory, username);
        if (path && isVirtualDirectory(path)) setCurrentDirectory(path);
        else {
          addLine('error', `cd: ${inputPath || '(home)'}: no such directory in the profile tree`);
          commandStatus = 'error';
        }
        break;
      }

      case 'ls': {
        const requestedPath = args.find((argument) => !argument.startsWith('-'));
        const path = requestedPath ? normalizeHomePath(requestedPath, currentDirectory, username) : currentDirectory;
        const entries = path && isVirtualDirectory(path) ? listDirectory(path) : [];
        if (!entries.length) {
          addLine('error', `ls: ${requestedPath ?? currentDirectory}: no such directory in the profile tree`);
          commandStatus = 'error';
        } else addLine('output', entries.join('  '));
        break;
      }

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'uptime':
        addLine('output', `This browser page has been open for ${formatElapsed(performance.now() / 1000)}. Host uptime is not available to a web page.`);
        break;

      case 'uname':
        addLine('output', args.includes('-a') ? 'Project Next OS · browser-only profile shell · simulated' : 'Project Next OS (browser simulation)');
        break;

      case 'history':
        addLines('output', history.map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`));
        break;

      case 'sudo':
        addLine('error', 'sudo: host privileges are unavailable in a browser profile shell');
        commandStatus = 'error';
        break;

      case 'neofetch':
        addLines('output', [
          `${profile.name} · Project Next OS`,
          '────────────────────────────',
          `Role      ${profile.title}`,
          `Location  ${profile.location}`,
          `Focus     ${profile.focus.join(', ')}`,
          'Shell     simulated browser profile',
          'Host      not accessible from this page',
        ]);
        break;

      case 'projects':
        addLines('output', projects.flatMap((project) => [
          `${project.name} — ${project.description}`,
          `  Tech: ${project.techStack.slice(0, 4).join(', ')}`,
          ...(project.githubUrl ? [`  GitHub: ${project.githubUrl}`] : []),
          ...(project.liveUrl ? [`  Live: ${project.liveUrl}`] : []),
          '',
        ]));
        break;

      case 'open': {
        const aliases: Record<string, string> = {
          resume: 'resume', 'resume.pdf': 'resume', projects: 'projects', work: 'projects',
          contact: 'contact', email: 'contact', github: 'github', linkedin: 'linkedin', x: 'x',
        };
        const item = aliases[(args[0] ?? '').toLowerCase()];
        if (!item) {
          addLine('error', 'Usage: open resume | projects | contact | github | linkedin | x');
          commandStatus = 'error';
        } else {
          onOpen?.(item);
          addLine('success', `Opening ${item}…`);
        }
        break;
      }

      case 'cat': {
        const requested = args.join(' ');
        const readmeCommand = ['readme', 'project-readme'].includes((args[0] ?? '').toLowerCase());
        const projectQuery = args.slice(1).join(' ');
        let project = readmeCommand && projectQuery ? findProject(projectQuery) : undefined;
        let virtualFile: string | undefined;
        if (!readmeCommand && requested) {
          const path = normalizeHomePath(requested, currentDirectory, username);
          const relativePath = path?.slice(2).replace(/^profile\//, '');
          if (relativePath && profileFiles.includes(relativePath)) virtualFile = relativePath;
          if (relativePath === 'profile.md') virtualFile = 'about.md';
          if (relativePath?.endsWith('/README.md')) {
            project = projects.find((entry) => relativePath === `projects/${projectSlug(entry.name)}/README.md` || relativePath === `profile/projects/${projectSlug(entry.name)}/README.md`);
          }
          if (relativePath === 'resume.pdf' && !virtualFile) virtualFile = 'resume.pdf';
        }

        if (project) {
          addLines('output', [
            `# ${project.name}`,
            '',
            project.description,
            '',
            `Tech: ${project.techStack.join(', ')}`,
            ...(project.githubUrl ? [`GitHub: ${project.githubUrl}`] : []),
            ...(project.liveUrl ? [`Live: ${project.liveUrl}`] : []),
          ]);
        } else if (virtualFile === 'about.md') {
          addLines('output', [`# ${profile.name}`, profile.title, `${profile.location} · ${profile.education.institution}`, '', profile.summary, `Focus: ${profile.focus.join(' · ')}`]);
        } else if (virtualFile === 'experience.md') {
          addLines('output', profile.experience.flatMap((role) => [
            `${role.role} · ${role.period}`,
            `${role.organization} — ${role.type}`,
            role.summary,
            '',
          ]));
        } else if (virtualFile === 'links.md') {
          addLines('output', [`GitHub   ${profile.githubUrl}`, `LinkedIn ${profile.linkedinUrl}`, `Email    ${profile.email}`, `Resume   ${profile.resumeUrl}`]);
        } else if (virtualFile === 'resume.pdf') {
          addLine('output', 'resume.pdf is a PDF document. Use "open resume" to view it.');
        } else if (readmeCommand && args.length === 1) {
          addLine('output', 'Usage: cat readme <project name or slug>');
          commandStatus = 'error';
        } else if (!requested) {
          addLine('output', 'Usage: cat <profile file> | cat README.md | cat readme <project>');
        } else {
          addLine('error', `cat: ${requested}: no such file in the profile tree`);
          commandStatus = 'error';
        }
        break;
      }

      default: {
        const similar = AVAILABLE_COMMANDS.find((candidate) => candidate.startsWith(commandKey));
        addLine('error', `profile-shell: ${commandName}: command not found`);
        if (similar) addLine('output', `Did you mean: ${similar}?`);
        addLine('output', 'Type "help" to see the profile shell commands.');
        commandStatus = 'error';
      }
    }

    finish(commandStatus);
  }, [addLine, addLines, clearTerminal, commandHistory, currentDirectory, hostname, onOpen, readOnly, username]);

  const simulateTyping = useCallback((command: string, onComplete?: () => void) => {
    if (isTyping) return;
    setIsTyping(true);
    setStatus('processing');
    let index = 0;
    const typeNext = () => {
      if (index <= command.length) {
        setCurrentInput(command.slice(0, index++));
        typingTimer.current = setTimeout(typeNext, 45);
      } else {
        typingTimer.current = setTimeout(() => {
          executeCommand(command);
          setCurrentInput('');
          setIsTyping(false);
          onComplete?.();
        }, 150);
      }
    };
    typeNext();
  }, [executeCommand, isTyping]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (!commandHistory.length) return;
    if (direction === 'up' && historyIndex < commandHistory.length - 1) {
      if (historyIndex === -1) historyDraft.current = currentInput;
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentInput(commandHistory[commandHistory.length - 1 - nextIndex]);
    } else if (direction === 'down' && historyIndex >= 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setCurrentInput(nextIndex < 0 ? historyDraft.current : commandHistory[commandHistory.length - 1 - nextIndex]);
    }
  }, [commandHistory, currentInput, historyIndex]);

  const getCompletions = useCallback((input: string): string[] => {
    const trimmed = input.trimEnd();
    const tokens = tokenizeCommand(trimmed);
    if (!tokens.length) return [];
    const trailingSpace = /\s$/.test(input);
    const commandName = tokens[0].toLowerCase();
    if (tokens.length === 1 && !trailingSpace) {
      return AVAILABLE_COMMANDS.filter((candidate) => candidate.startsWith(commandName));
    }

    const args = tokens.slice(1);
    const prefix = trailingSpace ? '' : args.pop() ?? '';
    const head = trailingSpace ? input : input.slice(0, input.length - prefix.length);
    if (commandName === 'open') {
      if (args.length) return [];
      return ['resume', 'projects', 'contact', 'github', 'linkedin', 'x']
        .filter((candidate) => candidate.startsWith(prefix.toLowerCase()))
        .map((candidate) => `${head}${candidate}`);
    }
    if (commandName === 'cd') {
      if (args.length) return [];
      let directories: string[];
      if (prefix.startsWith('~') || prefix.startsWith('/')) {
        directories = [
          '~', '~/profile', '~/projects', '~/profile/projects',
          ...projectDirectories.flatMap((slug) => [`~/projects/${slug}`, `~/profile/projects/${slug}`]),
          `/home/${username}`,
        ];
      } else if (currentDirectory === '~') directories = ['..', 'profile', 'projects'];
      else if (currentDirectory === '~/profile') directories = ['..', 'projects'];
      else if (currentDirectory.endsWith('/projects')) directories = ['..', ...projectDirectories];
      else directories = ['..'];
      return directories
        .filter((candidate) => candidate.toLowerCase().startsWith(prefix.toLowerCase()))
        .filter((candidate) => {
          const path = normalizeHomePath(candidate, currentDirectory, username);
          return Boolean(path && isVirtualDirectory(path));
        })
        .map((candidate) => `${head}${candidate}`);
    }
    if (commandName === 'cat') {
      if ((args[0]?.toLowerCase() !== 'readme' && args.length) || args.length > 1) return [];
      let candidates = currentDirectory.endsWith('/projects')
        ? ['readme', ...projectDirectories]
        : currentDirectory.includes('/projects/') ? ['README.md'] : [...profileFiles, 'readme'];
      if (args[0]?.toLowerCase() === 'readme') {
        candidates = projectDirectories.map((slug) => `readme ${slug}`);
        return candidates.filter((candidate) => candidate.startsWith(`readme ${prefix.toLowerCase()}`)).map((candidate) => `cat ${candidate}`);
      }
      return candidates.filter((candidate) => candidate.toLowerCase().startsWith(prefix.toLowerCase())).map((candidate) => `${head}${candidate}`);
    }
    return [];
  }, [currentDirectory, username]);

  const getPrompt = useCallback(() => `${username}@${hostname}:${currentDirectory}$ `, [username, hostname, currentDirectory]);

  return {
    lines,
    currentInput,
    commandHistory,
    historyIndex,
    currentDirectory,
    status,
    isTyping,
    username,
    hostname,
    executeCommand,
    simulateTyping,
    setCurrentInput,
    setHistoryIndex,
    clearTerminal,
    addLine,
    addLines,
    navigateHistory,
    getCompletions,
    getPrompt,
  };
}
