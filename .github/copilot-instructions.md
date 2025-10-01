# Copilot Usage Notes

## Project snapshot
- Next.js 15 App Router with all interactive UI declared as client components; the entry point `src/app/page.tsx` wraps `Desktop` in `DesktopProvider`.
- State for windows, panels, and theme lives in `src/context/DesktopContext.tsx`; `openWindow` seeds position/size, `updateWindow` drives drag/resize via `Window` component.
- Global styling mixes Tailwind CSS v4 utilities with CSS variables from `src/app/globals.css`; theme toggling writes `data-theme="dark"` on `<html>`.

## Working locally
- Install deps with `npm install`; run `npm run dev` (Turbopack) or `npm run build && npm run start` for production parity.
- GitHub API calls honour `process.env.GITHUB_TOKEN`; add it to `.env.local` to avoid rate limits while developing the Code Editor app.

## Desktop architecture
- `components/system/Desktop.tsx` renders wallpaper, desktop icons, and instantiates `Window` components per `DesktopContext.windows`.
- Apps are resolved in `components/system/AppContent.tsx`; each new `type` must be added here and typically mirrored in at least one launcher (`Desktop` icons, Dock, Activities panel).
- Window chrome, drag, resize, maximize/minimize live in `components/system/Window.tsx` and depend on `updateWindow`; respect the `Window` interface and use `payload` for contextual data (e.g., Portfolio → Code Editor).
- The Dock (`components/system/Dock.tsx`) and Activities overview (`components/system/ActivitiesPanel.tsx`) both maintain `apps` arrays; keep them in sync when adding apps.

## Key applications
- Portfolio (`components/apps/Portfolio.tsx`) reads project metadata from `src/lib/projects.ts`; duplicating the data elsewhere will desync terminal output.
- Terminal (`components/apps/Terminal.tsx`) emulates commands defined inline; extend the switch there and consider how new commands consume shared data.
- Code Editor (`components/apps/CodeEditor.tsx`) hits `/api/github/tree` and `/api/github/file`; confirm `extractRepoFromUrl` in `src/lib/github.ts` supports any new URL patterns you introduce.
- Files and Settings apps use static data; Settings toggles theme through `setTheme`, which persists to `localStorage` and updates `<html data-theme>`.

## Styling & UX conventions
- Glassmorphism tokens (`bg-glass-bg`, `border-glass-border`, etc.) come from CSS variables—prefer reusing them instead of hard-coded colors.
- Layout assumes a full-screen fixed desktop; new overlays should call `closePanels` from context to clear calendar/control center/activities when appropriate.
- Animations rely on CSS classes like `window-enter` and `panel-slide` defined in `globals.css`; reuse these for consistency.

## Quality checklist
- After stateful changes, smoke-test by opening each app to ensure window actions (drag/resize/minimize/maximize) still function.
- Run `npm run build` before commit when you touch server routes or context to catch mismatched imports or Next.js config issues.
