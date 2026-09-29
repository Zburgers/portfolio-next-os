'use client';

import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight, FileText, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { useSystemBoot } from '@/context/SystemBootContext';
import ReactiveTux from '@/components/Agents/ReactiveTux';
import TerminalOutput from '@/components/Terminal/TerminalOutput';
import { useTerminal } from '@/hooks/useTerminal';
import { profile } from '@/lib/profile';

const welcomeLines = [
  { type: 'output' as const, content: 'nakshatra@fedora:~/profile' },
  { type: 'success' as const, content: 'Profile session ready. Try `help` or run a shortcut below.' },
  { type: 'output' as const, content: '' },
];

export default function WelcomeBootstrapper() {
  const { openWindow } = useDesktop();
  const { skipWelcome, setSkipWelcome } = useSystemBoot();
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>();
  const tuxRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((item: string) => {
    if (item === 'projects' || item === 'work') {
      openWindow('portfolio', 'Selected work', { initialTab: 'work' });
      return;
    }

    const urls: Record<string, string> = {
      resume: profile.resumeUrl,
      contact: `mailto:${profile.email}`,
      github: profile.githubUrl,
      linkedin: profile.linkedinUrl,
      x: profile.xUrl,
    };
    const url = urls[item];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, [openWindow]);

  const terminal = useTerminal({
    initialDirectory: '~/profile',
    welcomeLines,
    onOpen: handleOpen,
  });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = tuxRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setMousePos({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  };

  const runShortcut = (command: string) => {
    terminal.executeCommand(command);
    terminal.setCurrentInput('');
  };

  const shortcuts = ['help', 'projects', 'cat experience.md', 'open resume'];

  return (
    <main
      className="welcome-shell"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setMousePos(undefined)}
    >
      <section className="welcome-console" aria-label="Interactive profile terminal">
        <header className="welcome-terminal-bar">
          <div className="welcome-terminal-lights" aria-hidden="true"><i /><i /><i /></div>
          <span>nakshatra@fedora <b>:</b> ~/profile</span>
          <span className="welcome-terminal-kind">PROFILE SHELL <span>·</span> 01</span>
        </header>

        <div className="welcome-console-body">
          <div className="welcome-main">
            <p className="welcome-eyebrow"><span className="welcome-prompt-mark">~/</span> SYSTEMS ENGINEERING <span>·</span> DELHI NCR</p>
            <h1>Build the parts<br />that <em>keep working.</em></h1>
            <p className="welcome-summary">{profile.summary}</p>
            <div className="welcome-current-role">
              <span className="welcome-live-dot" aria-hidden="true" />
              <div><span>NOW</span><strong>{profile.experience[0].role}</strong><small>{profile.experience[0].organization} · {profile.experience[0].period}</small></div>
            </div>

            <div className="welcome-terminal-output" aria-live="polite" aria-label="Terminal output">
              <TerminalOutput lines={terminal.lines} autoScroll />
            </div>
            <form
              className="welcome-terminal-input"
              onSubmit={(event) => {
                event.preventDefault();
                terminal.executeCommand(terminal.currentInput);
                terminal.setCurrentInput('');
              }}
            >
              <label htmlFor="profile-command"><span>nakshatra@fedora</span>:<span>{terminal.currentDirectory}</span>$</label>
              <input
                id="profile-command"
                value={terminal.currentInput}
                onChange={(event) => terminal.setCurrentInput(event.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Enter a profile terminal command"
              />
              <span className="welcome-terminal-cursor" aria-hidden="true">↵</span>
            </form>

            <div className="welcome-shortcuts" aria-label="Terminal shortcuts">
              {shortcuts.map((command) => (
                <button key={command} type="button" onClick={() => runShortcut(command)}>{command}</button>
              ))}
            </div>
          </div>

          <aside className="welcome-sidecar">
            <div className="welcome-tux-stage">
              <div className="welcome-tux-orbit" aria-hidden="true" />
              <div ref={tuxRef} className="welcome-tux" role="img" aria-label="Tux, interactive terminal companion">
                <ReactiveTux mode={terminal.status} mousePos={mousePos} size={148} />
              </div>
              <span className={`welcome-tux-status is-${terminal.status}`}><i /> {terminal.status === 'idle' ? 'READY TO EXPLORE' : terminal.status.toUpperCase()}</span>
              <Sparkles className="welcome-tux-sparkle" size={17} aria-hidden="true" />
            </div>

            <div className="welcome-sidecar-profile">
              <img className="welcome-avatar" src={profile.avatarUrl} alt="" />
              <div><strong>{profile.name}</strong><span>{profile.title}</span></div>
            </div>

            <nav className="welcome-links" aria-label="Profile links">
              <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={15} aria-hidden="true" /> GitHub <ArrowUpRight size={13} aria-hidden="true" /></a>
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={15} aria-hidden="true" /> LinkedIn <ArrowUpRight size={13} aria-hidden="true" /></a>
              <a href={`mailto:${profile.email}`}><Mail size={15} aria-hidden="true" /> Email <ArrowUpRight size={13} aria-hidden="true" /></a>
            </nav>

            <a className="welcome-resume-link" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              <FileText size={15} aria-hidden="true" /> Résumé <span>PDF</span><ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <label className="welcome-preference">
              <input type="checkbox" checked={skipWelcome} onChange={(event) => setSkipWelcome(event.target.checked)} />
              Skip this window next time
            </label>
          </aside>
        </div>
        <footer className="welcome-terminal-footer"><span>THIS PROFILE SHELL IS SIMULATED</span><span>NO HOST COMMANDS · NO SYSTEM ACCESS</span></footer>
      </section>
    </main>
  );
}
