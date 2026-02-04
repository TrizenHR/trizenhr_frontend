'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Users,
  Shield,
  Lock,
  FileText,
  Building2,
  UserCheck,
  Eye,
  Download,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { DemoRequestModal } from '@/components/landing/DemoRequestModal';
import { EnhancedHero } from '@/components/landing/EnhancedHero';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { EnhancedSocialProof } from '@/components/landing/EnhancedSocialProof';

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    const openIfHashDemo = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#demo') {
        setDemoModalOpen(true);
      }
    };
    openIfHashDemo();
    window.addEventListener('hashchange', openIfHashDemo);
    return () => window.removeEventListener('hashchange', openIfHashDemo);
  }, []);

  const openDemoModal = () => setDemoModalOpen(true);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onBookDemo={openDemoModal} />

      <main className="flex-1">
        <EnhancedHero onBookDemo={openDemoModal} />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FeatureShowcase />
        <RoleBasedValueSection />
        <ReportsComplianceSection />
        <PricingSection onBookDemo={openDemoModal} />
        <EnhancedSocialProof />
        <CTASection onBookDemo={openDemoModal} />
      </main>

      <Footer onBookDemo={openDemoModal} />
      <DemoRequestModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}

function Header({ onBookDemo }: { onBookDemo: () => void }) {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#security', label: 'Security' },
    { href: '#customers', label: 'Customers' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo.png"
              alt="TrizenHR"
              width={32}
              height={32}
              className="rounded"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-slate-900">TrizenHR</span>
              <span className="text-[10px] text-slate-500 -mt-0.5">by Trizen Ventures</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-300" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" className="font-medium shadow-sm" onClick={onBookDemo}>
            Book a demo
          </Button>
        </div>
      </div>
    </header>
  );
}



function ProblemSection() {
  const problems = [
    {
      icon: FileText,
      title: 'Spreadsheet chaos',
      description:
        'Teams waste hours managing attendance in spreadsheets and disconnected systems.',
      gradient: 'from-rose-500/10 to-red-500/5',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      icon: Eye,
      title: 'Payroll errors',
      description:
        'Payroll errors increase when attendance, leave, and approvals don&apos;t sync.',
      gradient: 'from-orange-500/10 to-amber-500/5',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: Shield,
      title: 'Audit stress',
      description:
        'Compliance audits become stressful without accurate, centralized records.',
      gradient: 'from-yellow-500/10 to-amber-500/5',
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <section className="border-b border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-600 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600"></span>
            </span>
            Common Challenges
          </div> */}
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            The cost of manual attendance and fragmented payroll
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Organizations without centralized workforce tracking face recurring operational
            challenges that affect productivity, compliance, and decision-making.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${problem.gradient} p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className={`mb-4 inline-flex rounded-xl ${problem.iconBg} p-3 transition-transform group-hover:scale-110`}>
                <problem.icon className={`h-6 w-6 ${problem.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
              
              {/* Decorative corner accent */}
              <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-transparent to-rose-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Solution teaser */}
        <div className="mt-12 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>TrizenHR centralizes attendance and payroll to eliminate these gaps.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: 'Smart Attendance',
      description: 'Web and mobile attendance with clear rules and real-time visibility.',
      gradient: 'from-blue-500/10 to-cyan-500/5',
      iconBg: 'bg-blue-500',
    },
    {
      icon: DollarSign,
      title: 'Automated Payroll',
      description: 'Salary processing, statutory components, and payslips in a few clicks.',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-500',
    },
    {
      icon: Users,
      title: 'Role-based Dashboards',
      description: 'Employees, managers, HR, and admins see exactly what they need.',
      gradient: 'from-violet-500/10 to-purple-500/5',
      iconBg: 'bg-violet-500',
    },
    {
      icon: Download,
      title: 'Reports & Compliance',
      description: 'Accurate reports and exports designed for audits and decision-making.',
      gradient: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-500',
    },
  ];

  return (
    <section id="features" className="border-b border-border bg-gradient-to-b from-muted/30 to-transparent py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Core Capabilities
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything HR teams need to run attendance and payroll smoothly
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Essential features for managing workforce attendance across your organization.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border-border bg-gradient-to-br ${feature.gradient} backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl`}
            >
              <CardHeader className="pb-4">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconBg} shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-blue-600 transition-all duration-300 group-hover:w-full" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleBasedValueSection() {
  const roles = [
    {
      label: 'Company Admin',
      icon: Shield,
      value: 'Configure company structure, policies, and payroll rules',
      color: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'HR',
      icon: Building2,
      value: 'Track attendance, manage employees, and process payroll confidently',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Manager',
      icon: Users,
      value: 'View team attendance and approve requests without follow-ups',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Employee',
      icon: UserCheck,
      value: 'Mark attendance, apply leaves, and view payslips anytime',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <section className="border-b border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            Role-Based Experience
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Built for every role in your organization
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each user accesses features and data appropriate to their responsibilities.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {roles.map((role, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className="pb-2">
                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${role.iconBg} transition-transform group-hover:scale-110`}>
                  <role.icon className={`h-6 w-6 ${role.iconColor}`} />
                </div>
                <CardTitle className="text-base font-semibold">{role.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{role.value}</p>
              </CardContent>

              {/* Gradient accent on hover */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${role.color} transition-all duration-300 group-hover:w-full`} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsComplianceSection() {
  return (
    <section id="security" className="relative border-b border-border bg-muted/30 py-20 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Designed with compliance and security in mind
            </div>
            <h2 className="text-3xl font-bold text-foreground">Reports & Compliance</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              From role-based access to audit-ready records, your workforce data stays accurate,
              secure, and compliant as your organization grows.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Role-based access control</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Audit logs & data isolation</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Secure cloud infrastructure</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 rounded bg-foreground/10" />
                      <div className="h-2 w-24 rounded bg-foreground/5" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onBookDemo }: { onBookDemo: () => void }) {
  const plans = [
    {
      name: 'Starter',
      description: 'Up to 50 employees',
      features: 'Core attendance + payroll',
      price: '₹1',
      period: '/ user / day',
      cta: 'Book demo',
      highlighted: false,
    },
    {
      name: 'Growth',
      description: 'Up to 200 employees',
      features: 'All features + basic integrations',
      price: '₹2',
      period: '/ user / day',
      cta: 'Book demo',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: '200+ employees',
      features: 'Custom workflows, SLAs, support',
      price: 'Contact sales',
      period: '',
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Simple pricing that scales with your team</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            All plans include role-based access, cloud hosting, and regular updates.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 transition-all hover:shadow-xl ${
                plan.highlighted ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="mt-2 text-sm text-muted-foreground">{plan.features}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={onBookDemo}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}



function CTASection({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section id="demo" className="relative overflow-hidden py-20">
      {/* Background with bluish gradient and soft orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/60 to-indigo-50/70 dark:from-blue-950/30 dark:via-indigo-950/25 dark:to-slate-950/30" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-500/20" />
        <div 
          className="absolute -bottom-40 left-20 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/20"
          style={{ animationDelay: '2s' }}
        />
        <div 
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-500/10"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/90 p-12 text-center shadow-2xl backdrop-blur-md">
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Ready to streamline
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              attendance and payroll?
            </span>
          </h2>
          
          <p className="mt-6 text-lg text-muted-foreground">
            Book a personalized demo for your organization. No credit card required.
          </p>
          
          <div className="mt-10">
            <Button 
              size="lg" 
              className="shadow-lg transition-all hover:scale-105 hover:shadow-xl" 
              onClick={onBookDemo}
            >
              Book a demo
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="mt-6 text-sm text-muted-foreground">No credit card required</p>
        </div>
      </div>
    </section>
  );
}

function Footer({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Logo + tagline */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="TrizenHR"
              width={32}
              height={32}
              className="brightness-0 invert transition-transform hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-200">TrizenHR</span>
              <span className="text-xs text-slate-400">by Trizen Ventures</span>
            </div>
          </div>
        </div>

        {/* 5-column grid — Keka-style, app-mapped links */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Core HR — from app: employees, departments, profile, help, reports */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-200">Core HR</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/employees" className="text-slate-300 transition-colors hover:text-white">
                  Employee Management
                </Link>
              </li>
              <li>
                <Link href="/dashboard/departments" className="text-slate-300 transition-colors hover:text-white">
                  Departments
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="text-slate-300 transition-colors hover:text-white">
                  Employee Profiles
                </Link>
              </li>
              <li>
                <Link href="/dashboard/help" className="text-slate-300 transition-colors hover:text-white">
                  Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className="text-slate-300 transition-colors hover:text-white">
                  HR Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Payroll — from app: payroll, salary-structures, my-salary */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-200">Payroll</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/payroll" className="text-slate-300 transition-colors hover:text-white">
                  Payroll Processing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/salary-structures" className="text-slate-300 transition-colors hover:text-white">
                  Salary Structures
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-salary" className="text-slate-300 transition-colors hover:text-white">
                  Payslips
                </Link>
              </li>
            </ul>
          </div>

          {/* Attendance — from app: team-attendance, team-leaves, leave-approvals, manage-holidays, reports */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-200">Attendance</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/team-attendance" className="text-slate-300 transition-colors hover:text-white">
                  Attendance Tracking
                </Link>
              </li>
              <li>
                <Link href="/dashboard/team-leaves" className="text-slate-300 transition-colors hover:text-white">
                  Leave Management
                </Link>
              </li>
              <li>
                <Link href="/dashboard/leave-approvals" className="text-slate-300 transition-colors hover:text-white">
                  Leave Approvals
                </Link>
              </li>
              <li>
                <Link href="/dashboard/manage-holidays" className="text-slate-300 transition-colors hover:text-white">
                  Manage Holidays
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className="text-slate-300 transition-colors hover:text-white">
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Company — landing page sections + contact */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-200">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#security" className="text-slate-300 transition-colors hover:text-white">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-300 transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#customers" className="text-slate-300 transition-colors hover:text-white">
                  Customers
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onBookDemo}
                  className="text-left text-slate-300 transition-colors hover:text-white"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Resources — from app: help, login */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-200">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/help" className="text-slate-300 transition-colors hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/dashboard/help" className="text-slate-300 transition-colors hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 transition-colors hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} Trizen Ventures. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
