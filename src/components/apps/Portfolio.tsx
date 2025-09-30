'use client';

import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { projects, Project } from '@/lib/projects';
import { useDesktop } from '@/context/DesktopContext';

export default function Portfolio() {
  const { openWindow } = useDesktop();

  const handleViewCode = (project: Project) => {
    openWindow('code-editor', `${project.name} - Code`, { 
      githubUrl: project.githubUrl,
      projectName: project.name
    });
  };

  return (
    <div className="h-full bg-white text-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="px-12 py-16 border-b border-gray-100 bg-white">
        <div className="flex items-start space-x-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-5xl font-bold shadow-xl text-white">
            YI
          </div>
          <div className="flex-1 pt-4">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">[YOUR_NAME]</h1>
            <p className="text-2xl text-gray-600 mb-6">Full Stack Developer</p>
            <div className="max-w-2xl">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Hi! I'm [YOUR_NAME], a passionate full-stack developer with over [X] years of 
                experience building web applications and digital solutions.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I specialize in modern JavaScript frameworks like React and Vue.js, and have extensive 
                experience with backend technologies including Node.js and Python. I love creating 
                efficient, scalable, and user-friendly applications.
              </p>
            </div>
            <div className="mt-8">
              <p className="text-gray-600 mb-2">
                When I'm not coding, you can find me exploring new technologies, contributing to open-source 
                projects, or sharing knowledge with the developer community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="px-12">
          <div className="flex space-x-8">
            <button className="px-1 py-4 text-blue-600 border-b-2 border-blue-600 font-medium">
              👋 About Me
            </button>
            <button className="px-1 py-4 text-gray-500 hover:text-gray-700 font-medium">
              🚀 Skills  
            </button>
            <button className="px-1 py-4 text-gray-500 hover:text-gray-700 font-medium">
              📂 Projects
            </button>
            <button className="px-1 py-4 text-gray-500 hover:text-gray-700 font-medium">
              ✍️ Experience
            </button>
            <button className="px-1 py-4 text-gray-500 hover:text-gray-700 font-medium">
              💼 Contact
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-4"></span>
          Featured Projects
        </h2>
        
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {project.techStack.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleViewCode(project)}
                  className="flex items-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 text-base font-medium hover:scale-105 hover:shadow-lg"
                >
                  <Github className="w-5 h-5" />
                  <span>View Code</span>
                </button>
                
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-200 text-base font-medium hover:scale-105 hover:shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-4"></span>
            Skills & Technologies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <h3 className="font-semibold mb-4 text-blue-600 text-lg">Frontend</h3>
              <div className="space-y-3 text-base text-gray-700">
                <div className="hover:text-blue-600 transition-colors cursor-default">React / Next.js</div>
                <div className="hover:text-blue-600 transition-colors cursor-default">TypeScript</div>
                <div className="hover:text-blue-600 transition-colors cursor-default">Tailwind CSS</div>
                <div className="hover:text-blue-600 transition-colors cursor-default">Vue.js</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-300">
              <h3 className="font-semibold mb-4 text-green-600 text-lg">Backend</h3>
              <div className="space-y-3 text-base text-gray-700">
                <div className="hover:text-green-600 transition-colors cursor-default">Node.js</div>
                <div className="hover:text-green-600 transition-colors cursor-default">Express</div>
                <div className="hover:text-green-600 transition-colors cursor-default">MongoDB</div>
                <div className="hover:text-green-600 transition-colors cursor-default">PostgreSQL</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300">
              <h3 className="font-semibold mb-4 text-purple-600 text-lg">Tools</h3>
              <div className="space-y-3 text-base text-gray-700">
                <div className="hover:text-purple-600 transition-colors cursor-default">Git</div>
                <div className="hover:text-purple-600 transition-colors cursor-default">Docker</div>
                <div className="hover:text-purple-600 transition-colors cursor-default">AWS</div>
                <div className="hover:text-purple-600 transition-colors cursor-default">Vercel</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}