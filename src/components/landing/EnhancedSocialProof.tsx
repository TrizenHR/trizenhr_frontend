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
  Clock,
  FileCheck,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const TRUST_ITEMS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: 'Secure infrastructure',
    description:
      'Designed with compliance and security in mind so your workforce data stays accurate and protected.',
    icon: Shield,
  },
  {
    title: 'Real-time attendance',
    description:
      'Employees check in via web with photo capture. Managers and HR get real-time attendance visibility.',
    icon: Clock,
  },
  {
    title: 'Compliance-ready reports',
    description:
      'Export audit-ready reports for compliance and decision-making as your organization grows.',
    icon: FileCheck,
  },
  {
    title: 'Role-based access',
    description:
      'Each user accesses features and data appropriate to their responsibilities.',
    icon: Lock,
  },
];

/**
 * Product trust section — honest capabilities, no fake logos/testimonials.
 */
export function EnhancedSocialProof() {
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
    opts: { y?: number; duration?: number } = {}
  ): CSSProperties => {
    const { y = 0, duration = 500 } = opts;
    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transition: `opacity 280ms ${EASE}`,
      };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity ${duration}ms ${EASE} ${delayMs}ms, transform ${duration}ms ${EASE} ${delayMs}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="customers"
      className="relative overflow-hidden border-b border-slate-200/70 bg-white"
      aria-labelledby={`${baseId}-heading`}
    >
      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[620px] text-center">
          <h2
            id={`${baseId}-heading`}
            className="text-[32px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[38px] lg:text-[42px] lg:leading-[1.12]"
            style={enter(0, { y: 30, duration: 600 })}
          >
            Built for modern organizations
          </h2>
          <p
            className="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.65] text-slate-500 sm:text-[16px]"
            style={enter(80, { y: 16, duration: 500 })}
          >
            Everything you need to manage attendance, payroll, approvals and compliance from one
            place.
          </p>
        </div>

        {/* One surface, four columns — no stacked card boxes */}
        <div
          className={cn(
            'mt-12 overflow-hidden rounded-[22px] border border-slate-200/80 bg-[#F8FAFC]',
            'sm:mt-14'
          )}
          style={enter(140, { y: 24, duration: 600 })}
        >
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className={cn(
                    'group relative p-6 sm:p-7 lg:p-8',
                    i < TRUST_ITEMS.length - 1 && 'border-b border-slate-200/80',
                    (i === 0 || i === 1) && 'sm:border-b sm:border-slate-200/80',
                    (i === 0 || i === 2) && 'sm:border-r sm:border-slate-200/80',
                    'lg:border-b-0',
                    i < TRUST_ITEMS.length - 1 && 'lg:border-r lg:border-slate-200/80'
                  )}
                  style={enter(200 + i * 90, { y: 18, duration: 500 })}
                >
                  <div
                    className={cn(
                      'transition-transform duration-[240ms] ease-out',
                      'group-hover:-translate-y-0.5',
                      'motion-reduce:group-hover:translate-y-0'
                    )}
                  >
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-primary shadow-sm ring-1 ring-slate-200/80">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 sm:text-[16px]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.55] text-slate-500 sm:text-[14px]">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
