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
  Building2,
  BarChart3,
  UserPlus,
  ClipboardList,
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

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Navigation structure organized by sections
const navigationSections: NavSection[] = [
  {
    // Main section - no title
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Attendance',
    items: [
      { 
        label: 'My Attendance', 
        href: '/dashboard/my-attendance', 
        icon: Clock,
      },
      { 
        label: 'Team Attendance', 
        href: '/dashboard/team/attendance', 
        icon: ClipboardList,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
      { 
        label: 'All Attendance', 
        href: '/dashboard/attendance', 
        icon: BarChart3,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
      },
    ],
  },
  {
    title: 'Leave Management',
    items: [
      { 
        label: 'My Leave', 
        href: '/dashboard/my-leave', 
        icon: Calendar,
      },
      { 
        label: 'Leave Approvals', 
        href: '/dashboard/leave-approvals', 
        icon: ClipboardList,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
    ],
  },
  {
    title: 'People',
    items: [
      { 
        label: 'Employees', 
        href: '/dashboard/employees', 
        icon: Users,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
      { 
        label: 'My Team', 
        href: '/dashboard/team', 
        icon: Users,
        roles: [UserRole.SUPERVISOR],
      },
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: UserCog,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
      },
    ],
  },
  {
    title: 'Organization',
    items: [
      { 
        label: 'Departments', 
        href: '/dashboard/departments', 
        icon: Building2,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      },
      { 
        label: 'Reports', 
        href: '/dashboard/reports', 
        icon: FileText,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
      },
    ],
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
  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true; // No role restriction
      if (!user) return false; // Not authenticated
      return hasAnyRole(user.role as UserRole, item.roles);
    });
  };

  // Filter sections to only show sections with visible items
  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: filterItemsByRole(section.items),
    }))
    .filter((section) => section.items.length > 0);

  const visibleBottomItems = filterItemsByRole(bottomNavItems);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="rounded" />
        <div>
          <span className="block font-semibold text-gray-900">AttendEase</span>
          <span className="block text-xs text-gray-500">by Trizen Ventures</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {visibleSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink 
                      item={item} 
                      isActive={pathname === item.href || pathname.startsWith(item.href + '/')} 
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-4">
        <ul className="space-y-1">
          {visibleBottomItems.map((item) => (
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
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-400')} />
      {item.label}
    </Link>
  );
}
