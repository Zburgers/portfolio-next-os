// Technology icons mapping for skills section
export const techIcons: Record<string, string> = {
  // Frontend & UI
  "Next.js": "⚡",
  "React": "⚛️",
  "TypeScript": "🔷",
  "JavaScript": "🟨",
  "Tailwind CSS": "🎨",
  "Vue.js": "💚",
  "CSS3": "🎨",
  "HTML5": "🌐",
  "React Context": "🔄",
  
  // Backend & APIs
  "Node.js": "🟢",
  "Express": "🚀",
  "FastAPI": "⚡",
  "Python": "🐍",
  "Java": "☕",
  "Spring Boot": "🍃",
  "Streamlit": "📊",
  
  // AI/ML
  "PyTorch": "🔥",
  "TensorFlow": "🧠",
  "Vertex AI": "🤖",
  "BioBERT": "🧬",
  "Hugging Face": "🤗",
  "XGBoost": "📈",
  "Pandas": "🐼",
  "Scikit-learn": "📊",
  "OpenCV": "👁️",
  "LangChain": "🔗",
  
  // Databases
  "MongoDB": "🍃",
  "PostgreSQL": "🐘",
  "Firebase": "🔥",
  "Redis": "🔴",
  "MySQL": "🐬",
  
  // DevOps & Cloud
  "Docker": "🐳",
  "Kubernetes": "☸️",
  "GCP": "☁️",
  "AWS": "☁️",
  "Vercel": "▲",
  "GitHub Actions": "🔄",
  "Linux": "🐧",
  
  // Web3 & Blockchain
  "Web3.js": "🌐",
  "Solidity": "💎",
  "Ethereum": "🔷",
  
  // Tools & Others
  "Git": "📚",
  "Figma": "🎨",
  "Postman": "📮",
  "Chart.js": "📊",
  "Stripe": "💳",
  "PWA": "📱",
  "Vuex": "🗂️",
  "OpenWeatherMap API": "🌤️",
};

// Skills data with categories and proficiency levels
export interface Skill {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'ai-ml' | 'tools' | 'database' | 'cloud';
  proficiency: number; // 1-100
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", icon: "⚛️", category: "frontend", proficiency: 92 },
  { name: "Next.js", icon: "⚡", category: "frontend", proficiency: 88 },
  { name: "TypeScript", icon: "🔷", category: "frontend", proficiency: 85 },
  { name: "Tailwind CSS", icon: "🎨", category: "frontend", proficiency: 90 },
  { name: "JavaScript", icon: "🟨", category: "frontend", proficiency: 94 },
  
  // Backend
  { name: "Python", icon: "🐍", category: "backend", proficiency: 92 },
  { name: "FastAPI", icon: "⚡", category: "backend", proficiency: 85 },
  { name: "Node.js", icon: "🟢", category: "backend", proficiency: 82 },
  { name: "Java", icon: "☕", category: "backend", proficiency: 75 },
  { name: "Spring Boot", icon: "🍃", category: "backend", proficiency: 70 },
  
  // AI/ML
  { name: "PyTorch", icon: "🔥", category: "ai-ml", proficiency: 88 },
  { name: "TensorFlow", icon: "🧠", category: "ai-ml", proficiency: 82 },
  { name: "Vertex AI", icon: "🤖", category: "ai-ml", proficiency: 80 },
  { name: "XGBoost", icon: "📈", category: "ai-ml", proficiency: 85 },
  { name: "Hugging Face", icon: "🤗", category: "ai-ml", proficiency: 78 },
  { name: "Pandas", icon: "🐼", category: "ai-ml", proficiency: 90 },
  { name: "Scikit-learn", icon: "📊", category: "ai-ml", proficiency: 88 },
  
  // Databases
  { name: "MongoDB", icon: "🍃", category: "database", proficiency: 85 },
  { name: "PostgreSQL", icon: "🐘", category: "database", proficiency: 80 },
  { name: "Firebase", icon: "🔥", category: "database", proficiency: 82 },
  { name: "Redis", icon: "🔴", category: "database", proficiency: 72 },
  
  // Tools & DevOps
  { name: "Git", icon: "📚", category: "tools", proficiency: 92 },
  { name: "Docker", icon: "🐳", category: "tools", proficiency: 80 },
  { name: "Linux", icon: "🐧", category: "tools", proficiency: 85 },
  { name: "Figma", icon: "🎨", category: "tools", proficiency: 78 },
  
  // Cloud
  { name: "GCP", icon: "☁️", category: "cloud", proficiency: 78 },
  { name: "Vercel", icon: "▲", category: "cloud", proficiency: 90 },
  { name: "AWS", icon: "☁️", category: "cloud", proficiency: 72 },
  { name: "GitHub Actions", icon: "🔄", category: "cloud", proficiency: 82 },
];

export const getSkillsByCategory = (category: Skill['category']) => 
  skills.filter(skill => skill.category === category);

// Get category display name
export const categoryDisplayNames: Record<Skill['category'], string> = {
  'frontend': 'Frontend Development',
  'backend': 'Backend Development',
  'ai-ml': 'AI & Machine Learning',
  'database': 'Databases',
  'tools': 'Tools & DevOps',
  'cloud': 'Cloud Platforms',
};

// Get category color for theming
export const categoryColors: Record<Skill['category'], string> = {
  'frontend': 'from-blue-500 to-cyan-500',
  'backend': 'from-green-500 to-emerald-500',
  'ai-ml': 'from-purple-500 to-pink-500',
  'database': 'from-amber-500 to-orange-500',
  'tools': 'from-gray-500 to-slate-500',
  'cloud': 'from-sky-500 to-indigo-500',
};