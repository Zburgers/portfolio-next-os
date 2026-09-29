export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageSource?: string;
}

export const projects: Project[] = [
  {
    name: 'SandLabX',
    description:
      'A self-hosted network-lab control plane for QEMU/KVM, with versioned lab capsules, managed images, and browser-based console access.',
    techStack: ['Next.js', 'QEMU/KVM', 'React Flow', 'PostgreSQL'],
    githubUrl: 'https://github.com/Zburgers/SandlabsX',
    category: 'Systems · Network labs',
    image: '/projects/sandlabx-topology.png',
    imageAlt: 'SandLabX canvas showing a router connected to a running Alpine node',
    imageSource: 'REPOSITORY SNAPSHOT',
  },
  {
    name: 'Agent OS',
    description:
      'A self-hosted reliability control plane for AI and automation, with durable task state, approval gates, and auditable external effects.',
    techStack: ['Node.js', 'PostgreSQL', 'Docker Compose'],
    githubUrl: 'https://github.com/Zburgers/agent-os',
    category: 'Systems · Agent operations',
  },
  {
    name: 'VibeVoice',
    description:
      'A cross-platform voice input app that transcribes locally with whisper.cpp and inserts text into the focused application.',
    techStack: ['Tauri', 'Rust', 'TypeScript', 'whisper.cpp'],
    githubUrl: 'https://github.com/Zburgers/vibevoice',
    category: 'Desktop · Local speech',
    image: '/projects/vibevoice-control.png',
    imageAlt: 'VibeVoice control screen ready for local voice input',
    imageSource: 'REPOSITORY SNAPSHOT',
  },
  {
    name: 'FlashRL',
    description:
      'A deterministic Chrome Dino reinforcement-learning benchmark with multi-seed evaluation, resumable runs, and policy replay.',
    techStack: ['Python', 'PyTorch', 'DQN', 'Gymnasium'],
    githubUrl: 'https://github.com/Zburgers/FlashRL',
    category: 'Research · Reinforcement learning',
    image: '/projects/flashrl-preview.gif',
    imageAlt: 'FlashRL learned policy playing a Chrome Dino environment',
    imageSource: 'REPOSITORY SNAPSHOT',
  },
  {
    name: 'mdview',
    description:
      'A local-first Markdown desktop app with sanitized rendering, Mermaid diagrams, and native release builds for major desktop platforms.',
    techStack: ['Tauri', 'Rust', 'TypeScript'],
    githubUrl: 'https://github.com/Zburgers/mdview',
    category: 'Desktop · Local-first',
    image: '/projects/mdview-demo.png',
    imageAlt: 'mdview split editor and rendered Markdown preview',
    imageSource: 'REPOSITORY SNAPSHOT',
  },
  {
    name: 'CB Connect',
    description:
      'A consent-first couples health app with revocable sharing permissions and timezone-aware health tracking.',
    techStack: ['Next.js', 'TypeScript', 'Convex', 'Clerk'],
    githubUrl: 'https://github.com/Zburgers/cb-connect',
    liveUrl: 'https://cb.nakshatraneuratech.dev',
    category: 'Product · Privacy',
    image: '/projects/cb-connect-live.png',
    imageAlt: 'CB Connect public landing page with a sample daily rhythm card',
    imageSource: 'PUBLIC SITE SNAPSHOT',
  },
  {
    name: 'Dayframe',
    description:
      'A privacy-focused daily journal for sleep, movement, and food, with local storage and ephemeral meal-image analysis.',
    techStack: ['Next.js', 'IndexedDB', 'Apple Shortcuts'],
    githubUrl: 'https://github.com/Zburgers/dayframe',
    category: 'Product · Personal data',
  },
  {
    name: 'Homelab',
    description:
      'A 24/7 bare-metal Linux platform for self-hosted services, isolated workloads, storage, and automated deployments.',
    techStack: ['Linux', 'Docker', 'Coolify', 'Tailscale'],
    category: 'Infrastructure · Self-hosted',
  },
];
