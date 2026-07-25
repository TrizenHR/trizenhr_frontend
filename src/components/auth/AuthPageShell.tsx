'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Clock3, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const HIGHLIGHTS = [
  { icon: Clock3, text: 'Real-time attendance from web and mobile' },
  { icon: ShieldCheck, text: 'Role-based access with audit-ready records' },
  { icon: BarChart3, text: 'Payroll-ready reports without spreadsheets' },
] as const;

interface AuthPageShellProps {
  /** Small eyebrow label above the title. */
  eyebrow?: string;
  /** Form panel heading. */
  title: string;
  /** Supporting description under the title. */
  description: string;
  /** Form content. */
  children: ReactNode;
  /** Optional footer node rendered under the form (links, etc.). */
  footer?: ReactNode;
}

/**
 * Shared premium split-screen layout for authentication pages.
 * Brand panel on desktop, focused form column that stacks cleanly on mobile.
 * Visual only — pages own all form state and API behavior.
 */
export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  const [entered, setEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => {
      mq.removeEventListener('change', apply);
      window.cancelAnimationFrame(id);
    };
  }, []);

  const enter = (delay: number) =>
    reducedMotion
      ? { opacity: entered ? 1 : 0, transition: `opacity 300ms ${EASE}` }
      : {
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 600ms ${EASE} ${delay}ms, transform 600ms ${EASE} ${delay}ms`,
        };

  return (
    <div className="flex min-h-[100svh] w-full overflow-x-hidden bg-white">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#020d2b] px-12 py-12 text-white lg:flex xl:w-[42%] xl:px-14">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.28),transparent_70%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
          aria-hidden
        />

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={enter(0)}
        >
          <Image
            src="/assets/logo-white.png"
            alt="TrizenHR"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-contain"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">TrizenHR</span>
        </Link>

        <div className="relative z-10 max-w-md" style={enter(90)}>
          <h2 className="text-[32px] font-bold leading-[1.15] tracking-[-0.02em] xl:text-[38px]">
            Attendance and payroll,
            <span className="block text-blue-300/90">in one place.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            The workforce platform built for growing teams — accurate records, clear roles,
            and reports your finance team will trust.
          </p>

          <ul className="mt-9 space-y-3.5">
            {HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-[14px] text-white/80"
                  style={enter(160 + i * 80)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-blue-300" aria-hidden />
                  </span>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 text-[13px] text-white/40" style={enter(360)}>
          © {new Date().getFullYear()} Trizen Ventures. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-[520px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_70%)] lg:hidden"
          aria-hidden
        />
        <div className="relative w-full max-w-[404px]">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden" style={enter(0)}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Image
                src="/assets/logo.png"
                alt="TrizenHR"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-contain"
                priority
              />
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                TrizenHR
              </span>
            </Link>
          </div>

          <div style={enter(80)}>
            {eyebrow ? (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-[12px] font-medium text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-slate-900 sm:text-[28px]">
              {title}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{description}</p>
          </div>

          <div className="mt-8" style={enter(140)}>
            {children}
          </div>

          {footer ? (
            <div className="mt-8" style={enter(220)}>
              {footer}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

interface AuthFieldProps {
  className?: string;
  children: ReactNode;
}

/** Consistent field spacing wrapper for auth forms. */
export function AuthField({ className, children }: AuthFieldProps) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}
