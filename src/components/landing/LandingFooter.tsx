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
  { href: '#contact', label: 'Contact' },
] as const;

const RESOURCE_LINKS = [
  { href: '/dashboard/help', label: 'Documentation' },
  { href: '/dashboard/help', label: 'Help Center' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/login', label: 'Login' },
] as const;

const PHONE_DISPLAY = '+91 86396 48822';
const PHONE_TEL = 'tel:+918639648822';
const WHATSAPP_HREF = 'https://wa.me/918639648822';
const SALES_EMAIL = 'sales@trizenhr.com';
const LINKEDIN_HREF = 'https://www.linkedin.com/company/trizenhr/';
const INSTAGRAM_HREF = 'https://www.instagram.com/trizenhr';

const linkClass =
  'inline-block text-[13.5px] text-white/65 transition-[opacity,transform,color] duration-200 ease-out hover:translate-x-[3px] hover:text-white hover:opacity-100 motion-reduce:hover:translate-x-0 sm:text-[14px]';

/**
 * Premium footer — restored link columns + clean contact bar.
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
      className="relative overflow-x-clip text-slate-300"
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

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-12 md:px-6 md:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] lg:gap-12 xl:gap-14">
          {/* Brand */}
          <div style={enter(0, { y: 16, duration: 500 })}>
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/logo.png"
                alt="TrizenHR"
                width={32}
                height={32}
                className="brightness-0 invert"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-semibold text-white">TrizenHR</span>
                <span className="text-[11px] text-white/40">by Trizen Ventures LLP</span>
              </div>
            </div>

            <p className="mt-4 max-w-[280px] text-[14px] leading-[1.6] text-white/55">
              Attendance, payroll, and compliance software built for modern organizations —
              clear roles, accurate records, and reports you can trust.
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {FEATURE_PILLS.map((pill) => (
                <li
                  key={pill}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/65"
                >
                  <Check className="h-2.5 w-2.5 text-blue-400" strokeWidth={3} aria-hidden />
                  {pill}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onBookDemo}
              className="group mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white transition-colors hover:text-blue-300"
            >
              Book a personalized demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
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
                  {item.href.startsWith('#') || item.href === '/' ? (
                    <a href={item.href} className={linkClass}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
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

        {/* Contact — single clean bar, not a card or tall list */}
        <div
          id="contact"
          className="mt-12 scroll-mt-24 border-t border-white/10 pt-7"
          style={enter(220, { y: 10, duration: 450 })}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/35">
                Contact
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                <a
                  href={`mailto:${SALES_EMAIL}`}
                  className="text-[14px] text-white/75 transition-colors hover:text-white"
                >
                  {SALES_EMAIL}
                </a>
                <span className="hidden h-3 w-px bg-white/15 sm:inline-block" aria-hidden />
                <a
                  href={PHONE_TEL}
                  className="text-[14px] text-white/75 transition-colors hover:text-white"
                >
                  {PHONE_DISPLAY}
                </a>
                <span className="hidden h-3 w-px bg-white/15 sm:inline-block" aria-hidden />
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-white/75 transition-colors hover:text-white"
                >
                  WhatsApp
                </a>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/45">
                Hyderabad, Telangana, India · Mon–Sat, 10:00 AM – 7:00 PM IST
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-5">
              <a
                href={LINKEDIN_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-white/60 transition-colors hover:text-white"
              >
                LinkedIn
              </a>
              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-white/60 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-7 flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"
          style={enter(300, { y: 8, duration: 400 })}
        >
          <span className="text-[12px] text-white/40">
            © {new Date().getFullYear()} Trizen Ventures LLP.
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
            <a href="#contact" className="transition-colors hover:text-white">
              Contact
            </a>
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
      <h4 className="mb-3.5 text-[13px] font-semibold text-white sm:text-[14px]">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}
