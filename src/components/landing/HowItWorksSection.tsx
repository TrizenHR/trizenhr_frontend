'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Clock,
  CheckCircle2,
  IndianRupee,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

type ScrollDir = 'down' | 'up';
type MotionKind = 'fade' | 'line-x' | 'line-y' | 'scale' | 'card-up' | 'card-down';

const STEPS: Array<{
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  border: string;
  accent: string;
  nodeBorder: string;
  connector: string;
  position: 'above' | 'below';
}> = [
  {
    number: 1,
    icon: Clock,
    title: 'Mark Attendance',
    description:
      'Employees check-in via web or mobile app. Real-time visibility for managers.',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-slate-200/90',
    accent: 'bg-blue-500',
    nodeBorder: 'border-blue-500',
    connector: 'bg-blue-400/40',
    position: 'above',
  },
  {
    number: 2,
    icon: CheckCircle2,
    title: 'Auto-sync Data',
    description:
      'Attendance automatically flows into leave management and payroll systems.',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-slate-200/90',
    accent: 'bg-emerald-500',
    nodeBorder: 'border-emerald-500',
    connector: 'bg-emerald-400/40',
    position: 'below',
  },
  {
    number: 3,
    icon: IndianRupee,
    title: 'Process Payroll',
    description:
      'Calculate salaries with accurate attendance, leaves, and statutory components.',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    border: 'border-slate-200/90',
    accent: 'bg-violet-500',
    nodeBorder: 'border-violet-500',
    connector: 'bg-violet-400/40',
    position: 'above',
  },
  {
    number: 4,
    icon: FileText,
    title: 'Generate Reports',
    description: 'Export audit-ready reports for compliance and decision-making.',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    border: 'border-slate-200/90',
    accent: 'bg-orange-500',
    nodeBorder: 'border-orange-500',
    connector: 'bg-orange-400/40',
    position: 'below',
  },
];

function initialTransform(kind: MotionKind, dir: ScrollDir): string {
  switch (kind) {
    case 'line-x':
      return 'scaleX(0)';
    case 'line-y':
      return 'scaleY(0)';
    case 'scale':
      return 'scale(0.72)';
    case 'card-up':
      return dir === 'down' ? 'translateY(-28px)' : 'translateY(28px)';
    case 'card-down':
      return dir === 'down' ? 'translateY(28px)' : 'translateY(-28px)';
    case 'fade':
    default:
      return dir === 'down' ? 'translateY(24px)' : 'translateY(-24px)';
  }
}

function exitTransform(kind: MotionKind, dir: ScrollDir): string {
  switch (kind) {
    case 'line-x':
      return 'scaleX(0)';
    case 'line-y':
      return 'scaleY(0)';
    case 'scale':
      return 'scale(0.72)';
    case 'card-up':
      return dir === 'down' ? 'translateY(-18px)' : 'translateY(18px)';
    case 'card-down':
      return dir === 'down' ? 'translateY(18px)' : 'translateY(-18px)';
    case 'fade':
    default:
      return dir === 'down' ? 'translateY(-18px)' : 'translateY(18px)';
  }
}

function finalTransform(kind: MotionKind): string {
  switch (kind) {
    case 'line-x':
      return 'scaleX(1)';
    case 'line-y':
      return 'scaleY(1)';
    case 'scale':
      return 'scale(1)';
    default:
      return 'translateY(0)';
  }
}

/**
 * Direction-aware process timeline:
 * intro → line draw → nodes → connectors → cards → footer.
 * Replays when the section leaves and re-enters the viewport.
 */
export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dir, setDir] = useState<ScrollDir>('down');
  const [reducedMotion, setReducedMotion] = useState(false);

  const scrollYRef = useRef(0);
  const dirRef = useRef<ScrollDir>('down');
  const activeRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    scrollYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - scrollYRef.current) < 1) return;
      dirRef.current = y > scrollYRef.current ? 'down' : 'up';
      scrollYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (reducedMotion) {
      setActive(true);
      activeRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        const fullyGone = !entry.isIntersecting || ratio <= 0.02;
        const deepEnough = entry.isIntersecting && ratio >= 0.2;

        if (!activeRef.current && deepEnough) {
          setDir(dirRef.current);
          setActive(true);
          activeRef.current = true;
          return;
        }

        if (activeRef.current && fullyGone) {
          setDir(dirRef.current);
          setActive(false);
          activeRef.current = false;
        }
      },
      {
        ...LANDING_SCROLL_REVEAL,
        threshold: [0, 0.02, 0.15, 0.2, 0.35, 0.5, 0.7, 1],
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !contentRef.current) return;

    const els = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>('[data-motion]')
    );
    if (!els.length) return;

    if (active) {
      els.forEach((el) => {
        const kind = (el.dataset.motion || 'fade') as MotionKind;
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = initialTransform(kind, dir);
      });

      void contentRef.current.offsetHeight;

      requestAnimationFrame(() => {
        els.forEach((el) => {
          const kind = (el.dataset.motion || 'fade') as MotionKind;
          const delay = Number(el.dataset.delay ?? 0);
          const duration = landingDuration(
            kind === 'line-x' || kind === 'line-y' ? 900 : kind === 'scale' ? 480 : 620
          );
          const delayScaled = landingDelay(delay);
          el.style.transition = `opacity ${duration}ms ${EASE} ${delayScaled}ms, transform ${duration}ms ${EASE} ${delayScaled}ms`;
          el.style.opacity = '1';
          el.style.transform = finalTransform(kind);
        });
      });
      return;
    }

    els.forEach((el, i) => {
      const kind = (el.dataset.motion || 'fade') as MotionKind;
      const delay = dir === 'down' ? (els.length - 1 - i) * 28 : i * 28;
      el.style.transition = `opacity 340ms ${EASE} ${delay}ms, transform 340ms ${EASE} ${delay}ms`;
      el.style.opacity = '0';
      el.style.transform = exitTransform(kind, dir);
    });
  }, [active, dir, reducedMotion]);

  const delayFor = (down: number, up: number) => (dir === 'down' ? down : up);

  const reducedStyle: CSSProperties | undefined = reducedMotion
    ? { opacity: active ? 1 : 0, transition: `opacity 280ms ${EASE}` }
    : undefined;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-slate-200/60 bg-white"
      aria-labelledby="how-it-works-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(241,245,249,0.9),transparent_55%)]"
        aria-hidden
      />

      <div
        ref={contentRef}
        className="relative mx-auto w-full max-w-[1180px] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-28"
      >
        {/* Intro */}
        <div className="mx-auto max-w-[720px] text-center">
          <div
            data-motion="fade"
            data-delay={delayFor(0, 520)}
            className="mb-4 inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-primary opacity-0"
            style={reducedStyle}
          >
            Simple Process
          </div>

          <h2
            id="how-it-works-heading"
            data-motion="fade"
            data-delay={delayFor(70, 420)}
            className="opacity-0 text-[30px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[38px] lg:text-[44px] lg:leading-[1.1]"
            style={reducedStyle}
          >
            From clock-in to payslip in 4 steps
          </h2>

          <p
            data-motion="fade"
            data-delay={delayFor(140, 340)}
            className="mx-auto mt-4 max-w-[600px] opacity-0 text-[16px] leading-[1.65] text-slate-500 sm:text-[17px]"
            style={reducedStyle}
          >
            Automate your entire attendance and payroll workflow. No manual intervention needed.
          </p>
        </div>

        {/* Desktop zig-zag */}
        <div className="relative mt-14 hidden lg:block">
          <div className="grid grid-cols-4 gap-x-4">
            {STEPS.map((step, i) => (
              <div key={`top-${step.number}`} className="flex flex-col items-center justify-end">
                {step.position === 'above' ? (
                  <>
                    <StepCard
                      step={step}
                      compact
                      className="w-full"
                      motionKind="card-up"
                      delay={delayFor(380 + i * 110, 280 + (3 - i) * 90)}
                      reducedStyle={reducedStyle}
                    />
                    <div
                      data-motion="line-y"
                      data-delay={delayFor(340 + i * 110, 240 + (3 - i) * 90)}
                      className={cn(
                        'h-5 w-[2px] shrink-0 origin-bottom rounded-full opacity-0',
                        step.connector
                      )}
                      style={reducedStyle}
                      aria-hidden
                    />
                  </>
                ) : (
                  <div className="h-5" aria-hidden />
                )}
              </div>
            ))}
          </div>

          <div className="relative flex h-10 items-center">
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 z-0 h-[2px] -translate-y-1/2 overflow-hidden rounded-full"
              aria-hidden
            >
              <div
                data-motion="line-x"
                data-delay={delayFor(200, 160)}
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-blue-400/65 via-emerald-400/60 via-violet-400/60 to-orange-400/65 opacity-0"
                style={reducedStyle}
              />
            </div>
            <div className="relative z-10 grid w-full grid-cols-4 gap-x-4">
              {STEPS.map((step, i) => (
                <div key={`node-${step.number}`} className="flex items-center justify-center">
                  <div
                    data-motion="scale"
                    data-delay={delayFor(280 + i * 110, 200 + (3 - i) * 90)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold text-slate-800 opacity-0 shadow-[0_2px_10px_rgba(15,23,42,0.08)]',
                      step.nodeBorder
                    )}
                    style={reducedStyle}
                  >
                    {step.number}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-x-4">
            {STEPS.map((step, i) => (
              <div key={`bot-${step.number}`} className="flex flex-col items-center justify-start">
                {step.position === 'below' ? (
                  <>
                    <div
                      data-motion="line-y"
                      data-delay={delayFor(340 + i * 110, 240 + (3 - i) * 90)}
                      className={cn(
                        'h-5 w-[2px] shrink-0 origin-top rounded-full opacity-0',
                        step.connector
                      )}
                      style={reducedStyle}
                      aria-hidden
                    />
                    <StepCard
                      step={step}
                      compact
                      className="w-full"
                      motionKind="card-down"
                      delay={delayFor(380 + i * 110, 280 + (3 - i) * 90)}
                      reducedStyle={reducedStyle}
                    />
                  </>
                ) : (
                  <div className="h-5" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tablet 2×2 */}
        <div className="mt-12 hidden grid-cols-2 gap-5 md:grid lg:hidden">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              showNode
              className="max-w-none"
              motionKind="fade"
              delay={delayFor(240 + i * 90, 200 + (3 - i) * 70)}
              reducedStyle={reducedStyle}
            />
          ))}
        </div>

        {/* Mobile vertical */}
        <div className="relative mt-12 md:hidden">
          <div
            data-motion="line-y"
            data-delay={delayFor(180, 140)}
            className="absolute bottom-6 left-[19px] top-6 w-[2px] origin-top rounded-full bg-gradient-to-b from-blue-400/45 via-violet-400/35 to-orange-400/45 opacity-0"
            aria-hidden
            style={reducedStyle}
          />
          <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="relative flex gap-3.5">
                  <div
                    data-motion="scale"
                    data-delay={delayFor(240 + i * 90, 180 + (3 - i) * 70)}
                    className={cn(
                      'relative z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold opacity-0 shadow-sm',
                      step.nodeBorder
                    )}
                    style={reducedStyle}
                  >
                    {step.number}
                  </div>
                  <article
                    data-motion="fade"
                    data-delay={delayFor(280 + i * 90, 160 + (3 - i) * 70)}
                    className={cn(
                      'relative min-w-0 flex-1 overflow-hidden rounded-2xl border bg-white p-4 opacity-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
                      step.border
                    )}
                    style={reducedStyle}
                  >
                    <span className={cn('absolute inset-x-0 top-0 h-[3px]', step.accent)} aria-hidden />
                    <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', step.iconBg)}>
                      <Icon className={cn('h-5 w-5', step.iconColor)} />
                    </div>
                    <h3 className="mt-3 text-[16px] font-semibold tracking-tight text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-[1.55] text-slate-500">
                      {step.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-12 flex justify-center lg:mt-14">
          <p
            data-motion="fade"
            data-delay={delayFor(780, 40)}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/12 bg-primary/[0.04] px-4 py-2.5 text-[13px] font-medium text-slate-600 opacity-0 sm:px-5 sm:text-[14px]"
            style={reducedStyle}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>Everything happens automatically. Your team just focuses on their work.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  showNode = false,
  compact = false,
  className,
  motionKind,
  delay,
  reducedStyle,
}: {
  step: (typeof STEPS)[number];
  showNode?: boolean;
  compact?: boolean;
  className?: string;
  motionKind: MotionKind;
  delay: number;
  reducedStyle?: CSSProperties;
}) {
  const Icon = step.icon;

  return (
    <div
      data-motion={motionKind}
      data-delay={delay}
      className={cn('opacity-0', className)}
      style={reducedStyle}
    >
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.1)] transition-[box-shadow,border-color] duration-300',
          'hover:border-slate-300 hover:shadow-[0_14px_32px_-14px_rgba(15,23,42,0.14)]',
          compact ? 'px-4 py-3.5' : 'p-5',
          step.border
        )}
      >
        <span className={cn('absolute inset-x-0 top-0 h-[3px]', step.accent)} aria-hidden />

        {compact ? (
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                step.iconBg
              )}
            >
              <Icon className={cn('h-4 w-4', step.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-[13px] leading-[1.45] text-slate-500">{step.description}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-[12px]',
                  step.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', step.iconColor)} />
              </div>
              {showNode ? (
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white text-[11px] font-semibold',
                    step.nodeBorder
                  )}
                >
                  {step.number}
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900">
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.55] text-slate-500">{step.description}</p>
          </>
        )}
      </article>
    </div>
  );
}
