'use client';

import { FolderOpen, Trash2 } from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';

export default function Trash() {
  const { openWindow } = useDesktop();

  return (
    <main className="flex h-full flex-col bg-[color:var(--surface)] text-[color:var(--text-primary)]">
      <header className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
        <Trash2 className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
        <h1 className="text-base font-semibold">Trash</h1>
        <span className="ml-auto font-mono text-xs text-[color:var(--text-muted)]">0 ITEMS</span>
      </header>
      <section className="grid flex-1 place-content-center justify-items-center gap-2 px-6 text-center" aria-labelledby="trash-empty-title">
        <Trash2 className="mb-2 h-8 w-8 text-[color:var(--text-muted)]" aria-hidden="true" />
        <h2 id="trash-empty-title" className="text-sm font-medium">Trash is empty</h2>
        <button type="button" onClick={() => openWindow('files', 'Files')} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-primary)]">
          <FolderOpen className="h-4 w-4" aria-hidden="true" /> Browse files
        </button>
      </section>
    </main>
  );
}
