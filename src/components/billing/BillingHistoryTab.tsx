import { BillingInvoice, BillingInvoiceStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BillingHistoryTabProps {
  invoices: BillingInvoice[];
  loading: boolean;
}

export function BillingHistoryTab({ invoices, loading }: BillingHistoryTabProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading invoices...</p>;
  }

  if (invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No invoices yet. Once billing is enabled in this environment, invoices will appear here.
      </p>
    );
  }

  return (
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
  );
}

