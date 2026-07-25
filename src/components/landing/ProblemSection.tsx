'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FileText, Eye, Shield, CheckCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

type ScrollDir = 'down' | 'up';

const PROBLEMS: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  ring: string;
}> = [
  {
    icon: FileText,
    title: 'Spreadsheet chaos',
    description:
      'Teams waste hours managing attendance in spreadsheets and disconnected systems.',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    accent: 'bg-rose-500',
    ring: 'group-hover:border-rose-200/80',
  },
  {
    icon: Eye,
    title: 'Payroll errors',
    description:
      "Payroll errors increase when attendance, leave, and approvals don't sync.",
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    accent: 'bg-orange-500',
    ring: 'group-hover:border-orange-200/80',
  },
  {
    icon: Shield,
    title: 'Audit stress',
    description:
      'Compliance audits become stressful without accurate, centralized records.',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accent: 'bg-amber-500',
    ring: 'group-hover:border-amber-200/80',
  },
];

/**
 * Direction-aware section motion:
 * - Scroll down: enter from below (normal)
 * - Scroll up: enter from above (reverse)
 * Content stays visible until the section fully leaves the viewport.
 */
export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dir, setDir] = useState<ScrollDir>('down');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const scrollYRef = useRef(0);
  const dirRef = useRef<ScrollDir>('down');
  const activeRef = useRef(false);

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
        // Wait until section is meaningfully in the center band
        const deepEnough = entry.isIntersecting && ratio >= 0.2;

        // Enter once deep enough — stay until fully gone (no mid-view vanish)
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

  // Drive enter / exit via direct DOM styles for reliable reverse motion
  useEffect(() => {
    if (reducedMotion || !contentRef.current) return;

    const els = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>('[data-motion]')
    );
    if (!els.length) return;

    if (active) {
      const fromY = dir === 'down' ? 28 : -28;

      els.forEach((el) => {
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = `translateY(${fromY}px)`;
      });

      void contentRef.current.offsetHeight;

      requestAnimationFrame(() => {
        els.forEach((el) => {
          const delay = Number(el.dataset.delay ?? 0);
          el.style.transition = `opacity ${landingDuration(650)}ms ${EASE} ${landingDelay(delay)}ms, transform ${landingDuration(650)}ms ${EASE} ${landingDelay(delay)}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
      return;
    }

    // Exit — reverse of travel direction
    const toY = dir === 'down' ? -22 : 22;
    els.forEach((el, i) => {
      const delay =
        dir === 'down' ? (els.length - 1 - i) * 45 : i * 45;
      el.style.transition = `opacity 380ms ${EASE} ${delay}ms, transform 380ms ${EASE} ${delay}ms`;
      el.style.opacity = '0';
      el.style.transform = `translateY(${toY}px)`;
    });
  }, [active, dir, reducedMotion, isMobile]);

  const delayFor = (down: number, up: number) =>
    isMobile
      ? dir === 'down'
        ? Math.round(down * 0.7)
        : Math.round(up * 0.7)
      : dir === 'down'
        ? down
        : up;

  // Avoid inline motion styles — the effect owns transform/opacity so React
  // re-renders cannot wipe an in-progress animation.
  const reducedStyle: CSSProperties | undefined = reducedMotion
    ? { opacity: active ? 1 : 0, transition: `opacity 280ms ${EASE}` }
    : undefined;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-slate-200/60 bg-white"
      aria-labelledby="problem-section-heading"
    >
      <div
        ref={contentRef}
        className="relative mx-auto w-full max-w-[1120px] px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20"
      >
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.15fr] md:gap-12 lg:gap-16">
          <div className="max-w-md md:max-w-none">
            <h2
              id="problem-section-heading"
              data-motion
              data-delay={delayFor(0, 220)}
              className="opacity-0 text-[32px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[40px] lg:text-[44px] lg:leading-[1.12]"
              style={reducedStyle}
            >
              The cost of manual attendance and fragmented payroll
            </h2>

            <p
              data-motion
              data-delay={delayFor(90, 140)}
              className="mt-5 opacity-0 text-[16px] leading-[1.65] text-slate-500 sm:text-[17px]"
              style={reducedStyle}
            >
              Organizations without centralized workforce tracking face recurring operational
              challenges that affect productivity, compliance, and decision-making.
            </p>

            <div
              data-motion
              data-delay={delayFor(170, 60)}
              className="mt-8 flex items-start gap-3 border-t border-slate-200/80 pt-6 opacity-0"
              style={reducedStyle}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[14px] font-medium leading-relaxed text-slate-600 sm:text-[15px]">
                TrizenHR centralizes attendance and payroll to eliminate these gaps.
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute bottom-10 left-[35px] top-10 hidden w-px bg-slate-200/70 md:block"
              aria-hidden
              style={
                reducedMotion
                  ? undefined
                  : {
                      transform: active ? 'scaleY(1)' : 'scaleY(0)',
                      transformOrigin: dir === 'down' ? 'top' : 'bottom',
                      transition: active
                        ? `transform 700ms ${EASE} 160ms`
                        : `transform 320ms ${EASE}`,
                    }
              }
            />

            <ul className="relative m-0 flex list-none flex-col gap-3.5 p-0 sm:gap-4">
              {PROBLEMS.map((problem, index) => {
                const Icon = problem.icon;
                const downDelay = 220 + index * 100;
                const upDelay = 220 + (PROBLEMS.length - 1 - index) * 100;

                return (
                  <li
                    key={problem.title}
                    data-motion
                    data-delay={delayFor(downDelay, upDelay)}
                    className="opacity-0"
                    style={reducedStyle}
                  >
                    <article
                      className={cn(
                        'group relative flex w-full items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-300 sm:gap-5 sm:p-6',
                        'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_-14px_rgba(15,23,42,0.14)]',
                        problem.ring
                      )}
                    >
                      <span
                        className={cn(
                          'absolute bottom-5 left-0 top-5 w-[3px] rounded-full',
                          problem.accent
                        )}
                        aria-hidden
                      />

                      <div
                        className={cn(
                          'relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-px sm:h-12 sm:w-12',
                          problem.iconBg
                        )}
                      >
                        <Icon className={cn('h-5 w-5', problem.iconColor)} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[16px] font-semibold tracking-tight text-slate-900 sm:text-[17px]">
                          {problem.title}
                        </h3>
                        <p className="mt-1.5 text-[14px] leading-[1.55] text-slate-500 sm:text-[15px]">
                          {problem.description}
                        </p>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
