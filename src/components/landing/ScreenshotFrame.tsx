'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

interface ScreenshotFrameProps {
  children: ReactNode;
  className?: string;
  frameClassName?: string;
  glowClassName?: string;
  showChrome?: boolean;
  perspective?: boolean;
  perspectiveFrom?: 'left' | 'right' | 'center';
  scrollTilt?: boolean;
}

/**
 * Polished browser/app frame for product screenshots.
 * Optional subtle perspective entrance and scroll-based rotateX (desktop only).
 */
export function ScreenshotFrame({
  children,
  className,
  frameClassName,
  glowClassName,
  showChrome = true,
  perspective = false,
  perspectiveFrom = 'center',
  scrollTilt = false,
}: ScreenshotFrameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [entered, setEntered] = useState(!perspective);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (prefersReduced || isMobile) {
      setEntered(true);
      setStyle({ transform: 'none' });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);

    if (!scrollTilt) {
      return () => observer.disconnect();
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = Math.min(
          1,
          Math.max(0, 1 - rect.top / (vh * 0.85))
        );
        const rotateX = 4.5 * (1 - progress);
        const translateY = 12 * (1 - progress);
        setStyle({
          transform: `perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}px)`,
        });
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollTilt]);

  const enterClass =
    perspectiveFrom === 'left'
      ? 'shot-enter-left'
      : perspectiveFrom === 'right'
        ? 'shot-enter-right'
        : 'shot-enter-center';

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative',
        perspective && enterClass,
        entered && 'is-visible',
        className
      )}
      style={scrollTilt ? style : undefined}
    >
      <div
        className={cn(
          'pointer-events-none absolute -inset-6 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.14),transparent_70%)] blur-2xl',
          glowClassName
        )}
        aria-hidden
      />
      <div
        className={cn(
          'relative overflow-hidden rounded-[16px] border border-slate-200/90 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28),0_8px_24px_-12px_rgba(79,70,229,0.18)]',
          frameClassName
        )}
      >
        {showChrome ? (
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/50" />
            <div className="ml-3 h-5 flex-1 rounded-md bg-white/80 ring-1 ring-slate-200/70" />
          </div>
        ) : null}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
