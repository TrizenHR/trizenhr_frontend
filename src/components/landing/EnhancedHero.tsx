'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimatedHeading } from '@/components/landing/AnimatedHeading';
import { HeroDashboardFrame } from '@/components/landing/HeroDashboardFrame';
import { cn } from '@/lib/utils';

interface EnhancedHeroProps {
  onBookDemo: () => void;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const HEADING_TEXT = 'Attendance and payroll, in one place';
const HEADING_LINES = [
  { text: 'Attendance and payroll,' },
  { text: 'in one place', className: 'text-slate-600' },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function rangeProgress(p: number, start: number, end: number) {
  if (end <= start) return p >= end ? 1 : 0;
  return clamp01((p - start) / (end - start));
}

/** Hermite smoothstep — removes harsh linear feel */
function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function easeInOutQuint(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Sticky hero: intro animation → scroll zoom (capped) → image exits upward → next section.
 * No white-screen transition.
 */
export function EnhancedHero({ onBookDemo }: EnhancedHeroProps) {
  const trackRef = useRef<HTMLElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const dashWrapRef = useRef<HTMLDivElement>(null);
  const frameInnerRef = useRef<HTMLDivElement>(null);

  const [loadPhase, setLoadPhase] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [introDone, setIntroDone] = useState(false);

  const rafRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const breakpointRef = useRef<Breakpoint>('desktop');
  const reducedRef = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    breakpointRef.current = breakpoint;
  }, [breakpoint]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);

    const onResize = () => setBreakpoint(getBreakpoint());
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setLoadPhase(5);
      setIntroDone(true);
      return;
    }

    setLoadPhase(1);
    const t1 = window.setTimeout(() => setLoadPhase(2), 120);
    const t2 = window.setTimeout(() => setLoadPhase(3), 560);
    const t3 = window.setTimeout(() => setLoadPhase(4), 820);
    const t4 = window.setTimeout(() => setLoadPhase(5), 1080);
    const t5 = window.setTimeout(() => setIntroDone(true), 2100);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [reducedMotion]);

  const applyScrollStyles = useCallback(
    (p: number, bp: Breakpoint, reduced: boolean) => {
      const headingEl = headingWrapRef.current;
      const paraEl = paragraphRef.current;
      const ctaEl = ctaRef.current;
      const badgeEl = badgeRef.current;
      const dashEl = dashWrapRef.current;
      const frameEl = frameInnerRef.current;

      if (reduced) return;

      const maxScale =
        bp === 'mobile' ? 1.18 : bp === 'tablet' ? 1.2 : 1.38;
      const dashLift =
        bp === 'mobile' ? -72 : bp === 'tablet' ? -110 : -130;
      const headingLift = bp === 'mobile' ? -28 : -42;
      const paraLift = bp === 'mobile' ? -20 : -30;
      const ctaLift = bp === 'mobile' ? -22 : -32;
      const badgeLift = bp === 'mobile' ? -12 : -18;

      // Slow continuous curves — quint ease removes the “stepper” feel
      const zoom = easeInOutQuint(smoothstep(p));
      const lift = easeInOutQuint(p);

      const hScale = lerp(1, bp === 'mobile' ? 0.94 : 0.9, zoom);
      const hY = lerp(0, headingLift, lift);
      const hOp = 1 - easeInOutQuint(rangeProgress(p, 0.18, 0.78));

      if (headingEl) {
        headingEl.style.transform = `translate3d(0, ${hY.toFixed(2)}px, 0) scale(${hScale.toFixed(4)})`;
        headingEl.style.opacity = hOp.toFixed(3);
        headingEl.style.transformOrigin = 'center top';
        headingEl.style.willChange = 'transform, opacity';
      }

      const paraOp = 1 - easeInOutQuint(rangeProgress(p, 0.04, 0.48));
      const paraY = lerp(0, paraLift, lift);

      if (paraEl) {
        paraEl.style.opacity = paraOp.toFixed(3);
        paraEl.style.transform = `translate3d(0, ${paraY.toFixed(2)}px, 0)`;
        paraEl.style.pointerEvents = paraOp < 0.05 ? 'none' : 'auto';
        paraEl.style.willChange = 'transform, opacity';
      }

      const ctaOp = 1 - easeInOutQuint(rangeProgress(p, 0, 0.42));
      const ctaY = lerp(0, ctaLift, lift);

      if (ctaEl) {
        ctaEl.style.opacity = ctaOp.toFixed(3);
        ctaEl.style.transform = `translate3d(0, ${ctaY.toFixed(2)}px, 0)`;
        ctaEl.style.pointerEvents = ctaOp < 0.05 ? 'none' : 'auto';
        ctaEl.style.willChange = 'transform, opacity';
      }

      if (badgeEl) {
        const bOp = 1 - easeInOutQuint(rangeProgress(p, 0.02, 0.32));
        badgeEl.style.opacity = bOp.toFixed(3);
        badgeEl.style.transform = `translate3d(0, ${lerp(0, badgeLift, lift).toFixed(2)}px, 0)`;
      }

      const dScale = lerp(1, maxScale, zoom);
      const dY = lerp(0, dashLift, lift);
      const radius = lerp(18, bp === 'mobile' ? 10 : 8, zoom);

      if (dashEl) {
        dashEl.style.transformOrigin = 'center center';
        dashEl.style.transform = `translate3d(0, ${dY.toFixed(2)}px, 0) scale(${dScale.toFixed(4)})`;
        dashEl.style.opacity = '1';
        dashEl.style.filter = 'none';
        dashEl.style.willChange = 'transform';
      }
      if (frameEl) {
        frameEl.style.borderRadius = `${radius.toFixed(2)}px`;
        frameEl.style.boxShadow =
          '0 28px 64px -18px rgba(15,23,42,0.32), 0 10px 28px -10px rgba(79,70,229,0.2)';
        frameEl.style.willChange = 'border-radius';
      }
    },
    []
  );

  useEffect(() => {
    if (!introDone && !reducedMotion) return;

    let lastTime = performance.now();
    runningRef.current = true;

    const readTarget = () => {
      const track = trackRef.current;
      if (!track) return 0;
      if (reducedRef.current) return 0;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      return clamp01(-rect.top / scrollable);
    };

    targetProgressRef.current = readTarget();
    smoothProgressRef.current = targetProgressRef.current;

    const tick = (now: number) => {
      if (!runningRef.current) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      targetProgressRef.current = readTarget();

      // Slower scrub lag (~220–280ms) — creamier than direct scroll mapping
      const smoothing = 1 - Math.exp(-4.2 * dt);
      const prev = smoothProgressRef.current;
      const next = prev + (targetProgressRef.current - prev) * smoothing;
      smoothProgressRef.current = next;

      applyScrollStyles(
        next,
        breakpointRef.current,
        reducedRef.current
      );

      const delta = Math.abs(targetProgressRef.current - next);
      if (delta > 0.00012) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        // Soft settle — avoid hard snap
        smoothProgressRef.current = lerp(next, targetProgressRef.current, 0.35);
        applyScrollStyles(
          smoothProgressRef.current,
          breakpointRef.current,
          reducedRef.current
        );
        if (Math.abs(targetProgressRef.current - smoothProgressRef.current) > 0.00008) {
          rafRef.current = window.requestAnimationFrame(tick);
        } else {
          smoothProgressRef.current = targetProgressRef.current;
          applyScrollStyles(
            targetProgressRef.current,
            breakpointRef.current,
            reducedRef.current
          );
          rafRef.current = null;
        }
      }
    };

    const kick = () => {
      if (rafRef.current == null) {
        lastTime = performance.now();
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);

    return () => {
      runningRef.current = false;
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [applyScrollStyles, reducedMotion, introDone]);

  const isMobile = breakpoint === 'mobile';
  const pinEnabled = !reducedMotion;

  // Longer pin runway so zoom progresses more slowly with scroll
  const trackHeightClass = reducedMotion
    ? 'min-h-0'
    : isMobile
      ? 'h-[135vh]'
      : breakpoint === 'tablet'
        ? 'h-[140vh]'
        : 'h-[155vh]';

  const badgeVisible = loadPhase >= 1;
  const headingAnimate = loadPhase >= 2;
  const paraVisible = loadPhase >= 3;
  const ctaVisible = loadPhase >= 4;
  const dashVisible = loadPhase >= 5;

  return (
    <section
      ref={trackRef}
      className={cn('relative border-b border-slate-200/70', trackHeightClass)}
      aria-label="Hero"
    >
      <div
        className={cn(
          'relative flex flex-col overflow-hidden bg-white',
          pinEnabled ? 'sticky top-0 h-[100svh]' : 'relative min-h-[100svh]'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-[#F5F8FF] to-slate-50/80" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12),transparent_65%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] flex-col px-4 pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto w-full max-w-[680px] shrink-0 text-center">
            <div
              ref={badgeRef}
              className="mb-6 inline-flex rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium text-primary"
              style={{
                opacity: badgeVisible ? 1 : 0,
                transform: badgeVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 520ms ${EASE}, transform 520ms ${EASE}`,
              }}
            >
              Attendance & Payroll
            </div>

            <div ref={headingWrapRef} className="origin-top">
              <AnimatedHeading
                text={HEADING_TEXT}
                lines={HEADING_LINES}
                animate={headingAnimate}
                reducedMotion={reducedMotion}
                isMobile={isMobile}
              />
            </div>

            <p
              ref={paragraphRef}
              className="mx-auto mt-6 max-w-[620px] text-base leading-relaxed text-slate-500 sm:text-lg"
              style={
                introDone
                  ? undefined
                  : {
                      opacity: paraVisible ? 1 : 0,
                      transform: paraVisible ? 'translateY(0)' : 'translateY(16px)',
                      transition: `opacity 620ms ${EASE}, transform 620ms ${EASE}`,
                    }
              }
            >
              Clock in from web or mobile, set policies that fit your workplace, and keep attendance and payroll accurate—without spreadsheets or guesswork.
            </p>

            <div
              ref={ctaRef}
              className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div
                style={
                  introDone
                    ? undefined
                    : {
                        opacity: ctaVisible ? 1 : 0,
                        transform: ctaVisible ? 'translateY(0)' : 'translateY(12px)',
                        transition: `opacity 560ms ${EASE} 0ms, transform 560ms ${EASE} 0ms`,
                      }
                }
              >
                <Button
                  size="lg"
                  className="group h-12 w-full px-7 text-[15px] shadow-md shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
                  onClick={onBookDemo}
                >
                  Book a demo
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </div>
              <div
                style={
                  introDone
                    ? undefined
                    : {
                        opacity: ctaVisible ? 1 : 0,
                        transform: ctaVisible ? 'translateY(0)' : 'translateY(12px)',
                        transition: `opacity 560ms ${EASE} 80ms, transform 560ms ${EASE} 80ms`,
                      }
                }
              >
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-12 w-full border-slate-300 bg-white/80 px-7 text-[15px] text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-auto"
                >
                  <Link href="/login" className="inline-flex items-center gap-2">
                    View dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative mt-10 flex min-h-0 flex-1 items-start justify-center pb-6 sm:mt-12 lg:mt-14">
            <div
              ref={dashWrapRef}
              className="w-full origin-center"
              style={
                introDone
                  ? { transformStyle: 'preserve-3d', transformOrigin: 'center center' }
                  : {
                      opacity: dashVisible ? 1 : 0,
                      transform: dashVisible
                        ? 'translate3d(0, 0, 0) scale(1) rotateX(0deg)'
                        : 'translate3d(0, 45px, 0) scale(0.94) rotateX(3deg)',
                      transition: `opacity 1000ms ${EASE}, transform 1000ms ${EASE}`,
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center center',
                    }
              }
            >
              <HeroDashboardFrame ref={frameInnerRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
