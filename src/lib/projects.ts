export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  image?: string;
  category?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "Next.js Portfolio OS",
    description: "A Fedora-themed desktop environment built with Next.js, featuring interactive windows, terminal simulation, and portfolio showcase.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "React Context"],
    githubUrl: "https://github.com/yourusername/portfolio-os",
    liveUrl: "https://portfolio-os.vercel.app",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23dfe7ff'/%3E%3Cstop offset='100%25' stop-color='%23f6f8ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='12' fill='%23fcfdff' stroke='%23e2e8f0' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='40' rx='12' fill='%233067ff'/%3E%3Ccircle cx='45' cy='40' r='6' fill='%23ff5f56'/%3E%3Ccircle cx='65' cy='40' r='6' fill='%23ffbd2e'/%3E%3Ccircle cx='85' cy='40' r='6' fill='%2327ca3f'/%3E%3Ctext x='200' y='45' text-anchor='middle' fill='white' font-family='system-ui' font-size='14' font-weight='500'%3EPortfolio OS%3C/text%3E%3Crect x='40' y='80' width='80' height='60' rx='8' fill='%233067ff' opacity='0.1'/%3E%3Crect x='140' y='80' width='80' height='60' rx='8' fill='%2322c55e' opacity='0.1'/%3E%3Crect x='240' y='80' width='80' height='60' rx='8' fill='%23f97316' opacity='0.1'/%3E%3Crect x='340' y='80' width='20' height='60' rx='8' fill='%23ef4444' opacity='0.1'/%3E%3Ctext x='80' y='115' text-anchor='middle' fill='%233067ff' font-family='system-ui' font-size='12' font-weight='600'%3ENext.js%3C/text%3E%3Ctext x='180' y='115' text-anchor='middle' fill='%2322c55e' font-family='system-ui' font-size='12' font-weight='600'%3ETypeScript%3C/text%3E%3Ctext x='280' y='115' text-anchor='middle' fill='%23f97316' font-family='system-ui' font-size='12' font-weight='600'%3ETailwind%3C/text%3E%3C/svg%3E",
    category: "Web Development",
    featured: true
  },
  {
    name: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with user authentication, payment processing, and admin dashboard.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    githubUrl: "https://github.com/yourusername/ecommerce-platform",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f0f9ff'/%3E%3Cstop offset='100%25' stop-color='%23e0f2fe'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='40' width='360' height='220' rx='12' fill='white' stroke='%23e2e8f0' stroke-width='2'/%3E%3Crect x='20' y='40' width='360' height='50' fill='%2306b6d4' rx='12'/%3E%3Ctext x='50' y='70' fill='white' font-family='system-ui' font-size='16' font-weight='600'%3EShop%3C/text%3E%3Crect x='320' y='55' width='40' height='20' rx='4' fill='white' opacity='0.2'/%3E%3Crect x='40' y='110' width='100' height='120' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Crect x='160' y='110' width='100' height='120' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Crect x='280' y='110' width='100' height='120' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Crect x='50' y='120' width='80' height='60' rx='4' fill='%2306b6d4' opacity='0.1'/%3E%3Crect x='170' y='120' width='80' height='60' rx='4' fill='%2322c55e' opacity='0.1'/%3E%3Crect x='290' y='120' width='80' height='60' rx='4' fill='%23f97316' opacity='0.1'/%3E%3Ctext x='90' y='200' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='10'%3EProduct 1%3C/text%3E%3Ctext x='210' y='200' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='10'%3EProduct 2%3C/text%3E%3Ctext x='330' y='200' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='10'%3EProduct 3%3C/text%3E%3Ctext x='90' y='215' text-anchor='middle' fill='%2306b6d4' font-family='system-ui' font-size='12' font-weight='600'%3E$29.99%3C/text%3E%3Ctext x='210' y='215' text-anchor='middle' fill='%2322c55e' font-family='system-ui' font-size='12' font-weight='600'%3E$39.99%3C/text%3E%3Ctext x='330' y='215' text-anchor='middle' fill='%23f97316' font-family='system-ui' font-size='12' font-weight='600'%3E$49.99%3C/text%3E%3C/svg%3E",
    category: "Full Stack",
    featured: true
  },
  {
    name: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    techStack: ["Vue.js", "Firebase", "Vuex", "CSS3"],
    githubUrl: "https://github.com/yourusername/task-manager",
    liveUrl: "https://task-manager-demo.netlify.app",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23faf5ff'/%3E%3Cstop offset='100%25' stop-color='%23f3e8ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='12' fill='white' stroke='%23e2e8f0' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='50' fill='%23a855f7' rx='12'/%3E%3Ctext x='50' y='50' fill='white' font-family='system-ui' font-size='16' font-weight='600'%3ETaskBoard%3C/text%3E%3Crect x='40' y='90' width='100' height='160' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Crect x='160' y='90' width='100' height='160' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Crect x='280' y='90' width='100' height='160' rx='8' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Ctext x='90' y='110' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='12' font-weight='600'%3ETodo%3C/text%3E%3Ctext x='210' y='110' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='12' font-weight='600'%3EIn Progress%3C/text%3E%3Ctext x='330' y='110' text-anchor='middle' fill='%23334155' font-family='system-ui' font-size='12' font-weight='600'%3EDone%3C/text%3E%3Crect x='50' y='125' width='80' height='30' rx='6' fill='%23fef3c7' stroke='%23f59e0b'/%3E%3Crect x='50' y='165' width='80' height='30' rx='6' fill='%23dbeafe' stroke='%233b82f6'/%3E%3Crect x='170' y='125' width='80' height='30' rx='6' fill='%23fecaca' stroke='%23ef4444'/%3E%3Crect x='290' y='125' width='80' height='30' rx='6' fill='%23d1fae5' stroke='%2310b981'/%3E%3Crect x='290' y='165' width='80' height='30' rx='6' fill='%23e0e7ff' stroke='%236366f1'/%3E%3C/svg%3E",
    category: "Productivity",
    featured: true
  },
  {
    name: "Weather Dashboard",
    description: "A responsive weather dashboard with location-based forecasts, interactive maps, and weather alerts.",
    techStack: ["React", "OpenWeatherMap API", "Chart.js", "PWA"],
    githubUrl: "https://github.com/yourusername/weather-dashboard",
    liveUrl: "https://weather-dashboard-demo.vercel.app",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2387ceeb'/%3E%3Cstop offset='100%25' stop-color='%234a90e2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Ccircle cx='100' cy='80' r='30' fill='%23ffd700' opacity='0.8'/%3E%3Ccircle cx='320' cy='60' r='15' fill='white' opacity='0.9'/%3E%3Ccircle cx='340' cy='70' r='20' fill='white' opacity='0.8'/%3E%3Ccircle cx='355' cy='55' r='12' fill='white' opacity='0.7'/%3E%3Crect x='20' y='120' width='360' height='160' rx='12' fill='white' opacity='0.95'/%3E%3Ctext x='40' y='150' fill='%23334155' font-family='system-ui' font-size='24' font-weight='700'%3E72°F%3C/text%3E%3Ctext x='40' y='170' fill='%2364748b' font-family='system-ui' font-size='14'%3ESunny%3C/text%3E%3Ctext x='40' y='190' fill='%2364748b' font-family='system-ui' font-size='12'%3ESan Francisco, CA%3C/text%3E%3Crect x='220' y='140' width='140' height='80' rx='8' fill='%23f1f5f9'/%3E%3Ctext x='240' y='160' fill='%23334155' font-family='system-ui' font-size='12' font-weight='600'%3E7-Day Forecast%3C/text%3E%3Crect x='230' y='170' width='15' height='40' fill='%233b82f6' opacity='0.8'/%3E%3Crect x='250' y='175' width='15' height='35' fill='%236366f1' opacity='0.8'/%3E%3Crect x='270' y='180' width='15' height='30' fill='%238b5cf6' opacity='0.8'/%3E%3Crect x='290' y='178' width='15' height='32' fill='%23a855f7' opacity='0.8'/%3E%3Crect x='310' y='172' width='15' height='38' fill='%23d946ef' opacity='0.8'/%3E%3Crect x='330' y='170' width='15' height='40' fill='%23ec4899' opacity='0.8'/%3E%3C/svg%3E",
    category: "Data Visualization",
    featured: false
  }
];