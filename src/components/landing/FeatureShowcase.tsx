'use client';

import { Card } from '@/components/ui/card';
import { 
  Clock, 
  Shield,
  Calendar,
  FileCheck,
  Users,
  BarChart3
} from 'lucide-react';

/**
 * Feature showcase section inspired by Zoho's alternating image/text layout
 * Shows key features with visual representations
 */
export function FeatureShowcase() {
  const features = [
    {
      badge: 'Smart Attendance',
      title: 'Web-based check-in with real-time visibility',
      description:
        'Employees check in via web with photo capture. Managers and HR get real-time attendance visibility. Clear rules, corrections, and regularization workflows built-in.',
      features: [
        { icon: Clock, text: 'Web check-in / check-out' },
        { icon: Shield, text: 'Photo capture at check-in' },
        { icon: FileCheck, text: 'Regularization workflows' },
        { icon: BarChart3, text: 'Real-time sync' },
      ],
      imagePosition: 'left' as const,
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      badge: 'Leave Management',
      title: 'Leave requests and approvals in seconds',
      description:
        'Employees apply for leave, managers approve with one click, and everything syncs automatically with attendance and payroll. No emails, no spreadsheets.',
      features: [
        { icon: Calendar, text: 'Multiple leave types' },
        { icon: FileCheck, text: 'One-click approvals' },
        { icon: Users, text: 'Team calendar view' },
        { icon: BarChart3, text: 'Leave balance tracking' },
      ],
      imagePosition: 'right' as const,
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
  ];

  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                feature.imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content side */}
              <div className={feature.imagePosition === 'right' ? 'lg:order-2' : ''}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  {feature.badge}
                </div>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  {feature.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Feature list */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {feature.features.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all hover:border-primary/30 hover:bg-card"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual side - Placeholder for product screenshot */}
              <div className={feature.imagePosition === 'right' ? 'lg:order-1' : ''}>
                <Card className={`relative overflow-hidden border-border bg-gradient-to-br ${feature.gradient} p-8 shadow-xl`}>
                  <div className="aspect-[4/3] rounded-lg border border-border bg-card/80 backdrop-blur-sm">
                    {/* Placeholder for actual product screenshot */}
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          {(() => {
                            const IconComponent = feature.features[0].icon;
                            return <IconComponent className="h-8 w-8 text-primary" />;
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.badge} Interface
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
