'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const BENEFITS = ['Attendance', 'Payroll', 'Reports', 'Compliance'] as const;

/**
 * Final conversion CTA — glass card, glow, motion.
 * Existing marketing copy and demo action unchanged.
 */
export function FinalCTASection({ onBookDemo }: { onBookDemo: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const playedRef = useRef(false);
  const baseId = useId();

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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const enter = (
    delayMs: number,
    opts: { y?: number; scale?: number; duration?: number } = {}
  ): CSSProperties => {
    const { y = 0, scale = 1, duration = 550 } = opts;
    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transition: `opacity 280ms ${EASE}`,
      };
    }
    const from: string[] = [];
    if (y) from.push(`translateY(${y}px)`);
    if (scale !== 1) from.push(`scale(${scale})`);
    return {
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translateY(0) scale(1)'
        : from.join(' ') || undefined,
      transition: `opacity ${duration}ms ${EASE} ${delayMs}ms, transform ${duration}ms ${EASE} ${delayMs}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="relative overflow-hidden py-16 md:py-24 lg:py-28"
      aria-labelledby={`${baseId}-heading`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F8FF] via-[#EEF2FF] to-[#F8FAFC]" />

      {/* Soft gradient orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            'absolute -left-24 top-8 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl',
            !reducedMotion && 'cta-glow-drift'
          )}
        />
        <div
          className={cn(
            'absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl',
            !reducedMotion && 'cta-glow-drift'
          )}
          style={{ animationDelay: '2.5s' }}
        />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 md:px-6 lg:px-8">
        {/* Radial glow behind card */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.22),transparent_68%)]"
          aria-hidden
        />

        <div
          className="relative mx-auto w-full max-w-[900px]"
          style={enter(0, { y: 40, scale: 0.98, duration: 700 })}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-[28px] border border-white/70 px-8 py-14 text-center sm:px-14 sm:py-16 lg:px-20 lg:py-[72px]',
              'shadow-[0_32px_80px_-28px_rgba(79,70,229,0.35),0_12px_32px_-16px_rgba(15,23,42,0.12)]'
            )}
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_55%)]"
              aria-hidden
            />

            <h2
              id={`${baseId}-heading`}
              className="relative text-[30px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[38px] lg:text-[46px] lg:leading-[1.12]"
            >
              <span
                className="block overflow-hidden"
                style={enter(80, { y: 28, duration: 600 })}
              >
                <span className="inline-block">Ready to streamline</span>
              </span>
              <span
                className="mt-1 block overflow-hidden sm:mt-1.5"
                style={enter(160, { y: 28, duration: 650 })}
              >
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #2563eb, #4f46e5)',
                  }}
                >
                  attendance and payroll?
                </span>
              </span>
            </h2>

            <p
              className="relative mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.65] text-slate-500 sm:text-[17px] lg:text-[18px]"
              style={enter(240, { y: 14, duration: 500 })}
            >
              Book a personalized demo for your organization. No credit card required.
            </p>

            <ul
              className="relative mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
              aria-label="Included capabilities"
            >
              {BENEFITS.map((item, i) => (
                <li
                  key={item}
                  style={enter(320 + i * 80, { y: 10, duration: 400 })}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-[13px] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="relative mt-10"
              style={enter(520, { scale: 0.95, duration: 450 })}
            >
              <Button
                type="button"
                size="lg"
                className={cn(
                  'group h-14 rounded-[14px] px-9 text-[16px] font-semibold',
                  'shadow-[0_14px_32px_-10px_rgba(79,70,229,0.55)]',
                  'transition-all duration-[240ms] ease-out',
                  'hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.65)]',
                  'active:translate-y-0',
                  'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                  'motion-reduce:hover:translate-y-0'
                )}
                onClick={onBookDemo}
              >
                Book a demo
                <TrendingUp className="ml-2 h-5 w-5 transition-transform duration-[240ms] ease-out group-hover:translate-x-1" />
              </Button>
            </div>

            <p
              className="relative mt-5 text-[13px] text-slate-500 sm:text-sm"
              style={enter(600, { y: 8, duration: 400 })}
            >
              No credit card required
            </p>
            <p
              className="relative mt-2 text-[13px] font-medium text-slate-400 sm:text-[13.5px]"
              style={enter(660, { y: 8, duration: 400 })}
            >
              Built for modern organizations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
