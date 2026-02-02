'use client';

import { Quote } from 'lucide-react';

/**
 * Enhanced social proof section with better testimonials and trust indicators
 * Inspired by Keka's social proof design
 */
export function EnhancedSocialProof() {
  const testimonials = [
    {
      quote:
        'We reduced payroll processing time by 50% after switching to this platform.',
      author: 'HR Head',
      role: 'Mid-market company',
      rating: 5,
      avatar: 'HR',
    },
  ];

  // Placeholder company logos
  const companies = [
    { name: 'TechFlow', initials: 'TF' },
    { name: 'GrowthCo', initials: 'GC' },
    { name: 'Nova Enterprises', initials: 'NE' },
    { name: 'Peak Solutions', initials: 'PS' },
    { name: 'Acme Corp', initials: 'AC' },
    { name: 'Delta Industries', initials: 'DI' },
  ];

  return (
    <section id="customers" className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Trusted by modern teams</h2>
        </div>

        {/* Company logos */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 opacity-70">
            {companies.map((company) => (
              <div
                key={company.initials}
                className="flex h-10 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-500"
                title={company.name}
              >
                {company.initials}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial quote */}
        <div className="mt-12">
          <blockquote className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <Quote className="mx-auto mb-4 h-10 w-10 text-primary/30" />
            <p className="text-lg italic text-muted-foreground">
              &ldquo;{testimonials[0].quote}&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              — {testimonials[0].author}, {testimonials[0].role}
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
