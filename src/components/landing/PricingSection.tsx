'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const SHARED_BENEFITS = [
  'Role-based access',
  'Cloud hosting',
  'Regular updates',
] as const;

const PLANS = [
  {
    name: 'Starter',
    description: 'Up to 50 employees',
    features: 'Core attendance + payroll',
    price: '₹1',
    period: '/ user / day',
    cta: 'Book demo',
    highlighted: false,
  },
  {
    name: 'Growth',
    description: 'Up to 200 employees',
    features: 'All features + basic integrations',
    price: '₹2',
    period: '/ user / day',
    cta: 'Book demo',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: '200+ employees',
    features: 'Custom workflows, SLAs, support',
    price: 'Contact sales',
    period: '',
    cta: 'Contact sales',
    highlighted: false,
  },
] as const;

/**
 * Pricing section — layout, hierarchy, and motion only.
 * All plan names, prices, ranges, descriptions, and CTAs unchanged.
 */
export function PricingSection({ onBookDemo }: { onBookDemo: () => void }) {
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
    const { y = 0, scale = 1, duration = 500 } = opts;

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
      id="pricing"
      className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-[#F7F9FC] via-white to-white"
      aria-labelledby={`${baseId}-heading`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12),transparent_68%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-[120px]">
        {/* Intro */}
        <div className="mx-auto max-w-[720px] text-center">
          <h2
            id={`${baseId}-heading`}
            className="mx-auto max-w-[700px] text-[34px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[42px] lg:text-[50px] lg:leading-[1.1]"
            style={enter(0, { y: 26, duration: 600 })}
          >
            Simple pricing that scales with your team
          </h2>

          <p
            className="mx-auto mt-5 max-w-[720px] text-[16px] leading-[1.6] text-slate-500 sm:text-[17px] lg:text-[18px]"
            style={enter(100, { y: 14, duration: 450 })}
          >
            All plans include role-based access, cloud hosting, and regular updates.
          </p>

          <ul
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 sm:gap-x-7"
            style={enter(180, { y: 12, duration: 450 })}
            aria-label="Included in all plans"
          >
            {SHARED_BENEFITS.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 sm:text-[14px]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Cards */}
        <div className="mt-14 grid items-stretch gap-4 sm:mt-16 sm:gap-5 md:mt-[60px] md:grid-cols-3 md:gap-[22px]">
          {PLANS.map((plan, index) => {
            const isGrowth = plan.highlighted;
            const mobileOrder =
              plan.name === 'Growth'
                ? 'order-1 md:order-2'
                : plan.name === 'Starter'
                  ? 'order-2 md:order-1'
                  : 'order-3 md:order-3';

            return (
              <div
                key={plan.name}
                className={cn('flex h-full', mobileOrder)}
                style={enter(260 + index * 120, {
                  y: 28,
                  scale: reducedMotion ? 1 : 0.98,
                  duration: 600,
                })}
              >
                <article
                  className={cn(
                    'group relative flex w-full flex-col rounded-[22px] border p-[30px] sm:p-8',
                    'transition-[transform,box-shadow,border-color] duration-[240ms] ease-out',
                    isGrowth
                      ? cn(
                          'z-10 border-primary/55 bg-gradient-to-b from-primary/[0.06] via-white to-white',
                          'shadow-[0_20px_48px_-20px_rgba(79,70,229,0.38)]',
                          'md:-translate-y-2.5 md:hover:-translate-y-3.5',
                          'hover:border-primary/70 hover:shadow-[0_28px_56px_-22px_rgba(79,70,229,0.42)]',
                          'motion-reduce:md:translate-y-0 motion-reduce:md:hover:translate-y-0'
                        )
                      : cn(
                          'border-slate-200/90 bg-white',
                          'shadow-[0_8px_28px_-18px_rgba(15,23,42,0.16)]',
                          'hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.2)]',
                          'motion-reduce:hover:translate-y-0'
                        )
                  )}
                >
                  {isGrowth ? (
                    <div
                      className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2"
                      style={
                        reducedMotion
                          ? {
                              opacity: visible ? 1 : 0,
                              transition: `opacity 280ms ${EASE}`,
                            }
                          : {
                              opacity: visible ? 1 : 0,
                              transform: visible ? 'scale(1)' : 'scale(0.9)',
                              transition: `opacity 300ms ${EASE} ${380 + index * 120}ms, transform 300ms ${EASE} ${380 + index * 120}ms`,
                            }
                      }
                    >
                      <span className="inline-flex h-[29px] items-center rounded-full bg-primary px-3.5 text-[12px] font-semibold tracking-tight text-white shadow-[0_6px_16px_-4px_rgba(79,70,229,0.55)]">
                        Most popular
                      </span>
                    </div>
                  ) : null}

                  <div className={cn('flex flex-1 flex-col', isGrowth && 'pt-2')}>
                    <h3 className="text-[22px] font-bold tracking-tight text-slate-900 sm:text-[23px]">
                      {plan.name}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-slate-500 sm:text-[16px]">
                      {plan.description}
                    </p>
                    <p className="mt-[18px] max-w-[260px] text-[15px] leading-[1.6] text-slate-500 sm:text-[16px]">
                      {plan.features}
                    </p>

                    <div className="mt-11 flex min-h-[44px] items-baseline gap-1.5">
                      {plan.period ? (
                        <>
                          <span className="text-[38px] font-bold leading-none tracking-tight text-slate-900 sm:text-[40px]">
                            {plan.price}
                          </span>
                          <span className="text-[15px] font-medium text-slate-500 sm:text-[16px]">
                            {plan.period}
                          </span>
                        </>
                      ) : (
                        <span className="text-[30px] font-bold leading-none tracking-tight text-slate-900 sm:text-[32px]">
                          {plan.price}
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-auto pt-8"
                      style={enter(420 + index * 120, { y: 8, duration: 400 })}
                    >
                      <Button
                        type="button"
                        className={cn(
                          'h-12 w-full rounded-[10px] text-[15px] font-semibold transition-all duration-[240ms] ease-out',
                          'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                          isGrowth
                            ? cn(
                                'bg-primary text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.55)]',
                                'hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_28px_-8px_rgba(79,70,229,0.6)]',
                                'active:translate-y-0',
                                'motion-reduce:hover:translate-y-0'
                              )
                            : cn(
                                'border border-slate-200 bg-white text-slate-900 shadow-none',
                                'hover:-translate-y-px hover:border-primary/40 hover:bg-primary/[0.04]',
                                'hover:shadow-[0_8px_20px_-10px_rgba(79,70,229,0.25)]',
                                'active:translate-y-0',
                                'motion-reduce:hover:translate-y-0'
                              )
                        )}
                        variant={isGrowth ? 'default' : 'outline'}
                        onClick={onBookDemo}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
