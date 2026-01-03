'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  Users,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { hasAnyRole } from '@/lib/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // If specified, only these roles can see this item
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Leave', href: '/dashboard/leave', icon: Calendar },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: UserCog,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
  },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter navigation items based on user role
  const visibleMainNavItems = mainNavItems.filter((item) => {
    if (!item.roles) return true; // No role restriction
    if (!user) return false; // Not authenticated
    return hasAnyRole(user.role as UserRole, item.roles);
  });

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="rounded" />
        <span className="font-semibold text-gray-900">Trizen Ventures</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {visibleMainNavItems.map((item) => (
            <li key={item.href}>
              <NavLink item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-4">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <NavLink item={item} isActive={pathname === item.href} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}
