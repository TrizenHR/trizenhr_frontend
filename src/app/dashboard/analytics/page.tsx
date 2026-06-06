'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Users,
  Building2,
  IndianRupee,
  Layers,
  Cpu,
  Database,
  Activity,
  CheckCircle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');

  // Plan Distribution Metrics
  const PLAN_METRICS = [
    { name: 'Enterprise Plan', count: 18, percentage: 12.6, mrr: 245000, color: 'bg-purple-600' },
    { name: 'Premium Plan', count: 52, percentage: 36.6, mrr: 298000, color: 'bg-blue-600' },
    { name: 'Basic Plan', count: 48, percentage: 33.8, mrr: 105200, color: 'bg-emerald-600' },
    { name: 'Free Plan', count: 24, percentage: 16.9, mrr: 0, color: 'bg-muted' },
  ];

  // Module Usage Metrics
  const MODULE_METRICS = [
    { name: 'Attendance Tracking', enabledCount: 142, percentage: 100 },
    { name: 'Leave Management', enabledCount: 128, percentage: 90.1 },
    { name: 'Payroll Engine', enabledCount: 94, percentage: 66.2 },
    { name: 'Recruitment & ATS', enabledCount: 38, percentage: 26.7 },
    { name: 'Performance & OKRs', enabledCount: 22, percentage: 15.4 },
  ];

  // Top Org Growth details
  const TOP_ORGS = [
    { name: 'Trizent Solutions', users: 840, plan: 'Enterprise', mrr: 58800 },
    { name: 'Innovate Tech', users: 620, plan: 'Enterprise', mrr: 43400 },
    { name: 'Stark Industries', users: 450, plan: 'Premium', mrr: 22500 },
    { name: 'Wayne Enterprises', users: 380, plan: 'Premium', mrr: 19000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl font-sf">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Super Admin dashboard monitoring global tenant growth, adoption, and platform revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Organizations</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">+8 new</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Active Users</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,420</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">+640 users</span> in 30d
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform MRR</span>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹6,48,200</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">+15.3%</span> growth MoM
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg. Org Size</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">59.3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users per tenant organization
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plans Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Subscription Plans Allocation</CardTitle>
            <CardDescription>Breakdown of billing plans and recurring revenue contributions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PLAN_METRICS.map(plan => (
              <div key={plan.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${plan.color}`} />
                    {plan.name} ({plan.count})
                  </span>
                  <span>{plan.percentage}% | ₹{plan.mrr.toLocaleString('en-IN')} MRR</span>
                </div>
                <Progress value={plan.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Module Adoption Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Feature Module Activation Rates</CardTitle>
            <CardDescription>Percentage of tenant organizations with modules enabled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MODULE_METRICS.map(module => (
              <div key={module.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>{module.name}</span>
                  <span className="text-muted-foreground">{module.enabledCount} Orgs ({Math.round(module.percentage)}%)</span>
                </div>
                <Progress value={module.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Organizations Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Performing Organizations</CardTitle>
            <CardDescription>Tenants with highest user headcounts and active billings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border text-sm">
              <div className="grid grid-cols-4 bg-muted/40 p-2 font-semibold border-b text-xs uppercase tracking-wider text-muted-foreground">
                <div className="col-span-2">Organization</div>
                <div>Active Users</div>
                <div className="text-right">Est. Monthly billing</div>
              </div>
              <div className="divide-y">
                {TOP_ORGS.map((org, index) => (
                  <div key={org.name} className="grid grid-cols-4 p-2.5 items-center hover:bg-muted/10 transition-colors">
                    <div className="col-span-2 font-medium flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                      {org.name}
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold uppercase">{org.plan}</Badge>
                    </div>
                    <div className="text-muted-foreground font-semibold">{org.users}</div>
                    <div className="text-right font-bold text-foreground">₹{org.mrr.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health / Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Platform System Health</CardTitle>
            <CardDescription>Super Admin technical overview metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Activity className="h-4 w-4 text-emerald-500" />
                API Gateway Response
              </span>
              <Badge className="bg-emerald-500 text-white font-bold">99.98% / 120ms</Badge>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Cpu className="h-4 w-4 text-blue-500" />
                Cluster Compute (Node)
              </span>
              <span className="font-semibold text-foreground">38.4% utilization</span>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Database className="h-4 w-4 text-purple-500" />
                DB Cluster Capacity
              </span>
              <span className="font-semibold text-foreground">84.2 GB / 500 GB (16%)</span>
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">All Subsystems Operational</p>
                <p className="text-emerald-700/90 mt-0.5">Last automated check-in succeeded 3 minutes ago.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
