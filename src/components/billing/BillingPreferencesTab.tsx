import { BillingOverview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BillingPreferencesTabProps {
  overview: BillingOverview | null;
  billingEmail?: string;
  notifyReminders: boolean;
  notifyFailures: boolean;
  onNotifyRemindersChange: (value: boolean) => void;
  onNotifyFailuresChange: (value: boolean) => void;
}

export function BillingPreferencesTab({
  overview,
  billingEmail,
  notifyReminders,
  notifyFailures,
  onNotifyRemindersChange,
  onNotifyFailuresChange,
}: BillingPreferencesTabProps) {
  return (
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
              defaultValue={billingEmail}
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
              onCheckedChange={(value) => onNotifyRemindersChange(Boolean(value))}
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
              onCheckedChange={(value) => onNotifyFailuresChange(Boolean(value))}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This form is read-only in this environment. In production, Company Admins will be
          able to update billing profile and notification settings directly from here.
        </p>
      </CardContent>
    </Card>
  );
}

