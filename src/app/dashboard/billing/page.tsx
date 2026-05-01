'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { billingApi } from '@/lib/api';
import { BillingOverview, BillingInvoice, UserRole } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { BillingOverviewTab } from '@/components/billing/BillingOverviewTab';
import { BillingHistoryTab } from '@/components/billing/BillingHistoryTab';
import { BillingPaymentsTab } from '@/components/billing/BillingPaymentsTab';
import { BillingPreferencesTab } from '@/components/billing/BillingPreferencesTab';
import { BillingPricingTab } from '@/components/billing/BillingPricingTab';

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
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
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push('/dashboard/settings')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">
            View your plan, monthly usage, and invoice history.
          </p>
        </div>
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
          <BillingOverviewTab overview={overview} loading={loadingOverview} />
        </TabsContent>

        <TabsContent value="history">
          <BillingHistoryTab invoices={invoices} loading={loadingInvoices} />
        </TabsContent>

        <TabsContent value="payments">
          <BillingPaymentsTab
            autoPayEnabled={autoPayEnabled}
            onAutoPayChange={setAutoPayEnabled}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <BillingPreferencesTab
            overview={overview}
            billingEmail={user.email}
            notifyReminders={notifyReminders}
            notifyFailures={notifyFailures}
            onNotifyRemindersChange={setNotifyReminders}
            onNotifyFailuresChange={setNotifyFailures}
          />
        </TabsContent>

        <TabsContent value="pricing">
          <BillingPricingTab overview={overview} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

