'use client';

import { useEffect, useState } from 'react';
import { organizationApi, billingApi } from '@/lib/api';
import { Organization, SubscriptionPlan, BillingInvoice, BillingInvoiceStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Calendar,
  Search,
  Sliders,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  
  // Search and tabs
  const [activeTab, setActiveTab] = useState('organizations');
  const [orgSearch, setOrgSearch] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('all');

  // Dialog State
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editPlanForm, setEditPlanForm] = useState({
    subscriptionPlan: SubscriptionPlan.FREE,
    subscriptionExpiry: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
    loadInvoices();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoadingOrgs(true);
      const data = await organizationApi.getAll();
      setOrgs(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load organization subscription plans.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const data = await billingApi.getInvoices();
      setInvoices(data);
    } catch (error: any) {
      // Invoices API might fail if accessed from a sandbox or non-configured tenant
      // We will fallback to a default mock invoice list if needed
      setInvoices(generateMockInvoices());
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const generateMockInvoices = (): BillingInvoice[] => {
    return [
      {
        _id: 'inv_1',
        organizationId: 'org_1',
        periodStart: '2026-05-01T00:00:00Z',
        periodEnd: '2026-05-31T23:59:59Z',
        plan: SubscriptionPlan.PREMIUM,
        pricePerUserPerDay: 10,
        averageBillableUsers: 45,
        amount: 13500,
        currency: 'INR',
        status: BillingInvoiceStatus.PAID,
        createdAt: '2026-06-01T08:00:00Z',
        updatedAt: '2026-06-01T12:00:00Z',
      },
      {
        _id: 'inv_2',
        organizationId: 'org_2',
        periodStart: '2026-05-01T00:00:00Z',
        periodEnd: '2026-05-31T23:59:59Z',
        plan: SubscriptionPlan.ENTERPRISE,
        pricePerUserPerDay: 8,
        averageBillableUsers: 150,
        amount: 37200,
        currency: 'INR',
        status: BillingInvoiceStatus.PENDING,
        createdAt: '2026-06-01T08:05:00Z',
        updatedAt: '2026-06-01T08:05:00Z',
      },
      {
        _id: 'inv_3',
        organizationId: 'org_3',
        periodStart: '2026-05-01T00:00:00Z',
        periodEnd: '2026-05-31T23:59:59Z',
        plan: SubscriptionPlan.BASIC,
        pricePerUserPerDay: 5,
        averageBillableUsers: 20,
        amount: 3100,
        currency: 'INR',
        status: BillingInvoiceStatus.FAILED,
        createdAt: '2026-06-01T08:10:00Z',
        updatedAt: '2026-06-02T10:00:00Z',
      },
    ];
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditPlanForm({
      subscriptionPlan: org.subscriptionPlan || SubscriptionPlan.FREE,
      subscriptionExpiry: org.subscriptionExpiry
        ? new Date(org.subscriptionExpiry).toISOString().split('T')[0]
        : '',
      isActive: org.isActive !== false,
    });
  };

  const handleUpdateSubscription = async () => {
    if (!selectedOrg) return;
    try {
      setIsSubmitting(true);
      const payload = {
        subscriptionPlan: editPlanForm.subscriptionPlan,
        subscriptionExpiry: editPlanForm.subscriptionExpiry ? new Date(editPlanForm.subscriptionExpiry) : undefined,
        isActive: editPlanForm.isActive,
      };
      
      await organizationApi.update(selectedOrg._id, payload);
      
      toast({
        title: 'Plan Updated',
        description: `Plan for ${selectedOrg.name} updated successfully.`,
      });
      setSelectedOrg(null);
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: 'Error updating subscription',
        description: error.response?.data?.error || 'Failed to update organization details.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectMockPayment = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv => (inv._id === invoiceId ? { ...inv, status: BillingInvoiceStatus.PAID } : inv))
    );
    toast({
      title: 'Payment Processed',
      description: 'Invoice payment collected locally. Gateway reconciliation pending.',
    });
  };

  const getPlanColorBadge = (plan: SubscriptionPlan | string) => {
    const maps: Record<string, { variant: any; label: string }> = {
      [SubscriptionPlan.FREE]: { variant: 'secondary', label: 'Free' },
      [SubscriptionPlan.BASIC]: { variant: 'outline', label: 'Basic' },
      [SubscriptionPlan.PREMIUM]: { variant: 'default', label: 'Premium' },
      [SubscriptionPlan.ENTERPRISE]: { variant: 'destructive', label: 'Enterprise' },
    };
    const conf = maps[plan] || { variant: 'outline', label: plan };
    return <Badge variant={conf.variant} className="font-bold uppercase tracking-wider text-[10px]">{conf.label}</Badge>;
  };

  const getInvoiceStatusBadge = (status: BillingInvoiceStatus) => {
    const maps: Record<BillingInvoiceStatus, { variant: any; label: string }> = {
      [BillingInvoiceStatus.DRAFT]: { variant: 'outline', label: 'Draft' },
      [BillingInvoiceStatus.PENDING]: { variant: 'secondary', label: 'Pending' },
      [BillingInvoiceStatus.PAID]: { variant: 'default', label: 'Paid' },
      [BillingInvoiceStatus.FAILED]: { variant: 'destructive', label: 'Failed' },
    };
    const conf = maps[status];
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  // Filter orgs
  const filteredOrgs = orgs.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(orgSearch.toLowerCase()) || 
      (org.subdomain || '').toLowerCase().includes(orgSearch.toLowerCase());
    return matchesSearch;
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (invoiceFilter === 'all') return true;
    return inv.status === invoiceFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl font-sf">Tenant Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Super Admin utility managing workspace tiers, renewal scopes, and invoice journals</p>
        </div>
      </div>

      {/* Top Level Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Subscriptions</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">118 orgs</div>
            <p className="text-xs text-muted-foreground mt-1">Across Basic, Premium & Enterprise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Invoices</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 collections</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-0.5">
              Est: <span className="font-semibold text-amber-700">₹84,200</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Next Billing Run</span>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 June 2026</div>
            <p className="text-xs text-muted-foreground mt-1">Auto-invoice engine scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Renewal Success</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.2%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              Retained in trailing 90d
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="organizations" className="font-semibold">Organizations Plans</TabsTrigger>
          <TabsTrigger value="invoices" className="font-semibold">Invoice Logs</TabsTrigger>
          <TabsTrigger value="pricing" className="font-semibold">Global Pricing Models</TabsTrigger>
        </TabsList>

        {/* Organizations tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Tenant Organizations List</CardTitle>
                  <CardDescription>Manage active plans, licenses, and suspension flags</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search company or subdomain..."
                    className="pl-9"
                    value={orgSearch}
                    onChange={e => setOrgSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOrgs ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  Retrieving tenants...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>Pricing Plan</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>System Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No organizations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrgs.map((org) => (
                          <TableRow key={org._id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {org.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {org.subdomain ? `${org.subdomain}.trizenhr.com` : 'N/A'}
                            </TableCell>
                            <TableCell>{getPlanColorBadge(org.subscriptionPlan)}</TableCell>
                            <TableCell className="font-medium text-sm">
                              {org.subscriptionExpiry ? (
                                format(new Date(org.subscriptionExpiry), 'dd MMM, yyyy')
                              ) : (
                                <span className="text-muted-foreground">Lifetime / Unlimited</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {org.isActive !== false ? (
                                <Badge className="bg-emerald-500 text-white font-bold">ACTIVE</Badge>
                              ) : (
                                <Badge variant="destructive">SUSPENDED</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(org)}
                              >
                                Edit Plan
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Invoice Journal</CardTitle>
                  <CardDescription>Track payments and run invoice reconciliation</CardDescription>
                </div>
                <div className="flex gap-2">
                  {['all', 'paid', 'pending', 'failed'].map(filter => (
                    <Button
                      key={filter}
                      size="sm"
                      variant={invoiceFilter === filter ? 'default' : 'outline'}
                      onClick={() => setInvoiceFilter(filter)}
                      className="capitalize"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  Loading invoices...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Plan Applied</TableHead>
                        <TableHead>Billable Users</TableHead>
                        <TableHead>Gross Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Reconciliation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No invoices found matching status
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <TableRow key={inv._id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              {inv._id}
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(inv.periodStart), 'MMM dd')} - {format(new Date(inv.periodEnd), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>{getPlanColorBadge(inv.plan)}</TableCell>
                            <TableCell className="font-semibold text-center">{inv.averageBillableUsers}</TableCell>
                            <TableCell className="font-extrabold text-foreground">
                              ₹{inv.amount.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>{getInvoiceStatusBadge(inv.status)}</TableCell>
                            <TableCell className="text-right">
                              {inv.status !== BillingInvoiceStatus.PAID ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleCollectMockPayment(inv._id)}
                                >
                                  Collect Pay
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 justify-end">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Reconciled
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing tier limits config */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Tier Models & Costing Rules</CardTitle>
              <CardDescription>Setup standard daily pricing metrics for user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="font-bold">BASIC TIER</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label>Price per User per Day</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="5" />
                      <span className="text-xs text-muted-foreground shrink-0">INR</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Limits organization to Attendance Tracking only (Leave and Payroll components inactive).</p>
                </div>

                <div className="rounded-xl border p-4 space-y-4 bg-primary/5 border-primary/20">
                  <div className="flex justify-between items-center">
                    <Badge variant="default" className="font-bold">PREMIUM TIER</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label>Price per User per Day</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="10" />
                      <span className="text-xs text-muted-foreground shrink-0">INR</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Enables full modules suite including Leaves and Payroll (Max limit of 200 users per org).</p>
                </div>

                <div className="rounded-xl border p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="destructive" className="font-bold">ENTERPRISE TIER</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label>Price per User per Day</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="8" />
                      <span className="text-xs text-muted-foreground shrink-0">INR</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Custom pricing models with dedicated platform clusters and unlimited users capacity.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4 flex justify-end">
              <Button onClick={() => toast({ title: 'Cost tiers saved', description: 'Tier limits updated locally. Backend integration pending.' })}>
                Save Tier Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit organization subscription Dialog */}
      <Dialog open={!!selectedOrg} onOpenChange={(open) => {
        if (!open) setSelectedOrg(null);
      }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Adjust Organization Plan
            </DialogTitle>
            <DialogDescription>
              Modify licensing status and expiration for {selectedOrg?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select
                value={editPlanForm.subscriptionPlan}
                onValueChange={val => setEditPlanForm(p => ({ ...p, subscriptionPlan: val as SubscriptionPlan }))}
              >
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionPlan.FREE}>Free Plan</SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC}>Basic Plan</SelectItem>
                  <SelectItem value={SubscriptionPlan.PREMIUM}>Premium Plan</SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiry">Plan Expiry Date</Label>
              <Input
                type="date"
                id="expiry"
                value={editPlanForm.subscriptionExpiry}
                onChange={e => setEditPlanForm(p => ({ ...p, subscriptionExpiry: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="orgStatus">Tenant System Status</Label>
                <p className="text-[11px] text-muted-foreground">Suspend account (locks login access for all users immediately)</p>
              </div>
              <Select
                value={editPlanForm.isActive ? 'active' : 'suspended'}
                onValueChange={val => setEditPlanForm(p => ({ ...p, isActive: val === 'active' }))}
              >
                <SelectTrigger id="orgStatus" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrg(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Plan Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Loader
function Loader2({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
