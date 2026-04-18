'use client';

import { memo, useCallback, useMemo } from 'react';
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
  DollarSign,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole, type User } from '@/lib/types';
import { hasAnyRole } from '@/lib/permissions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  roles?: UserRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Personal',
    items: [
      {
        label: 'My Attendance',
        href: '/dashboard/my-attendance',
        icon: Clock,
        roles: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
      },
      {
        label: 'My Leave',
        href: '/dashboard/my-leave',
        icon: FileText,
        roles: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
      },
      {
        label: 'My Calendar',
        href: '/dashboard/my-calendar',
        icon: Calendar,
        roles: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
      },
      {
        label: 'My Salary',
        href: '/dashboard/my-salary',
        icon: Wallet,
        roles: [UserRole.SUPERVISOR, UserRole.EMPLOYEE],
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
        roles: [UserRole.HR, UserRole.SUPERVISOR],
      },
      {
        label: 'Team Leaves',
        href: '/dashboard/team-leaves',
        icon: Calendar,
        roles: [UserRole.HR, UserRole.SUPERVISOR],
      },
      {
        label: 'Leave Approvals',
        href: '/dashboard/leave-approvals',
        icon: ClipboardList,
        roles: [UserRole.HR, UserRole.SUPERVISOR],
      },
      {
        label: 'Employees',
        href: '/dashboard/employees',
        icon: Users,
        roles: [UserRole.HR],
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
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Manage Holidays',
        href: '/dashboard/manage-holidays',
        icon: Calendar,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Reports',
        href: '/dashboard/reports',
        icon: FileText,
        roles: [UserRole.ADMIN, UserRole.HR],
      },
      {
        label: 'Salary Structures',
        href: '/dashboard/salary-structures',
        icon: DollarSign,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Manage Users',
        href: '/dashboard/users',
        icon: UserCog,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Payroll Processing',
        href: '/dashboard/payroll',
        icon: Wallet,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'System Users',
        href: '/dashboard/system-users',
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

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function filterItemsByRole(items: NavItem[], user: User | null) {
  return items.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return hasAnyRole(user.role as UserRole, item.roles);
  });
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const visibleSections = useMemo(() => {
    return navigationSections
      .filter((section) => {
        if (user?.role === UserRole.SUPER_ADMIN) {
          if (section.title === 'Personal' || section.title === 'Team Management') {
            return false;
          }
        }
        return true;
      })
      .map((section) => ({
        ...section,
        items: filterItemsByRole(section.items, user),
      }))
      .filter((section) => section.items.length > 0);
  }, [user]);

  const visibleBottomItems = useMemo(() => filterItemsByRole(bottomNavItems, user), [user]);

  const closeAfterNavigate = useCallback(() => {
    if (isMobile) onOpenChange?.(false);
  }, [isMobile, onOpenChange]);

  const mainNav = (
    <nav
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 pb-4 pt-2 sm:px-4"
      aria-label="Main navigation"
    >
      <div className="flex flex-col">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.title ?? `section-${sectionIndex}`}>
            {sectionIndex > 0 && (
              <div
                className="mx-1 mb-4 mt-4 h-px bg-gradient-to-r from-transparent via-blue-200/70 to-transparent"
                aria-hidden
              />
            )}
            {section.title && (
              <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-900/40">
                {section.title}
              </h3>
            )}
            <ul className="flex flex-col gap-0.5" role="list">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    isActive={isNavItemActive(pathname, item.href)}
                    onNavigate={closeAfterNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  const accountNav = (
    <div className="shrink-0 border-t border-blue-100/90 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4">
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-900/40">
        Account
      </p>
      <ul className="flex flex-col gap-1" role="list" aria-label="Account links">
        {visibleBottomItems.map((item) => (
          <li key={item.href}>
            <NavLink
              item={item}
              isActive={isNavItemActive(pathname, item.href)}
              onNavigate={closeAfterNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );

  const header = (
    <header className="flex shrink-0 items-center gap-3 border-b border-blue-100 bg-white px-4 py-4 sm:px-5">
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden ">
        <Image
          src="/assets/logo.png"
          alt=""
          width={32}
          height={32}
          priority
          className="size-8 object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold tracking-tight text-blue-950">TrizenHR</p>
        <p className="truncate text-xs font-medium text-blue-600/85">by Trizen Ventures</p>
      </div>
    </header>
  );

  const mobileShellClass = cn(
    'flex h-full min-h-0 w-full flex-col bg-white pt-14'
  );

  const column = (
    <>
      {header}
      {mainNav}
      {accountNav}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[min(17rem,calc(100vw-1rem))] max-w-none border-0 border-r border-blue-200/90 p-0 shadow-2xl sm:max-w-none [&>button]:right-3 [&>button]:top-3 [&>button]:z-[60] [&>button]:flex [&>button]:size-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-blue-100 [&>button]:bg-white [&>button]:text-blue-700 [&>button]:shadow-sm"
        >
          <aside className={mobileShellClass}>{column}</aside>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden h-screen w-56 shrink-0 border-r border-blue-200/85 bg-white shadow-[6px_0_28px_-14px_rgba(29,78,216,0.14)] md:flex md:flex-col">
      {column}
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}

const NavLink = memo(function NavLink({ item, isActive, onNavigate }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      prefetch
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex min-h-[44px] items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-100 ease-out sm:min-h-0 sm:py-1',
        'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-blue-50/90 text-blue-950 ring-1 ring-blue-100/80'
          : 'text-blue-950/70 hover:bg-blue-50/70 hover:text-blue-950'
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-100 ease-out',
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700'
        )}
      >
        <Icon className="size-[17px]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-snug sm:text-sm">
        {item.label}
      </span>
    </Link>
  );
});
