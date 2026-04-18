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
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50/90 to-white">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 bg-slate-50/50">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-white shadow-[inset_6px_0_24px_-20px_rgba(30,64,175,0.08)]">
        <Header onMenuClick={openSidebar} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
