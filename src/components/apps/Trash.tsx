'use client';

import { Trash2 } from 'lucide-react';

export default function Trash() {
  return (
    <main className="flex h-full flex-col bg-[color:var(--surface)] text-[color:var(--text-primary)]">
      <header className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
        <Trash2 className="h-5 w-5 text-[color:var(--text-muted)]" aria-hidden="true" />
        <h1 className="text-base font-semibold">Trash</h1>
        <span className="ml-auto font-mono text-xs text-[color:var(--text-muted)]">0 ITEMS</span>
      </header>
      <section className="grid flex-1 place-content-center justify-items-center gap-2 px-6 text-center">
        <Trash2 className="mb-2 h-8 w-8 text-[color:var(--text-muted)]" aria-hidden="true" />
        <h2 className="text-sm font-medium">Nothing here</h2>
        <p className="max-w-xs text-sm text-[color:var(--text-muted)]">This portfolio desktop does not simulate files being deleted.</p>
      </section>
    </main>
  );
}
