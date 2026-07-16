'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';


const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const FEATURE_PILLS = ['Attendance', 'Payroll', 'Compliance'] as const;

const CORE_HR_LINKS = [
  { href: '/dashboard/employees', label: 'Employee Management' },
  { href: '/dashboard/departments', label: 'Departments' },
  { href: '/dashboard/profile', label: 'Employee Profiles' },
  { href: '/dashboard/help', label: 'Helpdesk' },
  { href: '/dashboard/reports', label: 'HR Analytics' },
] as const;

const PAYROLL_LINKS = [
  { href: '/dashboard/payroll', label: 'Payroll Processing' },
  { href: '/dashboard/salary-structures', label: 'Salary Structures' },
  { href: '/dashboard/my-salary', label: 'Payslips' },
] as const;

const ATTENDANCE_LINKS = [
  { href: '/dashboard/team-attendance', label: 'Attendance Tracking' },
  { href: '/dashboard/team-leaves', label: 'Leave Management' },
  { href: '/dashboard/leave-approvals', label: 'Leave Approvals' },
  { href: '/dashboard/manage-holidays', label: 'Manage Holidays' },
  { href: '/dashboard/reports', label: 'Reports' },
] as const;

const COMPANY_LINKS = [
  { href: '/', label: 'About Us' },
  { href: '#security', label: 'Security' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#customers', label: 'Customers' },
] as const;

const RESOURCE_LINKS = [
  { href: '/dashboard/help', label: 'Documentation' },
  { href: '/dashboard/help', label: 'Help Center' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/login', label: 'Login' },
] as const;

const linkClass =
  'inline-block text-[13.5px] text-white/65 transition-[opacity,transform,color] duration-200 ease-out hover:translate-x-[3px] hover:text-white hover:opacity-100 motion-reduce:hover:translate-x-0 sm:text-[14px]';

/**
 * Compact premium footer — existing routes/links preserved.
 */
export function LandingFooter({ onBookDemo }: { onBookDemo: () => void }) {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const playedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const node = footerRef.current;
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
      transition: `opacity ${landingDuration(duration)}ms ${EASE} ${landingDelay(delayMs)}ms, transform ${landingDuration(duration)}ms ${EASE} ${landingDelay(delayMs)}ms`,
    };
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden text-slate-300"
      style={{
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%), #020d2b',
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.16),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-10 md:px-6 md:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] lg:gap-12 xl:gap-14">
          {/* Left — brand (compact) */}
          <div style={enter(0, { y: 16, duration: 500 })}>
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo.png"
                alt="TrizenHR"
                width={28}
                height={28}
                className="brightness-0 invert"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[14px] font-semibold text-white">TrizenHR</span>
                <span className="text-[11px] text-white/40">by Trizen Ventures</span>
              </div>
            </div>

            <p className="mt-3.5 max-w-[260px] text-[13px] leading-[1.55] text-white/55">
              Attendance, payroll and compliance software built for modern organizations.
            </p>

            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {FEATURE_PILLS.map((pill) => (
                <li
                  key={pill}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/65"
                >
                  <Check className="h-2.5 w-2.5 text-blue-400" strokeWidth={3} aria-hidden />
                  {pill}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onBookDemo}
              className="group mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white transition-colors hover:text-blue-300"
            >
              Book a personalized demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right — balanced columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
            <FooterColumn title="Core HR" delay={80} enter={enter}>
              {CORE_HR_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Payroll" delay={140} enter={enter}>
              {PAYROLL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Attendance" delay={200} enter={enter}>
              {ATTENDANCE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Company" delay={260} enter={enter}>
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={onBookDemo} className={cn(linkClass, 'text-left')}>
                  Contact
                </button>
              </li>
            </FooterColumn>

            <FooterColumn title="Resources" delay={320} enter={enter}>
              {RESOURCE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>

        <div
          className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between"
          style={enter(380, { y: 10, duration: 400 })}
        >
          <span className="text-[12px] text-white/40">
            © {new Date().getFullYear()} Trizen Ventures.
          </span>
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/45"
            aria-label="Legal"
          >
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Terms
            </Link>
            <button
              type="button"
              onClick={onBookDemo}
              className="transition-colors hover:text-white"
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  delay,
  enter,
}: {
  title: string;
  children: ReactNode;
  delay: number;
  enter: (delayMs: number, opts?: { y?: number; duration?: number }) => CSSProperties;
}) {
  return (
    <div style={enter(delay, { y: 14, duration: 450 })}>
      <h4 className="mb-3 text-[13px] font-semibold text-white sm:text-[14px]">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}
