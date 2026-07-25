'use client';

import Image from 'next/image';
import { forwardRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface HeroDashboardFrameProps {
  className?: string;
  style?: CSSProperties;
  glowStyle?: CSSProperties;
}

/**
 * Polished application frame for the existing hero dashboard screenshot.
 * Ref attaches to the bordered frame (border-radius / shadow targets).
 */
export const HeroDashboardFrame = forwardRef<HTMLDivElement, HeroDashboardFrameProps>(
  function HeroDashboardFrame({ className, style, glowStyle }, ref) {
    return (
      <div
        className={cn('relative mx-auto w-full max-w-5xl', className)}
        style={{ perspective: '1200px', ...style }}
      >
        <div
          className="pointer-events-none absolute -inset-8 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.16),transparent_68%)] blur-2xl"
          style={glowStyle}
          aria-hidden
        />
        <div
          ref={ref}
          className="relative overflow-hidden border border-slate-200/90 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28),0_8px_24px_-12px_rgba(79,70,229,0.18)]"
          style={{
            borderRadius: 18,
            transformOrigin: 'center top',
            willChange: 'transform, opacity, filter, border-radius',
          }}
        >
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300/50" />
            <div className="ml-3 h-5 flex-1 rounded-md bg-white/80 ring-1 ring-slate-200/70" />
          </div>
          <div className="relative overflow-hidden bg-white">
            <Image
              src="/image.png"
              alt="Attendance dashboard preview"
              width={1200}
              height={700}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    );
  }
);
