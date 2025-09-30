'use client';

import React from 'react';
import { Window as WindowType } from '@/context/DesktopContext';
import Portfolio from '@/components/apps/Portfolio';
import Terminal from '@/components/apps/Terminal';
import CodeEditor from '@/components/apps/CodeEditor';
import Files from '@/components/apps/Files';
import Settings from '@/components/apps/Settings';

interface AppContentProps {
  window: WindowType;
}

export default function AppContent({ window }: AppContentProps) {
  const { type, payload } = window;

  switch (type) {
    case 'portfolio':
      return <Portfolio />;
    
    case 'terminal':
      return <Terminal />;
    
    case 'code-editor':
      return (
        <CodeEditor 
          githubUrl={payload?.githubUrl} 
          projectName={payload?.projectName}
        />
      );
    
    case 'files':
      return <Files />;
    
    case 'settings':
      return <Settings />;
    
    default:
      return (
        <div className="h-full bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-semibold mb-2">Unknown Application</p>
            <p className="text-sm">App type: {type}</p>
          </div>
        </div>
      );
  }
}