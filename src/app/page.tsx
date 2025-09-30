'use client';

import { DesktopProvider } from '@/context/DesktopContext';
import Desktop from '@/components/system/Desktop';

export default function Home() {
  return (
    <DesktopProvider>
      <Desktop />
    </DesktopProvider>
  );
}