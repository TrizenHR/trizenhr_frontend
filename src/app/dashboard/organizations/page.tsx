'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { organizationApi, userApi } from '@/lib/api';
import { requestNotificationsRefresh } from '@/lib/notifications-events';
import { Organization, SubscriptionPlan, CreateOrganizationPayload, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Building2,
  CheckCircle,
  Edit,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [companyAdminNames, setCompanyAdminNames] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewedOrg, setViewedOrg] = useState<Organization | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingOrgId, setTogglingOrgId] = useState<string | null>(null);
  const [subdomainCheck, setSubdomainCheck] = useState<
    { status: 'idle' | 'checking' | 'available' | 'taken'; value?: string } | undefined
  >({ status: 'idle' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOrganizationPayload>({
    name: '',
    subdomain: '',
    subscriptionPlan: SubscriptionPlan.FREE,
    microsoftAuth: {
      tenantId: '',
      domain: '',
      allowMicrosoftAuth: false,
      allowLocalAuth: true,
    },
    isActive: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchQuery, statusFilter, planFilter]);

  const normalizeSubdomainSlug = (value: string | undefined) => {
    const v = (value ?? '').trim().toLowerCase();
    if (!v) return '';
    return (v.includes('.') ? v.split('.')[0] : v) || '';
  };

  // Realtime subdomain availability (best-effort, based on current org list).
  useEffect(() => {
    const slug = normalizeSubdomainSlug(formData.subdomain);
    if (!slug) {
      setSubdomainCheck({ status: 'idle' });
      return;
    }

    setSubdomainCheck({ status: 'checking', value: slug });
    const t = window.setTimeout(() => {
      const taken = organizations.some((o) => {
        if (currentOrgId && o._id === currentOrgId) return false;
        return normalizeSubdomainSlug(o.subdomain) === slug;
      });
      setSubdomainCheck({ status: taken ? 'taken' : 'available', value: slug });
    }, 350);
    return () => window.clearTimeout(t);
  }, [formData.subdomain, organizations, currentOrgId]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await organizationApi.getAll();
      setOrganizations(data);

      // For System Admin view: resolve company admin for each organization
      const adminEntries = await Promise.all(
        data.map(async (org) => {
          try {
            const admins = await userApi.getAllUsers({
              role: UserRole.ADMIN,
              isActive: true,
              organizationId: org._id,
            });
            const admin = admins[0];
            const name = admin
              ? admin.fullName || `${admin.firstName} ${admin.lastName}`.trim() || admin.email
              : '-';
            return [org._id, name] as const;
          } catch {
            return [org._id, '-'] as const;
          }
        })
      );

      setCompanyAdminNames(Object.fromEntries(adminEntries));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.subdomain?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((org) => org.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((org) => !org.isActive);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter((org) => org.subscriptionPlan === planFilter);
    }

    setFilteredOrganizations(filtered);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || planFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (subdomainCheck?.status === 'taken') {
        toast({
          title: 'Subdomain unavailable',
          description: 'That subdomain is already in use. Please choose a different one.',
          variant: 'destructive',
        });
        return;
      }
      if (isEditing && currentOrgId) {
        await organizationApi.update(currentOrgId, formData);
        toast({
          title: 'Success',
          description: 'Organization updated successfully',
        });
      } else {
        await organizationApi.create(formData);
        toast({
          title: 'Success',
          description: 'Organization created successfully',
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleView = (org: Organization) => {
    setViewedOrg(org);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setIsViewDialogOpen(false);
    setViewedOrg(null);
    setIsEditing(true);
    setCurrentOrgId(org._id);
    setFormData({
      name: org.name,
      subdomain: org.subdomain,
      subscriptionPlan: org.subscriptionPlan,
      isActive: org.isActive,
      microsoftAuth: {
        tenantId: org.microsoftAuth?.tenantId || '',
        domain: org.microsoftAuth?.domain || '',
        allowMicrosoftAuth: org.microsoftAuth?.allowMicrosoftAuth || false,
        allowLocalAuth: org.microsoftAuth?.allowLocalAuth ?? true,
      },
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (org: Organization, nextActive: boolean) => {
    try {
      setTogglingOrgId(org._id);
      await organizationApi.update(org._id, { isActive: nextActive });
      toast({
        title: 'Status updated',
        description: nextActive
          ? 'Organization is now active.'
          : 'Organization is now inactive (data is retained).',
      });
      await loadOrganizations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Could not update organization status.',
        variant: 'destructive',
      });
    } finally {
      setTogglingOrgId(null);
    }
  };

  const handleRequestDelete = (org: Organization) => {
    setDeleteOrg(org);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrg?._id || isDeleting) return;

    try {
      setIsDeleting(true);
      const id = deleteOrg._id;

      // Optimistic UI: remove immediately from table while request is in-flight.
      setOrganizations((prev) => prev.filter((o) => o._id !== id));
      setFilteredOrganizations((prev) => prev.filter((o) => o._id !== id));

      await organizationApi.delete(id);
      requestNotificationsRefresh();
      toast({
        title: 'Organization removed',
        description: 'The organization and all related data were permanently deleted.',
      });
      setIsDeleteDialogOpen(false);
      setDeleteOrg(null);
      loadOrganizations();
    } catch (error: any) {
      loadOrganizations();
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete organization',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subdomain: '',
      subscriptionPlan: SubscriptionPlan.FREE,
      microsoftAuth: {
        tenantId: '',
        domain: '',
        allowMicrosoftAuth: false,
        allowLocalAuth: true,
      },
      isActive: true,
    });
    setIsEditing(false);
    setCurrentOrgId(null);
  };

  const getPlanBadgeClass = (plan: SubscriptionPlan) => {
    const map: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'border-border bg-muted/70 text-foreground',
      [SubscriptionPlan.BASIC]: 'border-primary/25 bg-primary/5 text-foreground',
      [SubscriptionPlan.PREMIUM]: 'border-primary/35 bg-primary/10 text-foreground',
      [SubscriptionPlan.ENTERPRISE]: 'border-primary/45 bg-primary/15 text-foreground',
    };
    return map[plan] || 'border-border bg-muted/70 text-foreground';
  };

  const stats = {
    total: organizations.length,
    active: organizations.filter((o) => o.isActive).length,
    inactive: organizations.filter((o) => !o.isActive).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 lg:space-y-6">
      {/* Hero — compact (~2× app header height) */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/15">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div className="relative flex min-h-[7.5rem] flex-col justify-center gap-3 px-4 py-3.5 sm:min-h-[8rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5 md:py-4">
          <div className="min-w-0 space-y-1.5">
            <span className="inline-flex w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              Platform
            </span>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Organizations</h1>
            <p className="max-w-2xl text-sm leading-snug text-primary-foreground/85 sm:line-clamp-2">
              Search, filter, and manage client organizations. Create admins, edit plans, and keep access
              aligned with your policies.
            </p>
          </div>
          <Button
            className="h-9 shrink-0 rounded-lg border-0 bg-primary-foreground px-4 text-sm font-semibold text-primary shadow-sm hover:bg-primary-foreground/90 sm:self-center"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add organization
          </Button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between gap-3 pt-4 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{stats.total}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
              <Building2 className="h-4 w-4" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between gap-3 pt-4 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Active
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{stats.active}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
              <CheckCircle className="h-4 w-4" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between gap-3 pt-4 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Inactive
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{stats.inactive}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground ring-1 ring-border/60">
              <XCircle className="h-4 w-4" aria-hidden />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & filters */}
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <CardHeader className="border-b border-border/60 pb-2.5 pt-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
              <CardTitle className="text-sm font-semibold">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-2 text-muted-foreground"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2">
            <div className="md:col-span-6">
              <Label htmlFor="org-search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="org-search"
                  placeholder="Search name or subdomain…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="org-status" className="sr-only">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="org-status" className="h-9 rounded-xl">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="org-plan" className="sr-only">
                Plan
              </Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger id="org-plan" className="h-9 rounded-xl">
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                  <SelectItem value={SubscriptionPlan.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations table */}
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <CardHeader className="flex flex-col gap-0.5 border-b border-border/60 pb-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">Directory</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading organizations…'
                
                : `${filteredOrganizations.length} of ${organizations.length} shown`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 px-4 py-4 md:px-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                Loading organizations…
              </div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center md:px-6 md:py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground ring-1 ring-border/50">
                <Building2 className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No organizations yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first organization to onboard clients and manage users.
              </p>
              <Button
                className="mt-6 rounded-xl"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add organization
              </Button>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center md:px-6 md:py-12">
              <p className="text-sm font-medium text-foreground">No matching organizations</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Try adjusting your search or filters to see more results.
              </p>
              <Button type="button" variant="outline" className="mt-4 rounded-xl" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="border-t border-border/60 px-4 pb-3 md:px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="h-10 min-w-[140px] bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company admin
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subdomain
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Plan
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Active
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Created
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org._id} className="border-border/60 transition-colors hover:bg-muted/35">
                      <TableCell className="px-3 py-2.5">
                        <button
                          type="button"
                          className="max-w-[min(100%,18rem)] cursor-pointer text-left text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleView(org)}
                        >
                          {org.name}
                        </button>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
                        {companyAdminNames[org._id] || '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 font-mono text-xs text-foreground">
                        {org.subdomain || '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <Badge
                          className={cn(
                            'border font-medium uppercase tracking-wide shadow-none',
                            getPlanBadgeClass(org.subscriptionPlan)
                          )}
                          variant="outline"
                        >
                          {org.subscriptionPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {togglingOrgId === org._id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                          ) : (
                            <Switch
                              checked={org.isActive}
                              onCheckedChange={(checked) => handleToggleActive(org, checked)}
                              disabled={togglingOrgId !== null}
                              aria-label={
                                org.isActive ? 'Deactivate organization' : 'Activate organization'
                              }
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {org.isActive ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
                        {format(new Date(org.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" asChild>
                            <Link
                              href={`/dashboard/users/create?orgId=${encodeURIComponent(org._id)}`}
                              title="Create company admin"
                              prefetch={false}
                            >
                              <Users className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                            type="button"
                            title="Edit organization"
                            onClick={() => handleEdit(org)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            type="button"
                            title="Delete organization"
                            onClick={() => handleRequestDelete(org)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View details */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) setViewedOrg(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-border/80 bg-card shadow-lg ring-1 ring-border/40">
          {viewedOrg ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{viewedOrg.name}</DialogTitle>
                <DialogDescription>
                  Read-only summary. Use Edit to change details or Create admin to add a company
                  administrator.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>
                    <div className="mt-1">
                      {viewedOrg.isActive ? (
                        <Badge className="border border-primary/25 bg-primary/10 font-medium text-primary">Active</Badge>
                      ) : (
                        <Badge className="border border-border bg-muted font-medium text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Subscription plan
                    </p>
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          'border font-medium uppercase tracking-wide shadow-none',
                          getPlanBadgeClass(viewedOrg.subscriptionPlan)
                        )}
                        variant="outline"
                      >
                        {viewedOrg.subscriptionPlan}
                      </Badge>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Subdomain
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{viewedOrg.subdomain || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Company admin
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {companyAdminNames[viewedOrg._id] || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Created
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {format(new Date(viewedOrg.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Last updated
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {format(new Date(viewedOrg.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {viewedOrg.subscriptionExpiry && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Subscription renews / expires
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {format(new Date(viewedOrg.subscriptionExpiry), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Working hours and timezone
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {viewedOrg.settings?.workingHours?.startTime ?? '—'} –{' '}
                    {viewedOrg.settings?.workingHours?.endTime ?? '—'} ·{' '}
                    {viewedOrg.settings?.timezone ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiscal year starts month {viewedOrg.settings?.fiscalYearStart ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Authentication
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    <li>
                      Microsoft sign-in:{' '}
                      <span className="font-medium">
                        {viewedOrg.microsoftAuth?.allowMicrosoftAuth ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                    <li>
                      Email / password login:{' '}
                      <span className="font-medium">
                        {viewedOrg.microsoftAuth?.allowLocalAuth !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                    {viewedOrg.microsoftAuth?.domain ? (
                      <li className="text-muted-foreground">Domain: {viewedOrg.microsoftAuth.domain}</li>
                    ) : null}
                  </ul>
                </div>
              </div>

              <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button variant="secondary" className="rounded-xl" asChild>
                  <Link
                    href={`/dashboard/users/create?orgId=${encodeURIComponent(viewedOrg._id)}`}
                    prefetch={false}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Create admin
                  </Link>
                </Button>
                <Button type="button" className="rounded-xl" onClick={() => handleEdit(viewedOrg)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit organization
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col rounded-2xl border-border/80 bg-card shadow-lg ring-1 ring-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {isEditing ? 'Edit organization' : 'Create organization'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update organization details.' : 'Add a new client organization.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 px-1">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                  <Input
                    id="subdomain"
                    placeholder="acme"
                    value={formData.subdomain || ''}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  />
                  {normalizeSubdomainSlug(formData.subdomain) ? (
                    <div className="flex items-center gap-2 text-xs">
                      {subdomainCheck?.status === 'checking' ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />
                          <span className="text-muted-foreground">Checking availability…</span>
                        </>
                      ) : subdomainCheck?.status === 'available' ? (
                        <span className="text-primary">Subdomain is available.</span>
                      ) : subdomainCheck?.status === 'taken' ? (
                        <span className="text-destructive">Subdomain is already taken.</span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Used for your tenant URL (e.g. <span className="font-medium">acme</span>.trizenhr.com).
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subscriptionPlan: value as SubscriptionPlan })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                      <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                      <SelectItem value={SubscriptionPlan.PREMIUM}>Premium</SelectItem>
                      <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/25 p-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">Organization active</Label>
                      <p className="text-xs text-muted-foreground">
                        Inactive organizations stay in this list. Use delete only to permanently remove an
                        organization and all of its data.
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                )}
              </div>

              {/* Microsoft Authentication Section */}
              <div className="border-t border-border/60 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Authentication settings</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/25 p-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">Microsoft Sign-In</Label>
                      <p className="text-xs text-muted-foreground">Allow users to authenticate with their Microsoft accounts</p>
                    </div>
                    <Switch
                      checked={formData.microsoftAuth?.allowMicrosoftAuth || false}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({
                          ...formData,
                          microsoftAuth: { 
                            tenantId: formData.microsoftAuth?.tenantId || '',
                            domain: formData.microsoftAuth?.domain || '',
                            allowMicrosoftAuth: checked,
                            allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/25 p-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">Email/Password Login</Label>
                      <p className="text-xs text-muted-foreground">Allow traditional email and password authentication</p>
                    </div>
                    <Switch
                      checked={formData.microsoftAuth?.allowLocalAuth ?? true}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({
                          ...formData,
                          microsoftAuth: {
                            tenantId: formData.microsoftAuth?.tenantId || '',
                            domain: formData.microsoftAuth?.domain || '',
                            allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                            allowLocalAuth: checked,
                          },
                        })
                      }
                    />
                  </div>

                  {formData.microsoftAuth?.allowMicrosoftAuth && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="domain" className="text-sm font-medium">Email Domain</Label>
                        <Input
                          id="domain"
                          placeholder="e.g., trizenventures.com"
                          value={formData.microsoftAuth?.domain || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              microsoftAuth: {
                                tenantId: formData.microsoftAuth?.tenantId || '',
                                domain: e.target.value,
                                allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                                allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                              },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">Optional: Match users by their email domain</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenantId" className="text-sm font-medium">Azure AD Tenant ID</Label>
                        <Input
                          id="tenantId"
                          placeholder="e.g., 12345678-abcd-1234-5678-abcdef123456"
                          value={formData.microsoftAuth?.tenantId || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              microsoftAuth: {
                                tenantId: e.target.value,
                                domain: formData.microsoftAuth?.domain || '',
                                allowMicrosoftAuth: formData.microsoftAuth?.allowMicrosoftAuth || false,
                                allowLocalAuth: formData.microsoftAuth?.allowLocalAuth ?? true,
                              },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">Optional: Restrict access to a specific Azure AD tenant</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 gap-2 border-t border-border/60 pt-4 sm:justify-end">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleCreateOrUpdate}
              disabled={subdomainCheck?.status === 'taken'}
            >
              {isEditing ? 'Save changes' : 'Create organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setIsDeleteDialogOpen(open);
          if (!open) setDeleteOrg(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/80 bg-card shadow-lg ring-1 ring-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Permanently delete organization?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This will <span className="font-medium text-foreground">permanently remove</span>{' '}
              <span className="font-semibold text-foreground">{deleteOrg?.name || 'this organization'}</span>{' '}
              and all related data (users, attendance, payroll, leaves, departments, and other tenant
              records). To pause an org without deleting data, turn it <span className="font-medium">inactive</span>{' '}
              using the Active toggle instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Confirm delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
