// Technology icons mapping for skills section
export const techIcons: Record<string, string> = {
  "Next.js": "⚡",
  "React": "⚛️",
  "TypeScript": "🔷",
  "JavaScript": "🟨",
  "Tailwind CSS": "🎨",
  "Vue.js": "💚",
  "Node.js": "🟢",
  "Express": "🚀",
  "MongoDB": "🍃",
  "PostgreSQL": "🐘",
  "Firebase": "🔥",
  "Stripe": "💳",
  "AWS": "☁️",
  "Docker": "🐳",
  "Git": "📚",
  "Vercel": "▲",
  "Chart.js": "📊",
  "PWA": "📱",
  "Vuex": "🗂️",
  "CSS3": "🎨",
  "OpenWeatherMap API": "🌤️",
  "React Context": "🔄",
};

// Skills data with categories and proficiency levels
export interface Skill {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'tools' | 'database' | 'cloud';
  proficiency: number; // 1-100
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", icon: "⚛️", category: "frontend", proficiency: 95 },
  { name: "Next.js", icon: "⚡", category: "frontend", proficiency: 90 },
  { name: "TypeScript", icon: "🔷", category: "frontend", proficiency: 88 },
  { name: "Vue.js", icon: "💚", category: "frontend", proficiency: 85 },
  { name: "Tailwind CSS", icon: "🎨", category: "frontend", proficiency: 92 },
  
  // Backend
  { name: "Node.js", icon: "🟢", category: "backend", proficiency: 87 },
  { name: "Express", icon: "🚀", category: "backend", proficiency: 85 },
  { name: "Python", icon: "🐍", category: "backend", proficiency: 80 },
  
  // Databases
  { name: "MongoDB", icon: "🍃", category: "database", proficiency: 82 },
  { name: "PostgreSQL", icon: "🐘", category: "database", proficiency: 78 },
  
  // Tools
  { name: "Git", icon: "📚", category: "tools", proficiency: 90 },
  { name: "Docker", icon: "🐳", category: "tools", proficiency: 75 },
  { name: "Figma", icon: "🎨", category: "tools", proficiency: 85 },
  
  // Cloud
  { name: "AWS", icon: "☁️", category: "cloud", proficiency: 70 },
  { name: "Vercel", icon: "▲", category: "cloud", proficiency: 88 },
  { name: "Firebase", icon: "🔥", category: "cloud", proficiency: 80 },
];

export const getSkillsByCategory = (category: Skill['category']) => 
  skills.filter(skill => skill.category === category);