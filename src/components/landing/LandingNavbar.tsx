'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingNavbarProps {
  onBookDemo: () => void;
}

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#security', label: 'Security' },
  { href: '#customers', label: 'Customers' },
] as const;

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Premium SaaS landing navbar — layout, sticky scroll, load animation, mobile menu.
 * Content, routes, and button actions are unchanged.
 */
export function LandingNavbar({ onBookDemo }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [heroDim, setHeroDim] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMq = () => setReducedMotion(mq.matches);
    applyMq();
    mq.addEventListener('change', applyMq);

    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHeroDim(y > 80 && y < window.innerHeight * 1.2);

      // Highlight section in view
      let current = '';
      for (const link of NAV_LINKS) {
        const id = link.href.slice(1);
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 120) current = link.href;
      }
      if (current) setActiveHash(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Trigger enter animation after paint
    const enterId = window.requestAnimationFrame(() => setEntered(true));

    return () => {
      mq.removeEventListener('change', applyMq);
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(enterId);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        'relative sticky top-0 z-50 transition-[height,background-color,border-color,box-shadow,backdrop-filter] duration-300',
        scrolled
          ? 'h-16 border-b border-black/5 bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[10px]'
          : 'h-[72px] border-b border-transparent bg-white/95'
      )}
      style={
        reducedMotion
          ? { opacity: entered ? (heroDim && scrolled ? 0.96 : 1) : 0 }
          : {
              opacity: entered ? (heroDim && scrolled ? 0.96 : 1) : 0,
              transform: entered ? 'translateY(0)' : 'translateY(-12px)',
              transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}, height 300ms ease, background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease, backdrop-filter 300ms ease`,
            }
      }
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center px-4 md:px-6 lg:px-8">
        {/* Left — logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-1.5 rounded-md transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          style={
            reducedMotion
              ? {
                  opacity: entered ? 1 : 0,
                  transition: `opacity 300ms ${EASE}`,
                }
              : {
                  opacity: entered ? 1 : 0,
                  transform: entered ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `opacity 520ms ${EASE} 80ms, transform 520ms ${EASE} 80ms`,
                }
          }
        >
          <Image
            src="/assets/logo.png"
            alt="TrizenHR"
            width={52}
            height={52}
            className="h-12 w-12 rounded object-contain sm:h-[52px] sm:w-[52px]"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-[22px] font-bold tracking-tight text-slate-900 sm:text-[26px] lg:text-[30px]">
              TrizenHR
            </span>
            <span className="mt-0.5 text-[11px] tracking-[0.5px] text-slate-900/65">
              by Trizen Ventures
            </span>
          </div>
        </Link>

        {/* Center — desktop nav */}
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link, i) => {
            const active = activeHash === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group relative py-1 text-[15px] font-medium text-slate-800 transition-[color,transform] duration-200 hover:-translate-y-px hover:text-primary focus-visible:outline-none focus-visible:text-primary',
                  active && 'text-primary'
                )}
                style={
                  reducedMotion
                    ? {
                        opacity: entered ? 1 : 0,
                        transition: `opacity 300ms ${EASE}`,
                      }
                    : {
                        opacity: entered ? 1 : 0,
                        transform: entered ? 'translateY(0)' : 'translateY(-8px)',
                        transition: `opacity 520ms ${EASE} ${180 + i * 75}ms, transform 520ms ${EASE} ${180 + i * 75}ms`,
                      }
                }
              >
                {link.label}
                <span
                  className={cn(
                    'pointer-events-none absolute bottom-0 left-1/2 h-[1.5px] w-full -translate-x-1/2 scale-x-0 rounded-full bg-primary transition-transform duration-[250ms] ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100',
                    active && 'scale-x-100'
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        {/* Right — actions */}
        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/login"
            className="hidden h-11 items-center justify-center rounded-[10px] border border-black/[0.08] bg-white px-5 text-[14px] font-medium text-slate-800 transition-all duration-[250ms] hover:-translate-y-px hover:border-primary hover:bg-primary/[0.06] hover:shadow-[0_4px_14px_rgba(79,70,229,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:inline-flex"
            style={
              reducedMotion
                ? {
                    opacity: entered ? 1 : 0,
                    transition: `opacity 300ms ${EASE}`,
                  }
                : {
                    opacity: entered ? 1 : 0,
                    transform: entered ? 'translateX(0)' : 'translateX(10px)',
                    transition: `opacity 520ms ${EASE} 520ms, transform 520ms ${EASE} 520ms`,
                  }
            }
          >
            Login
          </Link>

          <button
            type="button"
            onClick={onBookDemo}
            className="hidden h-11 items-center justify-center rounded-[10px] bg-primary px-[22px] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_22px_rgba(79,70,229,0.35)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 lg:inline-flex"
            style={
              reducedMotion
                ? {
                    opacity: entered ? 1 : 0,
                    transition: `opacity 300ms ${EASE}`,
                  }
                : {
                    opacity: entered ? 1 : 0,
                    transform: entered ? 'translateX(0)' : 'translateX(14px)',
                    transition: `opacity 520ms ${EASE} 600ms, transform 520ms ${EASE} 600ms`,
                  }
            }
          >
            Book a demo
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center bg-transparent text-slate-800 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="landing-mobile-menu"
        className={cn(
          'absolute inset-x-0 top-full border-b border-black/5 bg-white/95 backdrop-blur-[10px] lg:hidden',
          mobileOpen
            ? 'pointer-events-auto visible opacity-100 translate-y-0'
            : 'pointer-events-none invisible opacity-0 -translate-y-2.5'
        )}
        style={{
          transition: reducedMotion
            ? 'opacity 200ms ease, visibility 200ms ease'
            : `opacity 250ms ${EASE}, transform 250ms ${EASE}, visibility 250ms ${EASE}`,
        }}
        aria-hidden={!mobileOpen}
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-1 px-4 py-4 md:px-6">
          {NAV_LINKS.map((link) => {
            const active = activeHash === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className={cn(
                  'rounded-[10px] px-3 py-3 text-[15px] font-medium text-slate-800 transition-colors hover:bg-primary/[0.06] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  active && 'bg-primary/[0.06] text-primary'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 flex flex-col gap-2 border-t border-black/5 pt-3">
            <Link
              href="/login"
              onClick={closeMobile}
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-black/[0.08] bg-white px-5 text-[14px] font-medium text-slate-800 transition-all duration-[250ms] hover:border-primary hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => {
                closeMobile();
                onBookDemo();
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-primary px-[22px] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-[250ms] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Book a demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
