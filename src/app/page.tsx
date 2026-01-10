import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <RoleBasedValueSection />
        <SecuritySection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Image
              src="/assets/logo.png"
              alt="Trizen Ventures"
              width={36}
              height={36}
            />
            <span className='text-sm'>Trizen Ventures</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Product
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#security"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Security
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="shadow-lg transition-all hover:shadow-xl" asChild>
            <Link href="#demo">Request Demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-brfrom-primary/5 via-accent/5 to-secondary/5" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Modern Attendance Management
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Workforce Attendance.
              <br />
              <span className="bg-linear-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Complete Visibility.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A centralized platform for tracking attendance, managing teams, and maintaining
              compliance. Built for organizations that need reliable workforce data and clear
              accountability.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="shadow-lg transition-all hover:scale-105 hover:shadow-xl" asChild>
                <Link href="#demo">
                  Request Demo
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="transition-all hover:scale-105" asChild>
                <Link href="/login">Access Dashboard</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span>Role-Based Access</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all hover:shadow-primary/20">
              {/* Browser Bar */}
              <div className="border-b border-border bg-muted/50 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-chart-4/80" />
                  <div className="h-3 w-3 rounded-full bg-chart-2/80" />
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="bg-linear-to-br from-card to-muted/30 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded-full bg-foreground/10 animate-pulse" />
                    <div className="h-2 w-24 rounded-full bg-foreground/5" />
                  </div>
                  <div className="h-9 w-24 rounded-lg bg-primary shadow-md" />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { color: 'bg-primary/20', value: 'bg-primary/40' },
                    { color: 'bg-chart-2/20', value: 'bg-chart-2/40' },
                    { color: 'bg-chart-4/20', value: 'bg-chart-4/40' },
                  ].map((stat, i) => (
                    <div key={i} className={`rounded-xl ${stat.color} backdrop-blur-sm p-4 transition-all hover:scale-105`}>
                      <div className="h-2 w-16 rounded bg-foreground/20" />
                      <div className={`mt-3 h-7 w-12 rounded ${stat.value} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                    </div>
                  ))}
                </div>
                
                {/* User List */}
                <div className="mt-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card/80 p-3 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary to-primary/60" />
                        <div className="space-y-1">
                          <div className="h-2 w-24 rounded bg-foreground/20" />
                          <div className="h-2 w-16 rounded bg-foreground/10" />
                        </div>
                      </div>
                      <div className="h-6 w-16 rounded-full bg-chart-2/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: FileText,
      title: 'Manual Tracking Errors',
      description:
        'Paper registers and spreadsheets introduce inconsistencies. Data entry errors, duplicate entries, and lost records make payroll processing unreliable.',
      gradient: 'from-primary/10 to-primary/5',
    },
    {
      icon: Eye,
      title: 'Limited Visibility',
      description:
        'Without a unified system, managers lack real-time insight into team attendance. Decisions are made on incomplete or outdated information.',
      gradient: 'from-chart-4/10 to-chart-4/5',
    },
    {
      icon: Shield,
      title: 'Compliance Gaps',
      description:
        'Meeting labor regulations requires accurate attendance records. Manual processes make audits time-consuming and expose organizations to compliance risks.',
      gradient: 'from-chart-2/10 to-chart-2/5',
    },
  ];

  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground">
            The cost of fragmented attendance data
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
              className={`group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br ${problem.gradient} p-6 transition-all hover:scale-105 hover:shadow-lg`}
            >
              <div className="mb-4 inline-flex rounded-xl bg-background/50 p-3 backdrop-blur-sm">
                <problem.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description:
        'Record check-in and check-out times with precision. Support for manual entries, corrections, and regularization workflows.',
      gradient: 'from-primary/10 to-primary/5',
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description:
        'Define access levels for employees, managers, HR, and administrators. Each role sees only what they need.',
      gradient: 'from-secondary/10 to-secondary/5',
    },
    {
      icon: Eye,
      title: 'Team & Org Visibility',
      description:
        'Managers view their direct reports. HR sees the full organization. Clear hierarchy with appropriate data boundaries.',
      gradient: 'from-accent/10 to-accent/5',
    },
    {
      icon: Download,
      title: 'Reports & Exports',
      description:
        'Generate attendance reports by date range, department, or individual. Export to CSV or PDF for payroll and audits.',
      gradient: 'from-chart-2/10 to-chart-2/5',
    },
  ];

  return (
    <section id="features" className="border-b border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center mx-auto">
          <h2 className="text-3xl font-bold text-foreground">Core Capabilities</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Essential features for managing workforce attendance across your organization.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group border-border bg-linear-to-br   ${feature.gradient} backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/10`}
            >
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
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
      id: 'employee',
      label: 'Employee',
      icon: UserCheck,
      color: 'primary',
      benefits: [
        'View personal attendance history',
        'Submit regularization requests',
        'Track leave balances',
        'Download attendance statements',
      ],
    },
    {
      id: 'manager',
      label: 'Manager',
      icon: Users,
      color: 'secondary',
      benefits: [
        'Monitor team attendance in real-time',
        'Approve or reject regularization requests',
        'View team-level reports and summaries',
        'Identify attendance patterns and exceptions',
      ],
    },
    {
      id: 'hr',
      label: 'HR',
      icon: Building2,
      color: 'accent',
      benefits: [
        'Access organization-wide attendance data',
        'Generate compliance reports',
        'Manage attendance policies and rules',
        'Export data for payroll processing',
      ],
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'chart-2',
      benefits: [
        'Configure system settings and integrations',
        'Manage user roles and permissions',
        'View audit logs and system activity',
        'Control data retention policies',
      ],
    },
  ];

  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground">Built for every role</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each user accesses features and data appropriate to their responsibilities.
          </p>
        </div>
        <div className="mt-12">
          <Tabs defaultValue="employee" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-4 bg-muted/50 p-1 backdrop-blur-sm">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <role.icon className="mr-2 h-4 w-4" />
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-0">
                <Card className="border-border bg-linear-to-brfrom-card to-muted/20 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <role.icon className="h-6 w-6 text-primary" />
                      </div>
                      {role.label} Access
                    </CardTitle>
                    <CardDescription className="text-base">
                      What the {role.label.toLowerCase()} role provides
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-4 md:grid-cols-2">
                      {role.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3 group">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary transition-all group-hover:scale-110 mt-0.5" />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description:
        'Granular permissions ensure users access only the data and functions relevant to their role.',
    },
    {
      icon: FileText,
      title: 'Audit Logs',
      description:
        'Complete activity trails for compliance. Track who accessed what, when, and from where.',
    },
    {
      icon: Building2,
      title: 'Data Isolation',
      description:
        "Multi-tenant architecture with strict data boundaries. Each organization's data remains separate.",
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Controls',
      description:
        'Session management, password policies, and access controls designed for enterprise requirements.',
    },
  ];

  return (
    <section id="security" className="relative border-b border-border bg-muted/30 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            Enterprise-Grade Security
          </div>
          <h2 className="text-3xl font-bold text-foreground">Security & Compliance</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built with enterprise security requirements in mind. Your workforce data is protected
            with industry-standard controls.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="demo" className="relative overflow-hidden py-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent/10 to-secondary/10" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/80 p-12 text-center shadow-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Access the dashboard with test credentials or request a personalized demo for your
            organization.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="shadow-lg transition-all hover:scale-105 hover:shadow-xl" asChild>
              <Link href="/login">
                Access Dashboard
                <TrendingUp className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="transition-all hover:scale-105">
              Request Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Free Trial Available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="Trizen Ventures"
              width={32}
              height={32}
              className="transition-transform hover:scale-110"
            />
            <span className="font-semibold text-foreground">Trizen Ventures</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#security" className="text-muted-foreground transition-colors hover:text-foreground">
              Security
            </Link>
            <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
              Login
            </Link>
            <Link href="#demo" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Trizen Ventures. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
