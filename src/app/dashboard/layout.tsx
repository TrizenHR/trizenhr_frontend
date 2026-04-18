'use client';

import { useCallback, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useRequireAuth } from '@/hooks/use-auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-muted border-t-primary"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 bg-muted/40">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-l border-border/50 bg-gradient-to-b from-background via-muted/15 to-muted/25 shadow-[inset_8px_0_28px_-24px_rgba(79,70,229,0.06)]">
        <Header onMenuClick={openSidebar} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
