'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { Clock, IndianRupee, Users, Download, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** How attendance is maintained — from FeatureShowcase */
const ATTENDANCE_DETAILS = [
  'Web check-in / check-out',
  'Photo capture at check-in',
  'Regularization workflows',
  'Real-time sync',
] as const;

const GALLERY_FOCUSES = [
  'object-[12%_18%]',
  'object-[48%_20%]',
  'object-[30%_52%]',
  'object-[68%_46%]',
] as const;

/**
 * Core Capabilities — cleaner bento: short support cards,
 * compact attendance chips, folder-style dashboard gallery.
 */
export function CoreCapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
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
      LANDING_SCROLL_REVEAL
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!visible) {
      setGalleryOpen(false);
      return;
    }
    if (reducedMotion) {
      setGalleryOpen(true);
      return;
    }
    const timer = window.setTimeout(() => setGalleryOpen(true), landingDuration(720));
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion]);

  const enter = (
    delayMs: number,
    opts: { y?: number; x?: number; scale?: number; duration?: number } = {}
  ): CSSProperties => {
    const { y = 0, x = 0, scale = 1, duration = 550 } = opts;
    const delay = landingDelay(delayMs);
    const dur = landingDuration(duration);
    if (reducedMotion) {
      return {
        opacity: visible ? 1 : 0,
        transition: `opacity 280ms ${EASE}`,
      };
    }
    const from: string[] = [];
    if (x) from.push(`translateX(${x}px)`);
    if (y) from.push(`translateY(${y}px)`);
    if (scale !== 1) from.push(`scale(${scale})`);
    return {
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translateX(0) translateY(0) scale(1)'
        : from.join(' ') || undefined,
      transition: `opacity ${dur}ms ${EASE} ${delay}ms, transform ${dur}ms ${EASE} ${delay}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-x-hidden border-b border-slate-200/70 bg-white"
      aria-labelledby="core-capabilities-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(79,70,229,0.045),transparent_48%),linear-gradient(180deg,#FAFBFF_0%,#FFFFFF_42%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="max-w-[700px]">
          <div
            className="mb-3.5 inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-primary"
            style={enter(0, { y: 10, duration: 450 })}
          >
            Core Capabilities
          </div>

          <h2
            id="core-capabilities-heading"
            className="text-[32px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[38px] lg:text-[44px] lg:leading-[1.12]"
          >
            <span className="block" style={enter(60, { y: 24, duration: 650 })}>
              Everything HR teams need to run
            </span>
            <span className="block" style={enter(120, { y: 24, duration: 650 })}>
              attendance and payroll smoothly
            </span>
          </h2>

          <p
            className="mt-4 max-w-[620px] text-[16px] leading-[1.65] text-slate-500 sm:text-[17px]"
            style={enter(200, { y: 14, duration: 500 })}
          >
            Essential features for managing workforce attendance across your organization.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 pb-8 md:mt-12 md:grid-cols-2 md:gap-3.5 md:pb-10 lg:mt-14 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-[auto_auto_auto] lg:gap-4 lg:pb-12">
          <article
            className={cn(
              'group relative overflow-hidden rounded-[18px] border border-slate-200/80 sm:overflow-visible',
              'bg-gradient-to-br from-[#F5F3FF] to-white',
              'px-5 pb-7 pt-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
              'min-h-[340px] sm:min-h-0',
              'transition-[box-shadow,border-color] duration-300 ease-out',
              'hover:border-violet-300/70 hover:shadow-[0_12px_28px_-16px_rgba(124,58,237,0.25)]',
              'md:col-span-2 md:p-5',
              'lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:min-h-0 lg:items-center lg:p-6',
              visible && !reducedMotion && 'bento-deco-active'
            )}
            style={enter(280, { y: 28, scale: 0.98, duration: 700 })}
          >
            <div className="relative z-10 flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <CapabilityContent
                icon={Users}
                iconBg="bg-violet-500"
                title="Role-based Dashboards"
                description="Employees, managers, HR, and admins see exactly what they need."
                className="min-w-0 flex-1 sm:max-w-[46%] lg:max-w-[42%]"
                compact
              />
              <FolderGallery expanded={galleryOpen} reducedMotion={reducedMotion} />
            </div>
          </article>

          <article
            className={cn(
              'group relative overflow-hidden rounded-[16px] border border-slate-200/80',
              'bg-gradient-to-br from-[#ECFDF5] to-white',
              'p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5',
              'transition-[box-shadow,border-color] duration-300 ease-out',
              'hover:border-emerald-300/70 hover:shadow-[0_12px_28px_-16px_rgba(16,185,129,0.25)]',
              'md:col-span-1',
              'lg:col-start-2 lg:row-start-1',
              visible && !reducedMotion && 'bento-deco-active'
            )}
            style={enter(380, { x: 20, y: 16, scale: 0.98, duration: 650 })}
          >
            <span
              className="material-symbols-outlined bento-watermark pointer-events-none absolute -bottom-6 -right-4 text-emerald-600/[0.09] transition-transform duration-300 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] sm:text-[9rem]"
              aria-hidden
            >
              currency_rupee
            </span>
            <CapabilityContent
              icon={IndianRupee}
              iconBg="bg-emerald-500"
              title="Automated Payroll"
              description="Salary processing, statutory components, and payslips in a few clicks."
              compact
            />
          </article>

          <article
            className={cn(
              'group relative overflow-hidden rounded-[18px] border border-slate-200/80',
              'bg-gradient-to-br from-[#F0F5FF] to-white',
              'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
              'transition-[box-shadow,border-color] duration-300 ease-out',
              'hover:border-blue-300/70 hover:shadow-[0_12px_28px_-16px_rgba(37,99,235,0.28)]',
              'md:col-span-2 md:row-start-3',
              'lg:col-span-2 lg:col-start-1 lg:row-start-3',
              'p-5 lg:px-6 lg:py-5',
              visible && !reducedMotion && 'bento-deco-active'
            )}
            style={enter(560, { y: 24, duration: 680 })}
          >
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <CapabilityContent
                icon={Clock}
                iconBg="bg-blue-500"
                title="Smart Attendance"
                description="Web and mobile attendance with clear rules and real-time visibility."
                className="min-w-0 sm:max-w-[360px]"
                compact
              />
              <div className="flex flex-wrap gap-2 sm:max-w-[480px] sm:justify-end">
                {ATTENDANCE_DETAILS.map((text, i) => (
                  <span
                    key={text}
                    className="inline-flex items-center rounded-full border border-blue-200/60 bg-white/80 px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                    style={enter(640 + i * 70, { y: 10, duration: 420 })}
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article
            className={cn(
              'group relative overflow-hidden rounded-[16px] border border-slate-200/80',
              'bg-gradient-to-br from-[#FFF7ED] to-white',
              'p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5',
              'transition-[box-shadow,border-color] duration-300 ease-out',
              'hover:border-orange-300/70 hover:shadow-[0_12px_28px_-16px_rgba(249,115,22,0.22)]',
              'md:col-start-2 md:row-start-2',
              'lg:col-start-2 lg:row-start-2',
              visible && !reducedMotion && 'bento-deco-active'
            )}
            style={enter(460, { x: 20, y: 16, scale: 0.98, duration: 650 })}
          >
            <span
              className="material-symbols-outlined bento-watermark pointer-events-none absolute -bottom-5 -right-3 text-orange-600/[0.09] transition-transform duration-300 group-hover:translate-x-[-3px] group-hover:translate-y-[-3px] sm:text-[8.5rem]"
              aria-hidden
            >
              download
            </span>
            <CapabilityContent
              icon={Download}
              iconBg="bg-amber-500"
              title="Reports & Compliance"
              description="Accurate reports and exports designed for audits and decision-making."
              compact
            />
          </article>
        </div>
      </div>
    </section>
  );
}


function CapabilityContent({
  icon: Icon,
  iconBg,
  title,
  description,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('relative z-10', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-[12px] shadow-[0_6px_14px_-6px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:-translate-y-0.5',
            compact ? 'h-10 w-10' : 'h-11 w-11 rounded-[13px]',
            iconBg
          )}
        >
          <Icon
            className={cn('text-white', compact ? 'h-[18px] w-[18px]' : 'h-5 w-5')}
            aria-hidden
          />
        </div>
        <h3
          className={cn(
            'font-semibold tracking-tight text-slate-900',
            compact ? 'text-[17px]' : 'text-[18px] lg:text-[19px]'
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          'mt-2.5 leading-[1.55] text-slate-500',
          compact
            ? 'max-w-[360px] text-[13px] sm:pl-[52px]'
            : 'max-w-[400px] text-[14px] sm:pl-[56px] lg:text-[15px]'
        )}
      >
        {description}
      </p>
    </div>
  );
}

/**
 * Starts as a single stacked frame, then fans out to four on section view.
 * Sits beside the card copy (side-by-side); may spill past the card edge.
 */
function FolderGallery({
  expanded,
  reducedMotion,
}: {
  expanded: boolean;
  reducedMotion: boolean;
}) {
  const open = expanded || reducedMotion;

  return (
    <div
      className="relative mx-auto h-[168px] w-full max-w-[min(100%,340px)] shrink-0 overflow-hidden sm:mx-0 sm:h-[128px] sm:w-[52%] sm:max-w-[300px] sm:overflow-visible lg:-mr-8 lg:h-[150px] lg:w-[55%] lg:max-w-[340px]"
      aria-hidden
    >
      {GALLERY_FOCUSES.map((focus, i) => {
        const fromRight = open ? (GALLERY_FOCUSES.length - 1 - i) * 22 : 0;
        const rotate = open ? (i - 1.5) * 1.05 : 0;
        const delayMs = reducedMotion ? 0 : i * 85;

        return (
          <div
            key={i}
            className="absolute bottom-0 top-0 my-auto h-fit w-[86%] max-w-[300px] sm:w-[78%] sm:max-w-[240px]"
            style={{
              right: fromRight,
              zIndex: i + 1,
              transition: reducedMotion
                ? 'none'
                : `right 820ms ${EASE} ${delayMs}ms`,
            }}
          >
            <div
              className="overflow-hidden rounded-[12px] border border-violet-200/80 bg-white shadow-[0_14px_32px_-12px_rgba(91,33,182,0.45)] sm:rounded-[12px]"
              style={{
                transform: `rotate(${rotate}deg)`,
                transition: reducedMotion
                  ? 'none'
                  : `transform 820ms ${EASE} ${delayMs}ms`,
              }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src="/image.png"
                  alt=""
                  fill
                  sizes="(max-width: 639px) 300px, 240px"
                  className={cn('object-cover', focus)}
                  priority={i === GALLERY_FOCUSES.length - 1}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
