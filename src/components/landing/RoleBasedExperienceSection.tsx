'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import {
  Shield,
  Building2,
  Users,
  UserCheck,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';


const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

type RoleId = 'admin' | 'hr' | 'manager' | 'employee';

const ROLES: Array<{
  id: RoleId;
  label: string;
  description: string;
  capabilities: string[];
  icon: LucideIcon;
}> = [
  {
    id: 'admin',
    label: 'Company Admin',
    description: 'Configure company structure, policies, and payroll rules',
    icon: Shield,
    capabilities: [
      'Create and manage HR, Manager, and Employee users',
      'Run payroll and define salary structures',
      'Set up departments, holidays, and organization settings',
      'Configure attendance, leave policies, and approval workflows',
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    description: 'Track attendance, manage employees, and run day-to-day HR operations',
    icon: Building2,
    capabilities: [
      'Manage the employee directory and profiles',
      'Oversee company attendance and attendance exceptions',
      'Approve leave requests and attendance regularizations',
      'Configure leave policies, shifts, and attendance rules',
    ],
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'View team attendance and approve requests without follow-ups',
    icon: Users,
    capabilities: [
      'Mark your own attendance and request leave',
      'View real-time attendance for your direct team',
      'Approve or reject team leave requests',
      'See team leave on a shared calendar',
    ],
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Mark attendance, apply leaves, and view payslips anytime',
    icon: UserCheck,
    capabilities: [
      'Check in and out with photo attendance',
      'Request leave and track your leave balance',
      'Submit attendance regularization requests',
      'Access payslips and your personal calendar',
    ],
  },
];

/**
 * Role experience — intro copy beside a single card with
 * vertical role tabs + text detail for the selected role.
 */
export function RoleBasedExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<RoleId>('admin');
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const playedRef = useRef(false);
  const baseId = useId();

  const active = ROLES.find((r) => r.id === activeId) ?? ROLES[0];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (reducedMotion) {
      setVisible(true);
      playedRef.current = true;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (playedRef.current) return;
        if (entry.isIntersecting) {
          setVisible(true);
          playedRef.current = true;
          observer.disconnect();
        }
      },
      LANDING_SCROLL_REVEAL
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const selectRole = useCallback((id: RoleId) => {
    setActiveId((prev) => {
      if (prev === id) return prev;
      setPanelKey((k) => k + 1);
      return id;
    });
  }, []);

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = ROLES.findIndex((r) => r.id === activeId);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      next = (idx + 1) % ROLES.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      next = (idx - 1 + ROLES.length) % ROLES.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      next = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      next = ROLES.length - 1;
    } else {
      return;
    }
    selectRole(ROLES[next].id);
    document.getElementById(`${baseId}-tab-${ROLES[next].id}`)?.focus();
  };

  const enter = (delayMs: number, y = 14): CSSProperties => {
    if (reducedMotion) {
      return { opacity: visible ? 1 : 0, transition: `opacity 280ms ${EASE}` };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity ${landingDuration(600)}ms ${EASE} ${landingDelay(delayMs)}ms, transform ${landingDuration(600)}ms ${EASE} ${landingDelay(delayMs)}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-slate-200/70 bg-[#F7F9FC]"
      aria-labelledby={`${baseId}-heading`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(100 116 139) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-14 xl:gap-16">
          {/* Intro */}
          <div className="min-w-0 max-w-[540px]">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-[13px] font-medium text-primary"
              style={enter(0, 8)}
            >
              <Users className="h-4 w-4" aria-hidden />
              Role-Based Experience
            </div>

            <h2
              id={`${baseId}-heading`}
              className="text-[34px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[40px] lg:text-[48px] lg:leading-[1.1]"
              style={enter(60, 24)}
            >
              Built for every role in your organization
            </h2>

            <p
              className="mt-5 max-w-[500px] text-[16px] leading-[1.65] text-slate-500 sm:text-[17px]"
              style={enter(140, 14)}
            >
              Each user accesses features and data appropriate to their responsibilities.
            </p>
          </div>

          {/* Connected role card */}
          <div className="min-w-0" style={enter(200, 20)}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)]">
              <div className="grid sm:grid-cols-[200px_minmax(0,1fr)] sm:items-stretch">
                {/* Role tabs */}
                <div
                  role="tablist"
                  aria-label="Organization roles"
                  aria-orientation="vertical"
                  className="flex gap-0.5 overflow-x-auto border-b border-slate-100 bg-slate-50/90 px-2 py-2 sm:h-full sm:flex-col sm:gap-0 sm:overflow-visible sm:border-b-0 sm:border-r sm:border-slate-100 sm:p-0"
                  onKeyDown={onTabKeyDown}
                >
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    const selected = role.id === activeId;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        role="tab"
                        id={`${baseId}-tab-${role.id}`}
                        aria-selected={selected}
                        aria-controls={`${baseId}-panel`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => selectRole(role.id)}
                        className={cn(
                          'relative flex h-11 shrink-0 items-center gap-2.5 px-3 text-left transition-colors duration-150 sm:h-auto sm:min-h-0 sm:flex-1',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
                          selected
                            ? 'bg-white text-slate-900'
                            : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                        )}
                      >
                        {selected ? (
                          <span
                            className="absolute inset-y-0 left-0 hidden w-[2.5px] bg-primary sm:block"
                            aria-hidden
                          />
                        ) : null}
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            selected ? 'text-primary' : 'text-slate-400'
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            'whitespace-nowrap text-[13px] tracking-tight sm:whitespace-normal',
                            selected ? 'font-semibold' : 'font-medium'
                          )}
                        >
                          {role.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Role detail — continuous with active tab */}
                <div
                  id={`${baseId}-panel`}
                  role="tabpanel"
                  aria-labelledby={`${baseId}-tab-${active.id}`}
                  className="bg-white px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7"
                >
                  <div
                    key={panelKey}
                    className={cn(!reducedMotion && 'role-preview-enter')}
                  >
                    <h3 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
                      {active.label}
                    </h3>
                    <p className="mt-1.5 max-w-[420px] text-[14px] leading-[1.6] text-slate-500 sm:text-[15px]">
                      {active.description}
                    </p>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      What they can do
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {active.capabilities.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                          </span>
                          <span className="text-[13.5px] leading-[1.5] text-slate-600 sm:text-[14px]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
