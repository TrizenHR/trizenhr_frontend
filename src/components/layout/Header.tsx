'use client';

import { startTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getRoleDisplayName } from '@/lib/permissions';
import { NotificationBell } from '@/components/layout/NotificationBell';

interface HeaderProps {
  /** Page title in the header bar; omit for a minimal bar (e.g. dashboard). */
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    startTransition(() => {
      router.push('/login');
    });
  }, [logout, router]);

  const goToProfile = useCallback(() => {
    startTransition(() => router.push('/dashboard/profile'));
  }, [router]);

  const goToSettings = useCallback(() => {
    startTransition(() => router.push('/dashboard/settings'));
  }, [router]);

  // Get user initials
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title ? (
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {title}
            </h1>
            <div aria-hidden className="mt-0.5 h-px w-12 rounded-full bg-gradient-to-r from-primary/60 to-transparent" />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-4">
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 hover:bg-muted/80"
            >
              <Avatar className="h-9 w-9 ring-1 ring-border/60">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="max-w-[10rem] truncate text-sm font-medium text-foreground">
                  {user?.fullName || user?.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role && getRoleDisplayName(user.role as any)}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                goToProfile();
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                goToSettings();
              }}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
