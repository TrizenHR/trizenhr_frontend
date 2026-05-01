import { SubscriptionPlan, BillingOverview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';

interface BillingPricingTabProps {
  overview: BillingOverview | null;
}

export function BillingPricingTab({ overview }: BillingPricingTabProps) {
  const currentPlan = overview?.subscriptionPlan;

  const plans = [
    {
      id: SubscriptionPlan.BASIC,
      name: 'Starter',
      description: 'Up to 50 employees',
      price: 1,
      highlighted: currentPlan === SubscriptionPlan.BASIC,
    },
    {
      id: SubscriptionPlan.PREMIUM,
      name: 'Growth',
      description: 'Up to 200 employees',
      price: 2,
      highlighted: currentPlan === SubscriptionPlan.PREMIUM,
    },
    {
      id: SubscriptionPlan.ENTERPRISE,
      name: 'Enterprise',
      description: '200+ employees',
      price: null,
      highlighted: currentPlan === SubscriptionPlan.ENTERPRISE,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={
            plan.highlighted ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
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
                  <span className="text-xs text-muted-foreground">/ user / day</span>
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
  );
}

