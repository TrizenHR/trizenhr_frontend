'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Building2,
  TrendingUp,
  Calendar,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

/**
 * Realistic dashboard preview for landing page Hero.
 * Mimics Admin/HR dashboard: stats, today's attendance, quick actions.
 */
export function DashboardHeroPreview() {
  const stats = [
    { title: 'Total Users', value: '124', icon: Users },
    { title: 'Present Today', value: '98', icon: TrendingUp, desc: '79% attendance' },
    { title: 'Pending', value: '5', icon: Calendar, desc: 'Leave approvals' },
    { title: 'Departments', value: '8', icon: Building2 },
  ];

  const attendanceItems = [
    { label: 'Present', count: 98, icon: CheckCircle2, accent: 'border-l-emerald-500' },
    { label: 'Late', count: 4, icon: Clock, accent: 'border-l-amber-500' },
    { label: 'Absent', count: 12, icon: XCircle, accent: 'border-l-rose-500' },
    { label: 'On Leave', count: 10, icon: Calendar, accent: 'border-l-sky-500' },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: Users },
    { label: 'View Attendance', icon: ClipboardCheck },
    { label: 'Reports', icon: FileText },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-slate-200/40">
      {/* Subtle header bar */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2">
        <span className="text-[11px] font-medium text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Dashboard content */}
      <div className="space-y-4 p-4">
        {/* Page header */}
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">Dashboard</h3>
          <p className="text-xs text-slate-500">System-wide overview</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-slate-100 bg-slate-50/30 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2.5 px-3">
                  <CardTitle className="text-[11px] font-medium text-slate-500">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </CardHeader>
                <CardContent className="px-3 pb-2.5">
                  <div className="text-lg font-semibold tracking-tight text-slate-900">{stat.value}</div>
                  {stat.desc && (
                    <p className="text-[10px] text-slate-500">{stat.desc}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Attendance + Quick Actions row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Today's Attendance - refined table-style layout */}
          <Card className="sm:col-span-2 border-slate-100 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
              <p className="text-[10px] text-slate-500">Total: 124 employees</p>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1.5">
                {attendanceItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-md border-l-4 border-slate-100 bg-slate-50/50 px-3 py-2 ${item.accent}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-3 pb-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.label}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] font-medium ${
                      i === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${i === 0 ? 'text-primary' : 'text-slate-500'}`} />
                    {action.label}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
