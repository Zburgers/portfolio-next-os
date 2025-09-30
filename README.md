# Fedora OS Portfolio - Next.js

A modern, interactive desktop environment built with Next.js 14, featuring a Fedora Linux-inspired design. This portfolio application simulates a complete desktop OS experience with draggable windows, a functional terminal, file explorer, and a code editor that integrates with GitHub repositories.

## 🌟 Features

### Desktop Environment
- **Authentic Fedora Desktop**: Complete GNOME-style interface with top bar, dock, and desktop icons
- **Real-time System Info**: Live clock, system status widgets, and weather display
- **Interactive Desktop Icons**: Double-click to open applications

### Window Management System
- **Draggable Windows**: Full mouse support for window positioning
- **Resizable Windows**: Resize windows using the bottom-right handle
- **Window Controls**: Minimize, maximize/restore, and close functionality
- **Multi-Window Support**: Run multiple applications simultaneously
- **Focus Management**: Click to bring windows to front
- **Window Animations**: Smooth open/close animations

### Applications

#### 🗂️ Portfolio App
- **Project Showcase**: Display your projects with descriptions, tech stacks, and links
- **Responsive Cards**: Clean, professional project presentation
- **Skills Section**: Organized by frontend, backend, and tools
- **GitHub Integration**: Direct links to code repositories

#### 💻 Terminal Simulator
- **Interactive Commands**: Full command-line interface simulation
- **Command History**: Navigate through previous commands with arrow keys
- **Built-in Commands**:
  - `help` - Show available commands
  - `clear` - Clear terminal screen
  - `echo` - Display text
  - `whoami` - Show current user
  - `date` - Display current date/time
  - `neofetch` - System information with ASCII art
  - `projects` - List all portfolio projects
  - `cat project-readme <name>` - Show project README content
- **Authentic Styling**: Green-on-black terminal theme

#### 📝 Code Editor
- **GitHub Repository Integration**: Browse and view files from any public repository
- **File Explorer**: Navigate repository structure with expandable folders
- **Syntax Highlighting**: File type detection and appropriate styling
- **Real-time Loading**: Fetch file contents on-demand from GitHub API

#### 📁 Files App
- **File Browser**: Navigate through filesystem simulation
- **Multiple Views**: List and grid view options
- **File Operations**: Basic file management interface
- **Sidebar Navigation**: Quick access to common locations

## 🛠️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

### Project Structure
```
src/
├── app/
│   ├── api/github/          # GitHub API integration routes
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application entry point
├── components/
│   ├── apps/                # Application components
│   │   ├── CodeEditor.tsx   # GitHub-integrated code viewer
│   │   ├── Files.tsx        # File manager interface
│   │   ├── Portfolio.tsx    # Portfolio showcase
│   │   └── Terminal.tsx     # Interactive terminal
│   └── system/              # Desktop system components
│       ├── AppContent.tsx   # App routing within windows
│       ├── Desktop.tsx      # Main desktop environment
│       ├── Dock.tsx         # Application launcher dock
│       ├── TopBar.tsx       # System status bar
│       └── Window.tsx       # Draggable window component
├── context/
│   └── DesktopContext.tsx   # Global state management
└── lib/
    ├── github.ts            # GitHub API utilities
    └── projects.ts          # Portfolio project data
```

### Key Components

#### DesktopContext
- Global state management for all windows
- Window lifecycle management (create, focus, close, minimize)
- Window positioning and sizing state
- TypeScript interfaces for type safety

#### Window System
- Generic window component for all applications
- Drag and drop functionality with mouse event handling
- Resize capability with boundary detection
- Window stacking with z-index management

#### GitHub Integration
- Server-side API routes for security
- Repository tree fetching and navigation
- File content retrieval with proper encoding handling
- Error handling for private/missing repositories

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd project-next-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**
   Create a `.env.local` file for GitHub API token:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```
   > This enables higher rate limits and access to private repositories

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🎨 Customization

### Adding New Projects
Edit `src/lib/projects.ts` to add your portfolio projects:

```typescript
{
  name: "Your Project Name",
  description: "Project description",
  techStack: ["React", "Node.js", "MongoDB"],
  githubUrl: "https://github.com/username/repo",
  liveUrl: "https://your-project.com" // Optional
}
```

### Styling Customization
- **Colors**: Modify Tailwind classes in components
- **Animations**: Update CSS in `src/app/globals.css`
- **Layout**: Adjust component positioning in `Desktop.tsx`

### Adding New Applications
1. Create component in `src/components/apps/`
2. Add to `AppContent.tsx` routing
3. Register in `Dock.tsx` apps array

## 📱 Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Mobile**: Responsive design (touch interactions may vary)

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Optional* |

*Required for private repositories and higher API rate limits

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Performance Optimizations

- **Code Splitting**: Next.js automatic code splitting by route
- **Image Optimization**: Next.js Image component for optimal loading
- **API Caching**: GitHub API responses cached for 1 hour
- **Static Generation**: Pre-rendered pages for faster loading
- **Bundle Analysis**: Optimized bundle size with tree shaking

## 🐛 Known Issues

- Window dragging near screen edges may need refinement
- Mobile touch interactions could be improved
- Some terminal commands are simulated (not connected to real shell)

## 🔮 Future Enhancements

- [ ] Settings application for theme customization
- [ ] Multiple desktop workspaces
- [ ] Notification system
- [ ] More terminal commands and shell scripting
- [ ] File upload/download functionality
- [ ] Real-time collaboration features
- [ ] PWA support for offline usage

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please reach out through the portfolio contact form or GitHub issues.

---

**Built with ❤️ using Next.js and modern web technologies**
