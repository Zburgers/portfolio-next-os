'use client';

import { DesktopProvider } from '@/context/DesktopContext';
import { SystemBootProvider } from '@/context/SystemBootContext';
import BootSequence from '@/components/boot/BootSequence';
import Desktop from '@/components/system/Desktop';

export default function Home() {
  return (
    <SystemBootProvider>
      <DesktopProvider>
        <BootSequence>
          <Desktop />
        </BootSequence>
      </DesktopProvider>
    </SystemBootProvider>
  );
}