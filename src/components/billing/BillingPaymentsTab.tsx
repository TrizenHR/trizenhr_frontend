import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CreditCard, HelpCircle } from 'lucide-react';

interface BillingPaymentsTabProps {
  autoPayEnabled: boolean;
  onAutoPayChange: (value: boolean) => void;
}

export function BillingPaymentsTab({
  autoPayEnabled,
  onAutoPayChange,
}: BillingPaymentsTabProps) {
  return (
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

          <Button className="w-full">Add new payment method</Button>
          <p className="text-xs text-muted-foreground">
            This is sample data. In production, this section will be backed by Razorpay or Cashfree
            customer &amp; card APIs.
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
              onCheckedChange={(value) => onAutoPayChange(Boolean(value))}
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
              In this environment, no real payments are made. Amounts shown on the Overview tab are
              calculated from your plan and active employee count.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

