'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Calendar,
  ClipboardList,
  Building2,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { hasAnyRole } from '@/lib/permissions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Navigation structure - reorganized for clarity
const navigationSections: NavSection[] = [
  {
    // Dashboard - always visible
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Personal',
    items: [
      { 
        label: 'My Attendance', 
        href: '/dashboard/my-attendance', 
        icon: Clock,
      },
      { 
        label: 'My Leave', 
        href: '/dashboard/my-leave', 
        icon: FileText,
      },
      { 
        label: 'My Calendar', 
        href: '/dashboard/my-calendar', 
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Team Management',
    items: [
      { 
        label: 'Team Attendance', 
        href: '/dashboard/team-attendance', 
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
      { 
        label: 'Team Leaves', 
        href: '/dashboard/team-leaves', 
        icon: Calendar,
        roles: [UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
      { 
        label: 'Leave Approvals', 
        href: '/dashboard/leave-approvals', 
        icon: ClipboardList,
        roles: [UserRole.ADMIN, UserRole.HR, UserRole.SUPERVISOR],
      },
      { 
        label: 'Employees', 
        href: '/dashboard/employees', 
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.HR],
      },
    ],
  },
  {
    title: 'Organization',
    items: [
      {
        label: 'Organizations',
        href: '/dashboard/organizations',
        icon: Building2,
        roles: [UserRole.SUPER_ADMIN],
      },
      { 
        label: 'Departments', 
        href: '/dashboard/departments', 
        icon: Building2,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      },
      { 
        label: 'Manage Holidays', 
        href: '/dashboard/manage-holidays', 
        icon: Calendar,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
      },
      { 
        label: 'Reports', 
        href: '/dashboard/reports', 
        icon: FileText,
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR],
      },
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: UserCog,
        roles: [UserRole.SUPER_ADMIN],
      },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { label: 'Profile', href: '/dashboard/profile', icon: UserCog },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Filter navigation items based on user role
  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true; // No role restriction
      if (!user) return false; // Not authenticated
      return hasAnyRole(user.role as UserRole, item.roles);
    });
  };

  // Filter sections to only show sections with visible items
  // Super Admin: Only show Dashboard and Organization sections (no personal/team sections)
  const visibleSections = navigationSections
    .filter((section) => {
      // For Super Admin, hide Personal and Team Management sections
      if (user?.role === UserRole.SUPER_ADMIN) {
        if (section.title === 'Personal' || section.title === 'Team Management') {
          return false;
        }
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: filterItemsByRole(section.items),
    }))
    .filter((section) => section.items.length > 0);

  const visibleBottomItems = filterItemsByRole(bottomNavItems);

  const sidebarContent = (
    <>
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
                      onNavigate={() => {
                        if (isMobile && onOpenChange) {
                          onOpenChange(false);
                        }
                      }}
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
              <NavLink 
                item={item} 
                isActive={pathname === item.href}
                onNavigate={() => {
                  if (isMobile && onOpenChange) {
                    onOpenChange(false);
                  }
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  // Mobile: Use Sheet component
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <aside className="flex h-full w-full flex-col bg-white">
            {sidebarContent}
          </aside>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Regular sidebar
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {sidebarContent}
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, isActive, onNavigate }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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
