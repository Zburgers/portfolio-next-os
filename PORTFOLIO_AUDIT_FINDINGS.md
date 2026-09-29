# Portfolio audit history

> **Current status · September 29, 2026:** The detailed findings below are a historical browser audit from December 3, 2025; they do not describe the current revision. This refresh uses the August 2026 résumé, replaces the old welcome card with a Tux-backed profile terminal, adds real public-project screenshots, improves the mobile profile, and removes fake system and Trash behavior. The production build and live browser review are recorded in the pull request. See [the before/after comparison](./docs/portfolio-refresh-comparison.png) and [README](./README.md) for current behavior and simulation boundaries.

---

# Historical findings · December 3, 2025

**Date:** December 3, 2025  
**Auditor:** Interactive Playwright Browser Testing  
**Site:** http://localhost:3000

---

## Executive Summary

This document verifies the claims made by a senior tech recruiter after conducting interactive testing of the Fedora OS Portfolio website. Each claim was systematically tested and documented.

---

## Part 1: Placeholder Content Issues (CRITICAL)

### ✅ CONFIRMED: About Me Placeholders
**Location:** Portfolio App → About Tab

| Issue | Status | Finding |
|-------|--------|---------|
| `[YOUR_NAME]` placeholder | ✅ CONFIRMED | Heading shows literal `[YOUR_NAME]` |
| `[X] years of experience` | ✅ CONFIRMED | Bio text shows `"with over [X] years of experience"` |
| Generic avatar initials | ✅ CONFIRMED | Shows "YI" (should be real initials) |

**Screenshot Evidence:**
- `heading "[YOUR_NAME]"` found in About Me section
- `paragraph: Hi! I'm [YOUR_NAME], a passionate full-stack developer with over [X] years...`

### ✅ CONFIRMED: Experience Placeholders
**Location:** Portfolio App → Experience Tab

| Issue | Status | Finding |
|-------|--------|---------|
| Fake job title | ✅ CONFIRMED | "Senior Full Stack Developer" at "Tech Company" |
| Fake company names | ✅ CONFIRMED | "Startup Inc", "Digital Agency" |
| Unrealistic dates | ✅ CONFIRMED | Shows "2022 - Present" for senior role |

### ✅ CONFIRMED: Contact Placeholders
**Location:** Portfolio App → Contact Tab

| Issue | Status | Finding |
|-------|--------|---------|
| Fake email | ✅ CONFIRMED | `your.email@example.com` |
| Fake GitHub | ✅ CONFIRMED | `github.com/yourusername` |
| Fake location | ✅ CONFIRMED | `Your City, Country` |

---

## Part 2: UI/UX Issues

### ✅ CONFIRMED: System Monitor Shows "Unknown Application"
**Location:** Desktop → Monitor App

| Issue | Status | Finding |
|-------|--------|---------|
| Window title | ⚠️ PARTIAL | Title bar correctly shows "System Monitor" |
| App content | ✅ CONFIRMED | Body shows "Unknown Application" and "App type: system-monitor" |

**Analysis:** The window title is correct, but the actual app content shows a fallback message instead of a real system monitor UI. This is because the `AppContent.tsx` component doesn't have a proper implementation for the `system-monitor` type.

### ⚠️ PARTIALLY CONFIRMED: Wi-Fi/Bluetooth Toggles
**Location:** Top Bar → Quick Settings Panel

| Issue | Status | Finding |
|-------|--------|---------|
| Wi-Fi toggle | ❌ NOT CONFIRMED | Toggle works - changes to `[active]` state when clicked |
| Bluetooth toggle | ⚠️ UNTESTED | Could not test due to overlay blocking |
| Airplane toggle | ⚠️ UNTESTED | Could not test due to overlay blocking |

**Analysis:** The Wi-Fi button does toggle and changes visual state. However, it's purely cosmetic - it doesn't actually change any application behavior (like a simulated "offline mode").

### ✅ CONFIRMED: Hardcoded Calendar Event
**Location:** Top Bar → Calendar Panel

| Issue | Status | Finding |
|-------|--------|---------|
| Hardcoded event | ✅ CONFIRMED | Shows "Aryaman's Birthday" as "Today" event |
| Hardcoded location | ✅ CONFIRMED | Weather shows "Chennai" with specific temperature |

### ⚠️ NEW FINDING: Debug Overlay Visible in Production
**Location:** Desktop (always visible)

A debug overlay is visible showing:
- `Screen: 1920×1080`
- `Available Height: 1000px`
- `Grid: 4×8`
- `Max Icons: 32`
- `Showing: 8/8`

**This should be hidden in production!**

---

## Part 3: Code Editor Issues

### ✅ CONFIRMED: Status Bar Spacing Issue
**Location:** Code Editor → File Tab Info

| Issue | Status | Finding |
|-------|--------|---------|
| Mashed text | ✅ CONFIRMED | Shows `README.mdmarkdown` without space/separator |

**Evidence:** The tab info shows filename and language type concatenated without proper spacing.

### ✅ CONFIRMED: Demo Mode Default
**Location:** Code Editor App

| Issue | Status | Finding |
|-------|--------|---------|
| Generic demo files | ✅ CONFIRMED | Shows "Demo Project" with generic `src/`, `package.json`, `README.md` |
| Not showing portfolio code | ✅ CONFIRMED | Code Editor doesn't load the actual portfolio source code |

### ✅ NEW FINDING: GitHub Integration Broken
**Location:** Portfolio → Projects → View Code

When clicking "View Code" on a project, the Code Editor opens with:
- `No files found`
- Empty file explorer

**Analysis:** The GitHub API integration is either not configured (missing `GITHUB_TOKEN`) or the repository URLs don't exist.

### ⚠️ Line Numbers Sync
**Location:** Code Editor → Any File

| Issue | Status | Finding |
|-------|--------|---------|
| Line numbers rendering | ❌ NOT CONFIRMED | Line numbers appear properly aligned with content |
| Scroll sync | ⚠️ NOT FULLY TESTED | Could not verify scroll synchronization in depth |

---

## Part 4: Terminal Issues

### ⚠️ PARTIALLY CONFIRMED: Terminal Edge Cases
**Location:** Terminal App

| Issue | Status | Finding |
|-------|--------|---------|
| `whoami` command | ✅ WORKS | Returns "user" |
| `help` command | ✅ WORKS | Shows available commands |
| `sudo` handling | ⚠️ PARTIAL | Returns "bash: sudo: command not found" |

**Analysis:** The `sudo` handling is reasonable (command not found) but could be more polished with a fun easter egg like "Nice try! 😏" or a fake password prompt.

---

## Part 5: Mobile Responsiveness

### ✅ CONFIRMED: No Mobile Experience
**Location:** Entire Site (tested at 375x667 viewport)

| Issue | Status | Finding |
|-------|--------|---------|
| Desktop OS on mobile | ✅ CONFIRMED | Full desktop environment renders on mobile |
| No mobile fallback | ✅ CONFIRMED | No "Please view on desktop" message |
| Windows overflow | ✅ CONFIRMED | Windows extend beyond viewport |
| Dock visible | ✅ CONFIRMED | Dock attempts to render on mobile |

**This is a critical UX issue!**

---

## Part 6: Positive Findings (What's Working Well)

### ✅ Files App
- Well-designed file manager with sidebar navigation
- Proper folder structure (Documents, Downloads, Pictures, Videos, Desktop)
- Recent files section
- Storage indicator (162 GB Free / 256 GB)
- Resume.pdf exists in Documents folder

### ✅ Text Editor
- Full-featured text editor with toolbar
- Proper status bar with spacing: `UTF-8 | Text | 100% zoom`
- Line numbers working correctly
- Word/character/line statistics
- File management (New, Open, Save, Download)

### ✅ Window Management
- Minimize/Maximize/Close buttons work
- Window titles display correctly
- Multiple windows can be open simultaneously
- Windows are draggable (based on DOM structure)

### ✅ Dock Functionality
- All app icons present
- Tooltip labels on hover
- Apps launch correctly from dock

### ✅ Projects Section
- Contains reasonable-looking project cards
- Technology tags displayed
- Live Demo and View Code buttons present

---

## Priority Fix List

### 🔴 Critical (Fix Tonight)
1. **Replace ALL placeholders** - `[YOUR_NAME]`, `[X] years`, emails, etc.
2. **Remove debug overlay** - Hide the screen size info in production
3. **Fix System Monitor** - Either implement it or remove the app
4. **Mobile responsiveness** - Add detection and show appropriate message

### 🟠 High Priority
5. **Fix Code Editor status bar** - Add proper spacing between filename and language
6. **Remove/update hardcoded calendar event** - "Aryaman's Birthday" should go
7. **Configure GitHub API** - Make "View Code" actually work or hide the button
8. **Update fake experience data** - Use real experience or hide the section

### 🟡 Medium Priority
9. **Enhance terminal** - Add more commands, better `sudo` handling
10. **Add welcome tour/splash screen** - Help recruiters navigate
11. **Add desktop resume shortcut** - Put RESUME.pdf icon on desktop
12. **Make Quick Settings functional** - Or make them non-interactive

---

## Recommendations for "Bafflingly Good" Portfolio

1. **Auto-open Portfolio** - When page loads, auto-open the Portfolio window centered
2. **Load actual source code** - Code Editor should show this portfolio's own code
3. **Boot animation** - Add a GRUB-style boot sequence for immersion
4. **Resume on Desktop** - Add a prominent RESUME.pdf desktop shortcut
5. **Mobile redirect** - Detect mobile and show simplified version with resume link

---

*Document generated from interactive Playwright browser testing session*
