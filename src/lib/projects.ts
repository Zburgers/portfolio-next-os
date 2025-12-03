export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  status?: string; // e.g., "Hackathon Winner", "Featured", "Research"
}

export const projects: Project[] = [
  {
    name: "Health Track AI",
    description: "Cloud-native clinical workflow app automating ICD-10 coding and SOAP notes using Vertex AI and Next.js. Reduced documentation time by 85% for healthcare professionals.",
    techStack: ["Next.js", "Vertex AI", "Firebase", "BioBERT", "MongoDB"],
    // TODO: Update with actual repo URL once created
    githubUrl: "https://github.com/Zburgers/health-track-ai",
    liveUrl: undefined, // TODO: Add live demo URL if deployed
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23e0f7fa'/%3E%3Cstop offset='100%25' stop-color='%23b2ebf2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='16' fill='white' stroke='%2300bcd4' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='50' rx='16' fill='%2300bcd4'/%3E%3Ctext x='50' y='52' fill='white' font-family='system-ui' font-size='18' font-weight='600'%3E🏥 Health Track AI%3C/text%3E%3Crect x='40' y='90' width='320' height='40' rx='8' fill='%23e8f5e9' stroke='%234caf50'/%3E%3Ctext x='60' y='115' fill='%232e7d32' font-family='system-ui' font-size='12'%3E✓ ICD-10 Code: J06.9 - Acute URI%3C/text%3E%3Crect x='40' y='145' width='320' height='60' rx='8' fill='%23fff3e0' stroke='%23ff9800'/%3E%3Ctext x='60' y='170' fill='%23e65100' font-family='system-ui' font-size='11'%3ESOAP Notes Generated%3C/text%3E%3Ctext x='60' y='190' fill='%23795548' font-family='system-ui' font-size='10'%3ESubjective: Patient reports fever...%3C/text%3E%3Crect x='40' y='220' width='150' height='40' rx='8' fill='%2300bcd4'/%3E%3Ctext x='75' y='245' fill='white' font-family='system-ui' font-size='12' font-weight='500'%3E🤖 AI Analysis%3C/text%3E%3Crect x='210' y='220' width='150' height='40' rx='8' fill='%23e1f5fe' stroke='%2303a9f4'/%3E%3Ctext x='245' y='245' fill='%230277bd' font-family='system-ui' font-size='12'%3E📊 85%25 Faster%3C/text%3E%3C/svg%3E",
    category: "AI Healthcare",
    featured: true,
    status: "Featured"
  },
  {
    name: "Waste Wise",
    description: "🏆 Hackathon Winner. AI-powered waste sorting platform featuring image classification for disposal advice and Web3/NFT gamification for user engagement.",
    techStack: ["React", "Node.js", "Web3.js", "Solidity", "Tailwind CSS"],
    // TODO: Update with actual repo URL
    githubUrl: "https://github.com/Zburgers/waste-wise",
    liveUrl: undefined, // TODO: Add live demo if deployed
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23c8e6c9'/%3E%3Cstop offset='100%25' stop-color='%23a5d6a7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='16' fill='white' stroke='%234caf50' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='50' rx='16' fill='%234caf50'/%3E%3Ctext x='50' y='52' fill='white' font-family='system-ui' font-size='18' font-weight='600'%3E♻️ Waste Wise%3C/text%3E%3Crect x='300' y='30' width='70' height='30' rx='15' fill='%23ffd700'/%3E%3Ctext x='318' y='50' fill='%23000' font-family='system-ui' font-size='10' font-weight='bold'%3E🏆 WINNER%3C/text%3E%3Ccircle cx='120' cy='150' r='50' fill='%23e8f5e9' stroke='%234caf50' stroke-width='2'/%3E%3Ctext x='120' y='145' text-anchor='middle' font-size='30'%3E📸%3C/text%3E%3Ctext x='120' y='170' text-anchor='middle' fill='%232e7d32' font-family='system-ui' font-size='10'%3EScan Waste%3C/text%3E%3Cpath d='M180 150 L220 150' stroke='%234caf50' stroke-width='3' marker-end='url(%23arrow)'/%3E%3Ccircle cx='280' cy='150' r='50' fill='%23fff3e0' stroke='%23ff9800' stroke-width='2'/%3E%3Ctext x='280' y='145' text-anchor='middle' font-size='30'%3E🎮%3C/text%3E%3Ctext x='280' y='170' text-anchor='middle' fill='%23e65100' font-family='system-ui' font-size='10'%3ENFT Rewards%3C/text%3E%3Crect x='40' y='220' width='320' height='40' rx='8' fill='%23e3f2fd'/%3E%3Ctext x='200' y='245' text-anchor='middle' fill='%231565c0' font-family='system-ui' font-size='12'%3E🌍 Powered by Web3 + AI Classification%3C/text%3E%3C/svg%3E",
    category: "AI + Web3",
    featured: true,
    status: "🏆 Hackathon Winner"
  },
  {
    name: "Sentient AI",
    description: "Advanced DDoS detection system fusing CNN-LSTM models with XGBoost. Features a real-time monitoring stack using FastAPI and Streamlit for cybersecurity applications.",
    techStack: ["Python", "FastAPI", "PyTorch", "XGBoost", "Docker", "Streamlit"],
    // TODO: Update with actual repo URL
    githubUrl: "https://github.com/Zburgers/sentient-ai",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%231a1a2e'/%3E%3Cstop offset='100%25' stop-color='%2316213e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='16' fill='%230f0f23' stroke='%2300ff88' stroke-width='2'/%3E%3Ctext x='50' y='52' fill='%2300ff88' font-family='monospace' font-size='18' font-weight='600'%3E🛡️ Sentient AI%3C/text%3E%3Crect x='40' y='70' width='320' height='30' rx='4' fill='%231a1a2e'/%3E%3Ctext x='50' y='90' fill='%2300ff88' font-family='monospace' font-size='11'%3E$ monitoring --mode=realtime%3C/text%3E%3Crect x='40' y='110' width='150' height='80' rx='8' fill='%231a1a2e' stroke='%23ff4757' stroke-width='1'/%3E%3Ctext x='115' y='135' text-anchor='middle' fill='%23ff4757' font-family='monospace' font-size='20'%3E⚠️%3C/text%3E%3Ctext x='115' y='155' text-anchor='middle' fill='%23ff4757' font-family='monospace' font-size='10'%3EDDoS Detected%3C/text%3E%3Ctext x='115' y='175' text-anchor='middle' fill='%23888' font-family='monospace' font-size='9'%3E1.2M req/s%3C/text%3E%3Crect x='210' y='110' width='150' height='80' rx='8' fill='%231a1a2e' stroke='%2300ff88' stroke-width='1'/%3E%3Ctext x='285' y='135' text-anchor='middle' fill='%2300ff88' font-family='monospace' font-size='20'%3E✓%3C/text%3E%3Ctext x='285' y='155' text-anchor='middle' fill='%2300ff88' font-family='monospace' font-size='10'%3EMitigated%3C/text%3E%3Ctext x='285' y='175' text-anchor='middle' fill='%23888' font-family='monospace' font-size='9'%3ECNN-LSTM+XGB%3C/text%3E%3Crect x='40' y='205' width='320' height='55' rx='8' fill='%231a1a2e'/%3E%3Ctext x='50' y='225' fill='%23666' font-family='monospace' font-size='9'%3EModel Accuracy%3C/text%3E%3Crect x='50' y='235' width='250' height='10' rx='5' fill='%23333'/%3E%3Crect x='50' y='235' width='237' height='10' rx='5' fill='%2300ff88'/%3E%3Ctext x='310' y='243' fill='%2300ff88' font-family='monospace' font-size='10'%3E94.8%25%3C/text%3E%3C/svg%3E",
    category: "Cybersecurity AI",
    featured: true,
    status: "Research"
  },
  {
    name: "Fedora OS Portfolio",
    description: "The site you're looking at! A browser-based operating system simulation built with React and Tailwind to showcase interactive UI design and desktop experience.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "React Context"],
    githubUrl: "https://github.com/Zburgers/portfolio-next-os",
    liveUrl: "https://portfolio-os.vercel.app", // TODO: Update with actual deployment URL
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23dfe7ff'/%3E%3Cstop offset='100%25' stop-color='%23f6f8ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg)'/%3E%3Crect x='20' y='20' width='360' height='260' rx='12' fill='%23fcfdff' stroke='%23e2e8f0' stroke-width='2'/%3E%3Crect x='20' y='20' width='360' height='40' rx='12' fill='%233067ff'/%3E%3Ccircle cx='45' cy='40' r='6' fill='%23ff5f56'/%3E%3Ccircle cx='65' cy='40' r='6' fill='%23ffbd2e'/%3E%3Ccircle cx='85' cy='40' r='6' fill='%2327ca3f'/%3E%3Ctext x='200' y='45' text-anchor='middle' fill='white' font-family='system-ui' font-size='14' font-weight='500'%3EFedora OS Portfolio%3C/text%3E%3Crect x='40' y='80' width='80' height='60' rx='8' fill='%233067ff' opacity='0.1'/%3E%3Crect x='140' y='80' width='80' height='60' rx='8' fill='%2322c55e' opacity='0.1'/%3E%3Crect x='240' y='80' width='80' height='60' rx='8' fill='%23f97316' opacity='0.1'/%3E%3Ctext x='80' y='105' text-anchor='middle' font-size='24'%3E📁%3C/text%3E%3Ctext x='180' y='105' text-anchor='middle' font-size='24'%3E💼%3C/text%3E%3Ctext x='280' y='105' text-anchor='middle' font-size='24'%3E⚙️%3C/text%3E%3Ctext x='80' y='130' text-anchor='middle' fill='%233067ff' font-family='system-ui' font-size='10'%3EFiles%3C/text%3E%3Ctext x='180' y='130' text-anchor='middle' fill='%2322c55e' font-family='system-ui' font-size='10'%3EPortfolio%3C/text%3E%3Ctext x='280' y='130' text-anchor='middle' fill='%23f97316' font-family='system-ui' font-size='10'%3ESettings%3C/text%3E%3Crect x='40' y='160' width='320' height='100' rx='8' fill='white' stroke='%233067ff' stroke-width='2'/%3E%3Ctext x='60' y='185' fill='%23333' font-family='system-ui' font-size='12' font-weight='600'%3ENakshatra Kundlas%3C/text%3E%3Ctext x='60' y='205' fill='%233067ff' font-family='system-ui' font-size='10'%3EAI Engineer %26 Full Stack Developer%3C/text%3E%3Crect x='60' y='220' width='60' height='24' rx='4' fill='%233067ff'/%3E%3Ctext x='90' y='236' text-anchor='middle' fill='white' font-family='system-ui' font-size='10'%3EProjects%3C/text%3E%3Crect x='130' y='220' width='50' height='24' rx='4' fill='%23e8f0ff' stroke='%233067ff'/%3E%3Ctext x='155' y='236' text-anchor='middle' fill='%233067ff' font-family='system-ui' font-size='10'%3ESkills%3C/text%3E%3C/svg%3E",
    category: "Web Development",
    featured: false,
    status: "Meta ✨"
  }
];