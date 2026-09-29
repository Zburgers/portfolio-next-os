# Project Next OS · portfolio direction

## Idea

An editorial portfolio inside a Fedora-inspired desktop. The welcome window is a profile shell: real résumé-backed commands, a cursor-reactive Tux, and direct links to the work. It should feel like Nakshatra's workstation, not a generic dashboard.

## Visual language

- Keep the existing desktop metaphor, Fedora wallpaper, App Router, Framer Motion, and 4-point spacing scale.
- Give the profile shell its own graphite terminal surface, quiet teal signal color, mono system labels, and restrained orbital linework around Tux.
- Let typography and real project screens carry the page. Use screenshots from public repositories and label them as repository captures.
- Keep light and dark appearance support in the portfolio app; the profile shell stays dark as part of its terminal identity.
- Keep motion short, tied to meaningful input, and disabled by the existing reduced-motion rule.

## Content and behavior

- The August 2026 résumé is the source for the name, title, location, email, education, experience, tools, and project descriptions.
- Use public GitHub and LinkedIn URLs from the résumé and current X profile link.
- The profile terminal exposes only a small portfolio filesystem. It cannot read the visitor's computer or run host commands; `sudo` and destructive commands fail safely.
- Show repository and live links only when they exist. Do not invent usage counts, customer metrics, or product screenshots.
- Mobile keeps a scroll-first version of the same profile, work, experience, and project imagery.
