export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    name: "Next.js Portfolio OS",
    description: "A Fedora-themed desktop environment built with Next.js, featuring interactive windows, terminal simulation, and portfolio showcase.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "React Context"],
    githubUrl: "https://github.com/yourusername/portfolio-os",
    liveUrl: "https://portfolio-os.vercel.app"
  },
  {
    name: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with user authentication, payment processing, and admin dashboard.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    githubUrl: "https://github.com/yourusername/ecommerce-platform"
  },
  {
    name: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    techStack: ["Vue.js", "Firebase", "Vuex", "CSS3"],
    githubUrl: "https://github.com/yourusername/task-manager",
    liveUrl: "https://task-manager-demo.netlify.app"
  },
  {
    name: "Weather Dashboard",
    description: "A responsive weather dashboard with location-based forecasts, interactive maps, and weather alerts.",
    techStack: ["React", "OpenWeatherMap API", "Chart.js", "PWA"],
    githubUrl: "https://github.com/yourusername/weather-dashboard",
    liveUrl: "https://weather-dashboard-demo.vercel.app"
  }
];