'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  Shield,
  Lock,
  FileText,
  Check,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const FEATURES: Array<{
  label: string;
  icon: LucideIcon;
  tint: string;
  iconBg: string;
}> = [
  {
    label: 'Role-based access control',
    icon: Lock,
    tint: 'from-blue-50 to-indigo-50/80',
    iconBg: 'bg-blue-500',
  },
  {
    label: 'Audit logs & data isolation',
    icon: FileText,
    tint: 'from-sky-50 to-blue-50/70',
    iconBg: 'bg-sky-500',
  },
  {
    label: 'Secure cloud infrastructure',
    icon: Shield,
    tint: 'from-indigo-50 to-violet-50/60',
    iconBg: 'bg-indigo-500',
  },
];

/** Decorative audit entries — structure only, no new marketing copy */
const AUDIT_ROWS = [
  {
    icon: Lock,
    accent: 'bg-blue-50 text-blue-600',
    titleW: 'w-[58%]',
    metaW: 'w-[34%]',
    badge: 'ok' as const,
  },
  {
    icon: FileText,
    accent: 'bg-sky-50 text-sky-600',
    titleW: 'w-[72%]',
    metaW: 'w-[42%]',
    badge: 'ok' as const,
  },
  {
    icon: Shield,
    accent: 'bg-indigo-50 text-indigo-600',
    titleW: 'w-[48%]',
    metaW: 'w-[28%]',
    badge: 'ok' as const,
  },
  {
    icon: Lock,
    accent: 'bg-slate-100 text-slate-500',
    titleW: 'w-[64%]',
    metaW: 'w-[38%]',
    badge: 'soft' as const,
  },
];

const ACTIVITY = [
  { h: 38, active: false },
  { h: 56, active: false },
  { h: 44, active: false },
  { h: 72, active: true },
  { h: 50, active: false },
  { h: 84, active: true },
  { h: 60, active: false },
  { h: 46, active: false },
  { h: 78, active: true },
  { h: 52, active: false },
  { h: 66, active: false },
  { h: 40, active: false },
];

/**
 * Reports & Compliance — layout, visual depth, and motion only.
 * Marketing copy and feature labels/icons are unchanged.
 */
export function ReportsComplianceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [panelHover, setPanelHover] = useState(false);
  const playedRef = useRef(false);
  const baseId = useId();

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setReducedMotion(mqMotion.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();
    mqMotion.addEventListener('change', sync);
    mqMobile.addEventListener('change', sync);
    return () => {
      mqMotion.removeEventListener('change', sync);
      mqMobile.removeEventListener('change', sync);
    };
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const enter = (
    delayMs: number,
    opts: {
      y?: number;
      x?: number;
      scale?: number;
      rotateY?: number;
      duration?: number;
    } = {}
  ): CSSProperties => {
    const { y = 0, x = 0, scale = 1, rotateY = 0, duration = 500 } = opts;

    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transition: `opacity 280ms ${EASE}`,
      };
    }

    const from: string[] = [];
    if (x) from.push(`translateX(${x}px)`);
    if (y) from.push(`translateY(${y}px)`);
    if (scale !== 1) from.push(`scale(${scale})`);
    if (rotateY) from.push(`rotateY(${rotateY}deg)`);

    return {
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translateX(0) translateY(0) scale(1) rotateY(0deg)'
        : from.join(' ') || undefined,
      transition: `opacity ${duration}ms ${EASE} ${delayMs}ms, transform ${duration}ms ${EASE} ${delayMs}ms`,
      transformOrigin: 'center center',
    };
  };

  const statusEnter = (delayMs: number): CSSProperties => {
    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transition: `opacity 280ms ${EASE}`,
      };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.75)',
      transition: `opacity 300ms ${EASE} ${delayMs}ms, transform 300ms ${EASE} ${delayMs}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative overflow-hidden border-b border-slate-200/70 bg-white"
      aria-labelledby={`${baseId}-heading`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[50%] bg-[linear-gradient(105deg,transparent_10%,rgba(238,242,255,0.55)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-20 h-[380px] w-[380px] rounded-full bg-primary/[0.08] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-8%] bottom-[-5%] h-72 w-72 rounded-full bg-sky-100/50 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-[130px]">
        <div className="grid items-center gap-12 md:gap-14 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-[80px]">
          {/* Left */}
          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-[14px] py-2 text-[13px] font-medium text-primary"
              style={enter(0, { y: 10, duration: 400 })}
            >
              <Shield className="h-4 w-4 shrink-0" aria-hidden />
              Designed with compliance and security in mind
            </div>

            <h2
              id={`${baseId}-heading`}
              className="mt-[22px] text-[34px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[40px] lg:text-[50px] lg:leading-[1.1]"
              style={enter(80, { y: 28, duration: 650 })}
            >
              Reports & Compliance
            </h2>

            <p
              className="mt-5 max-w-[560px] text-[16px] leading-[1.65] text-slate-500 sm:text-[17px] lg:text-[18px]"
              style={enter(160, { y: 16, duration: 500 })}
            >
              From role-based access to audit-ready records, your workforce data stays accurate,
              secure, and compliant as your organization grows.
            </p>

            <ul className="mt-8 flex max-w-[540px] flex-col gap-3">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.label}
                    style={enter(240 + i * 90, { x: -18, duration: 450 })}
                  >
                    <div
                      className={cn(
                        'group flex h-[56px] w-full items-center gap-3.5 rounded-[14px] border border-slate-200/80 bg-white px-3.5',
                        'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
                        'transition-[transform,box-shadow,border-color,background-color] duration-[240ms] ease-out',
                        'hover:translate-x-[3px] hover:border-primary/25 hover:bg-slate-50/80 hover:shadow-[0_10px_28px_-14px_rgba(79,70,229,0.28)]',
                        'motion-reduce:hover:translate-x-0'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/[0.09] text-primary',
                          'transition-transform duration-[240ms] ease-out group-hover:translate-x-px',
                          'motion-reduce:group-hover:translate-x-0'
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] font-semibold tracking-tight text-slate-800 sm:text-[15.5px]">
                        {feature.label}
                      </span>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/25"
                        aria-hidden
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right — compact compliance card */}
          <div
            className="relative mx-auto w-full max-w-[480px] min-w-0 lg:mx-0 lg:w-full lg:max-w-[520px] lg:justify-self-end"
            style={{
              ...enter(420, {
                x: reducedMotion || isMobile ? 0 : 28,
                y: !reducedMotion && isMobile ? 14 : 0,
                scale: reducedMotion || isMobile ? 1 : 0.98,
                rotateY: reducedMotion || isMobile ? 0 : -2,
                duration: 650,
              }),
              perspective: reducedMotion || isMobile ? undefined : '1200px',
            }}
            onMouseEnter={() => setPanelHover(true)}
            onMouseLeave={() => setPanelHover(false)}
          >
            <div
              className="pointer-events-none absolute -inset-6 rounded-[36px] bg-[radial-gradient(ellipse_at_45%_35%,rgba(79,70,229,0.14),transparent_62%)]"
              aria-hidden
            />

            <div
              className="pointer-events-none absolute inset-[8px] hidden rounded-[20px] bg-gradient-to-br from-slate-200/60 to-indigo-100/35 sm:block"
              style={{ transform: 'translate(-12px, 10px) scale(0.98) rotate(-1deg)' }}
              aria-hidden
            />

            <div
              className={cn(
                'relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white sm:rounded-[22px]',
                'shadow-[0_20px_48px_-24px_rgba(15,23,42,0.3)]',
                'transition-[transform,box-shadow,border-color] duration-300 ease-out',
                panelHover &&
                  !reducedMotion &&
                  'lg:-translate-y-1 lg:border-slate-300/90 lg:shadow-[0_28px_56px_-24px_rgba(15,23,42,0.36)]'
              )}
            >
              {/* Compact chrome */}
              <div
                className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5"
                style={enter(500, { y: 8, duration: 400 })}
                aria-hidden
              >
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <div className="flex h-6 flex-1 items-center rounded-md border border-slate-200/80 bg-white px-2.5">
                  <Shield className="mr-1.5 h-3 w-3 text-primary/70" />
                  <span className="h-1.5 w-[38%] rounded-full bg-slate-200" />
                </div>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary"
                  style={statusEnter(580)}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>

              <div className="p-4 sm:p-5" aria-hidden>
                {/* Small summary chips */}
                <div
                  className="grid grid-cols-3 gap-2"
                  style={enter(540, { y: 10, duration: 400 })}
                >
                  {FEATURES.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.label}
                        className={cn(
                          'flex items-center gap-2 rounded-[10px] border border-white/70 bg-gradient-to-br px-2 py-2',
                          feature.tint
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white',
                            feature.iconBg
                          )}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                        <span
                          className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                          style={statusEnter(600 + i * 40)}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Compact access + ring row */}
                <div
                  className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2.5"
                  style={enter(600, { y: 10, duration: 400 })}
                >
                  <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-primary" />
                      <span className="h-1.5 w-14 rounded-full bg-slate-300/90" />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { w: 'w-full', tone: 'bg-primary' },
                        { w: 'w-[70%]', tone: 'bg-primary/65' },
                        { w: 'w-[42%]', tone: 'bg-primary/35' },
                      ].map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-8 shrink-0 rounded-full bg-slate-200" />
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
                            <div className={cn('h-full rounded-full', row.tone, row.w)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[12px] border border-slate-200/80 bg-gradient-to-b from-white to-indigo-50/50"
                    style={statusEnter(680)}
                  >
                    <div className="relative flex h-12 w-12 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[4px] border-slate-100" />
                      <div
                        className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-primary border-r-primary/50"
                        style={{ transform: 'rotate(-24deg)' }}
                      />
                      <Shield className="relative h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Compact audit rows */}
                <div className="mt-3 space-y-1.5">
                  {AUDIT_ROWS.slice(0, 3).map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-[10px] border border-slate-100 bg-white px-2.5 py-2"
                        style={enter(660 + i * 60, { y: 10, duration: 400 })}
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                            row.accent
                          )}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className={cn('h-1.5 rounded-full bg-slate-200/90', row.titleW)} />
                          <div className={cn('h-1 rounded-full bg-slate-100', row.metaW)} />
                        </div>
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                          style={statusEnter(740 + i * 50)}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Compact chart */}
                <div
                  className="mt-3 rounded-[12px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-primary/[0.04] px-3 py-2.5"
                  style={enter(860, { y: 10, duration: 450 })}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-primary/80" />
                      <span className="h-1.5 w-12 rounded-full bg-slate-200" />
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" style={statusEnter(920)} />
                  </div>
                  <div className="flex h-[52px] items-end gap-1 sm:h-[56px] sm:gap-1.5">
                    {ACTIVITY.slice(0, 10).map((bar, i) => (
                      <div
                        key={i}
                        className="relative flex-1"
                        style={{ height: `${bar.h}%` }}
                      >
                        <div
                          className={cn(
                            'h-full w-full rounded-t-[4px]',
                            bar.active
                              ? 'bg-gradient-to-t from-primary to-primary/55'
                              : 'bg-primary/20'
                          )}
                          style={enter(900 + i * 30, { y: 8, duration: 350 })}
                        />
                      </div>
                    ))}
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
