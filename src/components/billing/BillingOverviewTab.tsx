import { BillingOverview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';

interface BillingOverviewTabProps {
  overview: BillingOverview | null;
  loading: boolean;
}

export function BillingOverviewTab({ overview, loading }: BillingOverviewTabProps) {
  if (loading || !overview) {
    return <p className="text-sm text-muted-foreground">Loading billing overview...</p>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {overview.subscriptionPlan.toString().toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ₹{overview.pricePerUserPerDay}/user/day · {overview.billingCycle}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active employees (billable)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{overview.activeUsers}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on active users in this organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated bill this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-5 w-5 text-primary" />
              <p className="text-2xl font-semibold">
                {overview.currentMonthEstimate.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimate based on current plan, users, and days in month.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Monthly billing (last {overview.monthlyHistory.length} months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.monthlyHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Once billing is enabled, you&apos;ll see monthly amounts here.
            </p>
          ) : (
            <div className="space-y-3">
              {overview.monthlyHistory.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-muted-foreground">{m.month}</div>
                  <div className="flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          (m.amount / overview.currentMonthEstimate || 0) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

