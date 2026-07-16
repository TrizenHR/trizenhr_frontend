'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Clock,
  Shield,
  Calendar,
  FileCheck,
  Users,
  BarChart3,
  Check,
  Camera,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANDING_SCROLL_REVEAL,
  landingDelay,
  landingDuration,
} from '@/components/landing/scrollReveal';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Premium feature showcase — Smart Attendance + Leave Management.
 * Marketing copy unchanged; layout, visuals, and motion only.
 */
export function FeatureShowcase() {
  return (
    <section className="border-b border-slate-200/70 bg-white py-16 md:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6 lg:px-8">
        <div className="space-y-24 md:space-y-32">
          <SmartAttendanceBlock />
          <LeaveManagementBlock />
        </div>
      </div>
    </section>
  );
}

function SmartAttendanceBlock() {
  const sectionRef = useRef<HTMLDivElement>(null);
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

  const motion = (
    delayMs: number,
    kind: 'heading' | 'body' | 'pill' | 'dash' | 'float' = 'body'
  ): CSSProperties => {
    if (reducedMotion) {
      return { opacity: visible ? 1 : 0, transition: `opacity 280ms ${EASE}` };
    }
    const delay = `${landingDelay(delayMs)}ms`;
    if (kind === 'heading') {
      return {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity ${landingDuration(700)}ms ${EASE} ${delay}, transform ${landingDuration(700)}ms ${EASE} ${delay}`,
      };
    }
    if (kind === 'dash') {
      return {
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1) rotateY(0deg)'
          : 'translateY(40px) scale(0.95) rotateY(8deg)',
        transformOrigin: 'center right',
        transition: `opacity ${landingDuration(800)}ms ${EASE} ${delay}, transform ${landingDuration(800)}ms ${EASE} ${delay}`,
      };
    }
    if (kind === 'float') {
      return {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity ${landingDuration(650)}ms ${EASE} ${delay}, transform ${landingDuration(650)}ms ${EASE} ${delay}`,
      };
    }
    if (kind === 'pill') {
      return {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity ${landingDuration(520)}ms ${EASE} ${delay}, transform ${landingDuration(520)}ms ${EASE} ${delay}`,
      };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity ${landingDuration(600)}ms ${EASE} ${delay}, transform ${landingDuration(600)}ms ${EASE} ${delay}`,
    };
  };

  const pills = [
    { icon: Clock, text: 'Web check-in / check-out' },
    { icon: Shield, text: 'Photo capture at check-in' },
    { icon: FileCheck, text: 'Regularization workflows' },
    { icon: BarChart3, text: 'Real-time sync' },
  ];

  return (
    <div
      ref={sectionRef}
      className="grid items-start gap-10 lg:grid-cols-[2fr_3fr] lg:gap-12 xl:gap-16"
      style={{ perspective: '1200px' }}
    >
      {/* Left — copy (40%) */}
      <div className="relative z-10 lg:pt-2">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-primary"
          style={motion(0, 'body')}
        >
          Smart Attendance
        </div>

        <h2
          className="max-w-[480px] text-[28px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[36px] lg:text-[40px] lg:leading-[1.12]"
          style={motion(40, 'heading')}
        >
          Web-based check-in with real-time visibility
        </h2>

        <p
          className="mt-4 max-w-[460px] text-base leading-relaxed text-slate-500 sm:text-lg"
          style={motion(100, 'body')}
        >
          Employees check in via web with photo capture. Managers and HR get real-time attendance
          visibility. Clear rules, corrections, and regularization workflows built-in.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {pills.map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                style={motion(180 + i * 70, 'pill')}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
                <Icon className="hidden h-3.5 w-3.5 text-blue-500/70 sm:block" aria-hidden />
                {item.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right — visual (60%), slightly lower */}
      <div className="relative lg:mt-10" style={motion(160, 'dash')}>
        <div
          className="pointer-events-none absolute -inset-8 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22),transparent_62%)] blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-4 top-8 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl"
          aria-hidden
        />

        <div className="group/dash relative transition-transform duration-300 ease-out hover:-translate-y-1.5">
          <AttendanceDashboardMockup />

          <FloatingGlassCard
            className="absolute -left-3 top-6 z-20 hidden sm:flex lg:-left-8 lg:top-8"
            style={motion(420, 'float')}
            icon={Wifi}
            label="Real-time Sync"
            accent="text-emerald-600"
            accentBg="bg-emerald-500/10"
          />
          <FloatingGlassCard
            className="absolute -right-2 top-[38%] z-20 hidden sm:flex lg:-right-6"
            style={motion(520, 'float')}
            icon={Camera}
            label="Photo Verified"
            accent="text-blue-600"
            accentBg="bg-blue-500/10"
          />
          <FloatingGlassCard
            className="absolute bottom-6 left-[12%] z-20 hidden sm:flex lg:bottom-8 lg:left-[8%]"
            style={motion(620, 'float')}
            icon={Users}
            label="Employees Online"
            accent="text-violet-600"
            accentBg="bg-violet-500/10"
          />
        </div>
      </div>
    </div>
  );
}

function FloatingGlassCard({
  className,
  style,
  icon: Icon,
  label,
  accent,
  accentBg,
}: {
  className?: string;
  style?: CSSProperties;
  icon: LucideIcon;
  label: string;
  accent: string;
  accentBg: string;
}) {
  return (
    <div
      className={cn(
        'items-center gap-2.5 rounded-2xl border border-white/70 bg-white/75 px-3.5 py-2.5 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur-md transition-transform duration-300 ease-out hover:-translate-y-0.5',
        className
      )}
      style={style}
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accentBg)}>
        <Icon className={cn('h-4 w-4', accent)} aria-hidden />
      </span>
      <span className="text-[12px] font-semibold tracking-tight text-slate-800">{label}</span>
    </div>
  );
}

/** Decorative attendance dashboard — clear names, timelines, and dated weekly trend */
function AttendanceDashboardMockup() {
  const rows = [
    {
      name: 'Ananya Sharma',
      initials: 'AS',
      checkIn: '09:02 AM',
      checkOut: '06:18 PM',
      status: 'Present',
      tone: 'bg-emerald-500',
      statusBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    },
    {
      name: 'Rohan Patel',
      initials: 'RP',
      checkIn: '09:14 AM',
      checkOut: '06:05 PM',
      status: 'Present',
      tone: 'bg-emerald-500',
      statusBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    },
    {
      name: 'Sara Khan',
      initials: 'SK',
      checkIn: '08:55 AM',
      checkOut: '05:40 PM',
      status: 'Remote',
      tone: 'bg-sky-500',
      statusBg: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    },
    {
      name: 'Meera Iyer',
      initials: 'MI',
      checkIn: '09:31 AM',
      checkOut: '06:22 PM',
      status: 'Late',
      tone: 'bg-amber-500',
      statusBg: 'bg-amber-50 text-amber-700 ring-amber-200/80',
    },
    {
      name: 'Priya Das',
      initials: 'PD',
      checkIn: '08:58 AM',
      checkOut: '06:10 PM',
      status: 'Present',
      tone: 'bg-emerald-500',
      statusBg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    },
  ];

  const weekBars = [42, 68, 55, 78, 62, 88, 74];
  const [weekDays, setWeekDays] = useState<{ labels: string[]; rangeLabel: string } | null>(
    null
  );
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setWeekDays(getLastSevenDayLabels());
    setTodayLabel(formatTodayLabel());
  }, []);

  const labels = weekDays?.labels ?? ['—', '—', '—', '—', '—', '—', '—'];
  const rangeLabel = weekDays?.rangeLabel ?? 'This week';

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35),0_8px_24px_-12px_rgba(59,130,246,0.2)]">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/95 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300/60" />
        <div className="ml-3 h-5 flex-1 rounded-md bg-white ring-1 ring-slate-200/80" />
      </div>

      <div className="bg-[#F8FAFC] p-3.5 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-semibold text-slate-800">Attendance overview</div>
            <div className="mt-0.5 text-[10px] text-slate-400">{todayLabel || 'Today'}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg bg-blue-500 px-2.5 py-1.5 text-[10px] font-semibold text-white sm:inline">
              Live
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              HR
            </span>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Present', value: '128', bar: 'w-[78%] bg-emerald-400/80' },
            { label: 'Late', value: '09', bar: 'w-[28%] bg-amber-400/80' },
            { label: 'Remote', value: '24', bar: 'w-[42%] bg-sky-400/80' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200/70 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="text-[10px] font-medium text-slate-400">{stat.label}</div>
              <div className="mt-0.5 text-[17px] font-semibold tracking-tight text-slate-900">
                {stat.value}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', stat.bar)} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-[11px] font-semibold text-slate-700">Team check-ins</span>
              <span className="text-[10px] font-medium text-slate-400">In → Out</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {rows.map((row) => (
                <li key={row.name} className="flex items-center gap-2.5 px-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700">
                    {row.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-slate-800">{row.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-600">{row.checkIn}</span>
                      <span className="text-slate-300" aria-hidden>
                        →
                      </span>
                      <span className="font-medium text-slate-600">{row.checkOut}</span>
                    </div>
                    <div className="mt-1.5 flex h-1 items-center gap-0.5">
                      <span className="h-full w-[18%] rounded-full bg-slate-100" />
                      <span className="h-full flex-1 rounded-full bg-gradient-to-r from-blue-400/80 to-emerald-400/70" />
                      <span className="h-full w-[14%] rounded-full bg-slate-100" />
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1',
                      row.statusBg
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', row.tone)} />
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-xl border border-slate-200/70 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">Weekly trend</span>
                <span className="text-[10px] font-medium text-slate-400">{rangeLabel}</span>
              </div>
              <div className="flex h-[100px] items-end gap-1.5 px-0.5 pt-2">
                {weekBars.map((h, i) => (
                  <div key={`${labels[i]}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={cn(
                        'w-full rounded-t-md bg-gradient-to-t from-blue-500/80 to-sky-400/70',
                        i === weekBars.length - 1 && 'from-blue-600 to-blue-400'
                      )}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between gap-0.5 px-0.5">
                {labels.map((label, i) => (
                  <span
                    key={`${label}-${i}`}
                    className="flex-1 text-center text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="mb-2 text-[11px] font-semibold text-slate-700">Check-in health</div>
              <div className="flex items-center gap-3">
                <div
                  className="relative h-12 w-12 shrink-0 rounded-full"
                  style={{
                    background: 'conic-gradient(#3b82f6 0 72%, #e2e8f0 72% 100%)',
                  }}
                  aria-hidden
                >
                  <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-800">
                    72%
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>On time</span>
                    <span className="font-medium text-slate-700">72%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className="h-full w-[72%] rounded-full bg-blue-500/80" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Photo verified</span>
                    <span className="font-medium text-slate-700">91%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className="h-full w-[91%] rounded-full bg-emerald-400/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function getLastSevenDayLabels() {
  const labels: string[] = [];
  const end = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    labels.push(
      new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(d)
    );
  }
  return {
    labels,
    rangeLabel: `${labels[0]} – ${labels[labels.length - 1]}`,
  };
}

function buildCurrentMonthCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 Sun
  const today = now.getDate();

  const monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Sample leave / holiday highlights within the current month (stable decorative picks)
  const leaveDays = new Set(
    [3, 8, 15, 22, Math.min(daysInMonth, 27)].filter((d) => d !== today && d <= daysInMonth)
  );
  const holidayDays = new Set(
    [12, Math.min(daysInMonth, 19)].filter((d) => d !== today && !leaveDays.has(d))
  );

  const cells: Array<{ day: number | null; kind: 'empty' | 'normal' | 'today' | 'leave' | 'holiday' }> =
    [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, kind: 'empty' });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    let kind: 'normal' | 'today' | 'leave' | 'holiday' = 'normal';
    if (day === today) kind = 'today';
    else if (leaveDays.has(day)) kind = 'leave';
    else if (holidayDays.has(day)) kind = 'holiday';
    cells.push({ day, kind });
  }

  return {
    monthLabel,
    daysInMonth,
    today,
    leaveCount: leaveDays.size,
    holidayCount: holidayDays.size,
    cells,
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
}

function LeaveCalendarMockup() {
  const [cal, setCal] = useState<ReturnType<typeof buildCurrentMonthCalendar> | null>(null);

  useEffect(() => {
    setCal(buildCurrentMonthCalendar());
  }, []);

  if (!cal) {
    return (
      <div className="min-h-[360px] rounded-[18px] border border-slate-200/90 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)]" />
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] transition-transform duration-300 hover:-translate-y-1.5">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/95 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300/60" />
        <div className="ml-3 h-5 flex-1 rounded-md bg-white ring-1 ring-slate-200/80" />
      </div>

      <div className="bg-gradient-to-br from-emerald-50/80 to-white p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-[13px] font-semibold text-slate-800">{cal.monthLabel}</div>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-medium text-slate-500">
              <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200/80">
                {cal.daysInMonth} days
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200/80">
                {cal.leaveCount} on leave
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-200/80">
                {cal.holidayCount} holiday{cal.holidayCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 ring-1 ring-blue-200/80">
                Today {cal.today}
              </span>
            </div>
          </div>
          <span className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-semibold text-white">
            Team leave
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cal.weekdays.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {d}
            </div>
          ))}
          {cal.cells.map((cell, i) => {
            if (cell.kind === 'empty' || cell.day == null) {
              return <div key={`e-${i}`} className="aspect-square" />;
            }
            return (
              <div
                key={cell.day}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md text-[11px] font-semibold tabular-nums',
                  cell.kind === 'today' &&
                    'bg-blue-500 text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.55)] ring-2 ring-blue-200',
                  cell.kind === 'leave' && 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
                  cell.kind === 'holiday' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
                  cell.kind === 'normal' && 'bg-white text-slate-700 ring-1 ring-slate-100'
                )}
              >
                {cell.day}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Today
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-200 ring-1 ring-emerald-300" /> Leave
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-300" /> Holiday
          </span>
        </div>
      </div>
    </div>
  );
}

function LeaveManagementBlock() {
  const features = [
    { icon: Calendar, text: 'Multiple leave types' },
    { icon: FileCheck, text: 'One-click approvals' },
    { icon: Users, text: 'Team calendar view' },
    { icon: BarChart3, text: 'Leave balance tracking' },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

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
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      LANDING_SCROLL_REVEAL
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const fade = (delay: number, y = 16): CSSProperties =>
    reducedMotion
      ? { opacity: visible ? 1 : 0, transition: `opacity 280ms ${EASE}` }
      : {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
          transition: `opacity ${landingDuration(650)}ms ${EASE} ${landingDelay(delay)}ms, transform ${landingDuration(650)}ms ${EASE} ${landingDelay(delay)}ms`,
        };

  return (
    <div
      ref={sectionRef}
      className="grid items-center gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12 xl:gap-16"
    >
      <div className="relative order-2 lg:order-1 lg:mt-8" style={fade(120, 28)}>
        <div
          className="pointer-events-none absolute -inset-6 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16),transparent_62%)] blur-2xl"
          aria-hidden
        />
        <LeaveCalendarMockup />
      </div>

      <div className="order-1 lg:order-2">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-[13px] font-medium text-emerald-700"
          style={fade(0)}
        >
          Leave Management
        </div>
        <h2
          className="max-w-[520px] text-[28px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[36px] lg:text-[40px] lg:leading-[1.12]"
          style={fade(40, 30)}
        >
          Leave requests and approvals in seconds
        </h2>
        <p className="mt-4 max-w-[560px] text-base leading-relaxed text-slate-500 sm:text-lg" style={fade(100)}>
          Employees apply for leave, managers approve with one click, and everything syncs
          automatically with attendance and payroll. No emails, no spreadsheets.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                style={fade(160 + i * 60, 10)}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
                <Icon className="hidden h-3.5 w-3.5 text-emerald-500/70 sm:block" aria-hidden />
                {item.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
