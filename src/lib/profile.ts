export const profile = {
  name: 'Nakshatra Kundlas',
  initials: 'NK',
  title: 'Full-Stack, Systems & AI Engineer',
  location: 'Delhi NCR, India',
  summary:
    'I ship backend systems, local-first software, and applied AI tools — then test what happens when production gets weird.',
  focus: ['Backend & reliability', 'Local-first systems', 'Reproducible AI'],
  capabilities: [
    { area: 'Backend', tools: 'FastAPI · Node.js · PostgreSQL · Redis · Celery · Convex' },
    { area: 'Frontend', tools: 'React · Next.js · TypeScript · Tailwind CSS · React Flow' },
    { area: 'AI and data', tools: 'PyTorch · TensorFlow · Hugging Face · scikit-learn · Vertex AI' },
    { area: 'Systems', tools: 'Linux · Docker · Tauri · QEMU/KVM · GitHub Actions · Tailscale' },
    { area: 'Quality', tools: 'pytest · Playwright · Security testing · Observability · Release verification' },
  ],
  avatarUrl: 'https://avatars.githubusercontent.com/u/95270855?v=4',
  email: 'ekagra7865@gmail.com',
  githubUrl: 'https://github.com/Zburgers',
  linkedinUrl: 'https://www.linkedin.com/in/nakshatrakundlas/',
  xUrl: 'https://x.com/_nx8i_',
  resumeUrl: '/resume.pdf',
  education: {
    degree: 'Bachelor of Technology in Artificial Intelligence and Data Science',
    institution: 'Shiv Nadar University, Chennai',
    years: '2022–2026',
  },
  experience: [
    {
      role: 'Backend and Systems Engineer',
      organization: 'Analytics Depot',
      type: 'Freelance · Remote, New York',
      period: 'Apr 2026 — Present',
      summary:
        'Production backend, reliability, and AI analytics work across ingestion, connectors, scheduled jobs, observability, and release verification.',
    },
    {
      role: 'Software Engineering Intern',
      organization: 'Seven Oceans Holdings',
      type: 'Remote, Singapore',
      period: 'Jan 2026 — May 2026',
      summary:
        'Built a support and CRM platform with React, FastAPI, and PostgreSQL, including AI-assisted routing and resilient background workflows.',
    },
    {
      role: 'Open Source Contributor and Maintainer',
      organization: 'GitHub',
      type: 'Public projects and upstream work',
      period: '2025 — Present',
      summary:
        'Landed five merged upstream pull requests across Tracer Cloud/OpenSRE and Pulse, alongside public projects and production engineering.',
    },
  ],
} as const;
