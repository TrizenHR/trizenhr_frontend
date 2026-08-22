import { BillingOverview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Sparkles, Calendar, Users, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BillingOverviewTabProps {
  overview: BillingOverview | null;
  loading: boolean;
}

export function BillingOverviewTab({ overview, loading }: BillingOverviewTabProps) {
  if (loading || !overview) {
    return <p className="text-sm text-muted-foreground">Loading billing overview...</p>;
  }

  const isTrial = overview.status === 'TRIALING' || !overview.status;
  const effectiveTrialLimit = overview.trialEmployeeLimit || 25;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 30-Day Free Trial Banner */}
      {isTrial && (
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Sparkles className="mr-1 h-3 w-3" /> 30-Day Free Trial Active
                </Badge>
                <Badge variant="outline" className="border-indigo-400/40 text-indigo-300">
                  {overview.planName || overview.subscriptionPlan.toString().toUpperCase()} PLAN
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white">Your organization is currently on a 30-Day FREE Trial</h3>
              <p className="text-xs text-slate-400">
                Full access enabled for up to {isTrial ? effectiveTrialLimit : overview.employeeLimit || 200} employees. Payment required after trial ends.
              </p>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Trial Start</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  {formatDate(overview.trialStartAt)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Trial End</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {formatDate(overview.trialEndAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Current plan</span>
              <Badge variant="outline" className="text-xs">
                {overview.status || 'TRIALING'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview.planName || overview.subscriptionPlan.toString().toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ₹{overview.pricePerUserPerDay}/user/day · Limit: {overview.employeeLimit || 200} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> Active employees (billable)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overview.activeUsers}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Billable employee = active employee. Exited/inactive users are not billed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated bill after trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">
                {overview.currentMonthEstimate.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isTrial ? 'Trial Price: ₹0 now. Estimated monthly cost after trial.' : 'Based on current active users.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Monthly billing history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.monthlyHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Your trial is currently ₹0.
            </p>
          ) : (
            <div className="space-y-3">
              {overview.monthlyHistory.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium text-muted-foreground">{m.month}</div>
                  <div className="flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          (m.amount / (overview.currentMonthEstimate || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="w-28 text-right text-sm font-medium">
                    {isTrial ? '₹0 (Trial)' : `₹${m.amount.toLocaleString('en-IN')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
