'use client';

import { useEffect, useState } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DemoRequestModal } from '@/components/landing/DemoRequestModal';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const openIfHashDemo = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#demo') {
        setDemoOpen(true);
      }
    };
    openIfHashDemo();
    window.addEventListener('hashchange', openIfHashDemo);
    return () => window.removeEventListener('hashchange', openIfHashDemo);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar onBookDemo={() => setDemoOpen(true)} />
      <main className="flex-1">{children}</main>
      <LandingFooter onBookDemo={() => setDemoOpen(true)} />
      <DemoRequestModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
