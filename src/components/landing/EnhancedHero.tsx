'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface EnhancedHeroProps {
  onBookDemo: () => void;
}

/**
 * Zoho-style hero section — tagline, headline, description, CTAs, and product screenshot
 */
export function EnhancedHero({ onBookDemo }: EnhancedHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background — white top, soft gradient below */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-slate-50/50 dark:from-background dark:via-blue-950/20 dark:to-slate-950/30" />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pt-24 lg:pb-16">
        {/* Top content — centered text block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline pill */}
          <div className="mb-6 inline-flex animate-fade-in rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Attendance & Payroll
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage your attendance
            <br />
            <span className="text-slate-600 dark:text-slate-300">like clockwork</span>
          </h1>

          {/* Description */}
          <p className="mt-6 animate-fade-in-up text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: '0.1s' }}>
            Boost workplace efficiency with a flexible attendance system that lets you check-in from the web and mobile app,
            allows policy customization according to changing work preferences, and manages all your attendance information accurately.
          </p>

          {/* CTA buttons — Zoho-style: primary + outline */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button
              size="lg"
              className="shadow-md transition-all hover:shadow-lg"
              onClick={onBookDemo}
            >
              Book a demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <Link href="/login" className="inline-flex items-center gap-2">
                View dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Product screenshot — Zoho-style large image with bottom fade */}
        <div className="relative -mb-8 mt-12 animate-fade-in-up sm:-mb-12 lg:-mb-16 lg:mt-16" style={{ animationDelay: '0.3s' }}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-t-xl border-x border-t border-slate-200/80 bg-white shadow-2xl shadow-blue-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-blue-900/30">
            <Image
              src="/image.png"
              alt="Attendance dashboard preview"
              width={1200}
              height={700}
              className="w-full object-contain"
              priority
            />
            {/* Bottom fade — merges image into section below */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950 sm:h-32 lg:h-40"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
