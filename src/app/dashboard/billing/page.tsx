'use client';

import { useEffect, useState } from 'react';
import { billingApi } from '@/lib/api';
import { BillingOverview, BillingInvoice, BillingInvoiceStatus, SubscriptionPlan, UserRole } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, HelpCircle, IndianRupee } from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyFailures, setNotifyFailures] = useState(true);

  const isAllowed =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (!isAllowed) return;

    const loadOverview = async () => {
      try {
        setLoadingOverview(true);
        const data = await billingApi.getOverview();
        setOverview(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Failed to load billing overview. Please try again.'
        );
      } finally {
        setLoadingOverview(false);
      }
    };

    const loadInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const data = await billingApi.getInvoices();
        setInvoices(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Failed to load billing history. Please try again.'
        );
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadOverview();
    loadInvoices();
  }, [isAllowed]);

  if (!user) {
    return null;
  }

  if (!isAllowed) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Access restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only Company Admins and System Admins can access billing information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          View your plan, monthly usage, and invoice history.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Billing history</TabsTrigger>
          <TabsTrigger value="payments">Payment methods</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loadingOverview || !overview ? (
            <p className="text-sm text-muted-foreground">Loading billing overview...</p>
          ) : (
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
                          <div className="w-20 text-xs font-medium text-muted-foreground">
                            {m.month}
                          </div>
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
          )}
        </TabsContent>

        <TabsContent value="history">
          {loadingInvoices ? (
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Once billing is enabled in this environment, invoices will appear here.
            </p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Billing history</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 text-left">Period</th>
                        <th className="px-2 py-2 text-left">Plan</th>
                        <th className="px-2 py-2 text-right">Amount (₹)</th>
                        <th className="px-2 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="border-b last:border-0">
                          <td className="px-2 py-2">
                            {new Date(inv.periodStart).toLocaleDateString()}
                            {' – '}
                            {new Date(inv.periodEnd).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-2">{inv.plan.toUpperCase()}</td>
                          <td className="px-2 py-2 text-right">
                            {inv.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={
                                inv.status === BillingInvoiceStatus.PAID
                                  ? 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                                  : 'inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700'
                              }
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Saved payment methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Visa **** 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 08/26 · Primary</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">UPI mandate</p>
                    <p className="text-xs text-muted-foreground">
                      Link a UPI ID for recurring payments (future)
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Add UPI
                  </Button>
                </div>

                <Button className="w-full">
                  Add new payment method
                </Button>
                <p className="text-xs text-muted-foreground">
                  This is sample data. In production, this section will be backed
                  by Razorpay or Cashfree customer &amp; card APIs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Auto-pay settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-pay</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically charge your default method for new invoices.
                    </p>
                  </div>
                  <Switch
                    checked={autoPayEnabled}
                    onCheckedChange={(value) => setAutoPayEnabled(Boolean(value))}
                  />
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground text-sm mb-1">How this will work</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>At month-end, an invoice is generated for your usage.</li>
                    <li>TrizenHR sends a payment notification and charges the saved method.</li>
                    <li>If payment fails, we&apos;ll email your billing contacts to update details.</li>
                  </ul>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <HelpCircle className="mt-0.5 h-4 w-4" />
                  <p>
                    In this environment, no real payments are made. Amounts shown on the Overview
                    tab are calculated from your plan and active employee count.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Billing profile &amp; preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Legal company name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Trizen Ventures Pvt. Ltd."
                    defaultValue={overview?.organizationName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing email</Label>
                  <Input
                    id="billingEmail"
                    placeholder="billing@company.com"
                    defaultValue={user?.email}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Place of supply (State)</Label>
                  <Input id="state" placeholder="Karnataka" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="India" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceRecipients">Send invoices to</Label>
                <Input
                  id="invoiceRecipients"
                  placeholder="finance@company.com, accounts@company.com"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of email addresses that will receive invoice PDFs and payment
                  notifications.
                </p>
              </div>

              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">Notification preferences</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Payment reminders</p>
                    <p className="text-xs text-muted-foreground">
                      Remind billing contacts before due dates.
                    </p>
                  </div>
                  <Switch
                    checked={notifyReminders}
                    onCheckedChange={(value) => setNotifyReminders(Boolean(value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Payment failures</p>
                    <p className="text-xs text-muted-foreground">
                      Notify when a charge fails and requires attention.
                    </p>
                  </div>
                  <Switch
                    checked={notifyFailures}
                    onCheckedChange={(value) => setNotifyFailures(Boolean(value))}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                This form is read-only in this environment. In production, Company Admins will be
                able to update billing profile and notification settings directly from here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                id: SubscriptionPlan.BASIC,
                name: 'Starter',
                description: 'Up to 50 employees',
                price: 1,
                highlighted: overview?.subscriptionPlan === SubscriptionPlan.BASIC,
              },
              {
                id: SubscriptionPlan.PREMIUM,
                name: 'Growth',
                description: 'Up to 200 employees',
                price: 2,
                highlighted: overview?.subscriptionPlan === SubscriptionPlan.PREMIUM,
              },
              {
                id: SubscriptionPlan.ENTERPRISE,
                name: 'Enterprise',
                description: '200+ employees',
                price: null,
                highlighted: overview?.subscriptionPlan === SubscriptionPlan.ENTERPRISE,
              },
            ].map((plan) => (
              <Card
                key={plan.id}
                className={
                  plan.highlighted
                    ? 'border-primary shadow-md shadow-primary/10'
                    : 'border-border'
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {plan.name}
                    </CardTitle>
                    {plan.highlighted && (
                      <Badge className="text-xs" variant="outline">
                        Current plan
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    {plan.price != null ? (
                      <>
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <span className="text-xl font-semibold">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">
                          / user / day
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold">Contact sales</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>Core attendance &amp; payroll</li>
                    {plan.id !== SubscriptionPlan.BASIC && (
                      <li>Advanced reports &amp; analytics</li>
                    )}
                    {plan.id === SubscriptionPlan.ENTERPRISE && (
                      <li>Custom workflows, SLAs &amp; dedicated support</li>
                    )}
                  </ul>
                  <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                    {plan.price != null ? 'Change plan' : 'Contact sales'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

