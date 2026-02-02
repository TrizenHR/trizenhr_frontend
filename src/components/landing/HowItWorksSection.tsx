'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, DollarSign, FileText } from 'lucide-react';

/**
 * "How It Works" section inspired by Zoho/Keka flow demonstrations
 * Shows simple 4-step process for using the platform
 */
export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Clock,
      title: 'Mark Attendance',
      description: 'Employees check-in via web or mobile app. Real-time visibility for managers.',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      number: 2,
      icon: CheckCircle2,
      title: 'Auto-sync Data',
      description: 'Attendance automatically flows into leave management and payroll systems.',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      number: 3,
      icon: DollarSign,
      title: 'Process Payroll',
      description: 'Calculate salaries with accurate attendance, leaves, and statutory components.',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      number: 4,
      icon: FileText,
      title: 'Generate Reports',
      description: 'Export audit-ready reports for compliance and decision-making.',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <section className="relative border-b border-border py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {/* <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span> */}
            Simple Process
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            From clock-in to payslip in 4 steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Automate your entire attendance and payroll workflow. No manual intervention needed.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full lg:block">
                    <div className="h-full w-full bg-gradient-to-r from-border via-border to-transparent" />
                  </div>
                )}

                <Card className="group relative border-border bg-card transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <CardContent className="p-6">
                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${step.iconBg} transition-all group-hover:scale-110`}>
                      <Icon className={`h-7 w-7 ${step.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    {/* Bottom accent */}
                    <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${step.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Everything happens automatically. Your team just focuses on their work.
          </p>
        </div>
      </div>
    </section>
  );
}
