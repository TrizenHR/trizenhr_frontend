'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { organizationApi, userApi, departmentApi } from '@/lib/api';
import { Organization, User, Department, UserRole, SubscriptionPlan } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Edit,
  Globe,
  Loader2,
  Mail,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { getRoleDisplayName } from '@/lib/permissions';

export default function CompanyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const orgId = params?.id;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!orgId) return;
    loadOrganizationAndEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadOrganizationAndEmployees = async () => {
    if (!orgId) return;
    try {
      setIsLoading(true);
      const [orgData, usersData, deptData] = await Promise.all([
        organizationApi.getById(orgId).catch((err) => {
          console.error('Failed to load organization:', err);
          return null;
        }),
        userApi.getAllUsers({ organizationId: orgId }).catch((err) => {
          console.error('Failed to load employees:', err);
          return [] as User[];
        }),
        departmentApi.getAll(orgId).catch((err) => {
          console.error('Failed to load departments:', err);
          return [] as Department[];
        }),
      ]);

      if (!orgData) {
        toast({
          title: 'Organization Not Found',
          description: 'The requested company could not be located.',
          variant: 'destructive',
        });
        router.push('/dashboard/organizations');
        return;
      }

      setOrganization(orgData);
      setEmployees(usersData);
      setDepartments(deptData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load company details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Find company admin from employee list or fetch
  const companyAdmin = useMemo(() => {
    return (
      employees.find((e) => e.role === UserRole.ADMIN && e.isActive) ||
      employees.find((e) => e.role === UserRole.ADMIN) ||
      null
    );
  }, [employees]);

  // Unique departments from employees or fetched departments
  const availableDepartments = useMemo(() => {
    const fromEmployees = employees
      .map((e) => e.department?.trim())
      .filter((d): d is string => Boolean(d));
    const fromDepts = departments.map((d) => d.name.trim()).filter(Boolean);
    return Array.from(new Set([...fromEmployees, ...fromDepts]));
  }, [employees, departments]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.isActive).length;
    const inactive = total - active;
    const deptCount = availableDepartments.length;
    return { total, active, inactive, deptCount };
  }, [employees, availableDepartments]);

  // Filtering
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const fullName = (e.fullName || `${e.firstName} ${e.lastName}`).toLowerCase();
        const email = (e.email || '').toLowerCase();
        const designation = (e.designation || getRoleDisplayName(e.role) || '').toLowerCase();
        const dept = (e.department || '').toLowerCase();
        const empId = (e.employeeId || '').toLowerCase();
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          designation.includes(q) ||
          dept.includes(q) ||
          empId.includes(q)
        );
      });
    }

    if (departmentFilter !== 'all') {
      result = result.filter(
        (e) => (e.department || '').trim().toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    if (statusFilter === 'active') {
      result = result.filter((e) => e.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter((e) => !e.isActive);
    }

    if (roleFilter !== 'all') {
      result = result.filter((e) => e.role === roleFilter);
    }

    return result;
  }, [employees, searchQuery, departmentFilter, statusFilter, roleFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    departmentFilter !== 'all' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  const handleResendInvitation = async (employee: User) => {
    const id = employee.id || employee._id;
    if (employee.role === UserRole.SUPER_ADMIN) {
      toast({
        title: 'Not allowed',
        description: 'Cannot resend invitation for system admins',
        variant: 'destructive',
      });
      return;
    }

    try {
      setResendingId(id);
      const res = await userApi.resendInvitation(id);
      toast({
        title: 'Invitation Sent',
        description: res.message || `Invitation successfully sent to ${employee.email}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setResendingId(null);
    }
  };

  const getPlanBadgeClass = (plan?: SubscriptionPlan | string) => {
    switch (plan) {
      case SubscriptionPlan.BASIC:
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300';
      case SubscriptionPlan.PREMIUM:
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300';
      case SubscriptionPlan.ENTERPRISE:
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300';
      default:
        return 'border-border bg-muted/60 text-muted-foreground';
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return first + last || (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/organizations"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Link>
        </div>

        <Card className="overflow-hidden rounded-2xl border-border/80 bg-card p-6 shadow-sm ring-1 ring-border/40">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-muted/60" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-muted/60" />
              <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="h-24 animate-pulse rounded-2xl border-border/80 bg-card ring-1 ring-border/40"
            />
          ))}
        </div>

        <Card className="rounded-2xl border-border/80 bg-card p-6 shadow-sm ring-1 ring-border/40">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading company employees…
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/60">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Organization not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The organization you are looking for does not exist or has been removed.
        </p>
        <Button asChild className="mt-6 rounded-xl" variant="outline">
          <Link href="/dashboard/organizations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Organizations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/organizations"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </Link>
      </div>

      {/* Organization Header Banner Card */}
      <Card className="relative overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <div className="relative flex flex-col justify-between gap-5 p-5 md:flex-row md:items-center md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {organization.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'border font-semibold uppercase tracking-wider text-xs shadow-none',
                    getPlanBadgeClass(organization.subscriptionPlan)
                  )}
                >
                  {organization.subscriptionPlan || SubscriptionPlan.FREE}
                </Badge>
                {organization.isActive ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 font-medium"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>

              {/* Subdomain and Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-mono">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{organization.subdomain || 'no-subdomain'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/80">Company Admin:</span>
                  <span className="font-medium text-foreground">
                    {companyAdmin
                      ? companyAdmin.fullName ||
                        `${companyAdmin.firstName} ${companyAdmin.lastName}`.trim() ||
                        companyAdmin.email
                      : 'Not assigned'}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>
                    Created{' '}
                    {organization.createdAt
                      ? format(new Date(organization.createdAt), 'MMM d, yyyy')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild className="rounded-xl shadow-sm">
              <Link href={`/dashboard/users/create?orgId=${encodeURIComponent(organization._id)}&staff=1`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Employees
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {stats.total}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {stats.active}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inactive
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {stats.inactive}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Departments
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {stats.deptCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Label htmlFor="search-employees" className="sr-only">
                Search
              </Label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="search-employees"
                placeholder="Search by name, email, designation, or ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl pl-9"
              />
            </div>

            {/* Dropdown Filters Group */}
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              {/* Department */}
              <div className="w-full sm:w-44 shrink-0">
                <Label htmlFor="filter-dept" className="sr-only">
                  Department
                </Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="filter-dept" className="h-9 w-full rounded-xl">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="w-full sm:w-36 shrink-0">
                <Label htmlFor="filter-status" className="sr-only">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="filter-status" className="h-9 w-full rounded-xl">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="w-full sm:w-36 shrink-0">
                <Label htmlFor="filter-role" className="sr-only">
                  Role
                </Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="filter-role" className="h-9 w-full rounded-xl">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Company Admin</SelectItem>
                    <SelectItem value={UserRole.HR}>HR Admin</SelectItem>
                    <SelectItem value={UserRole.SUPERVISOR}>Supervisor</SelectItem>
                    <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Directory Table */}
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <CardHeader className="flex flex-col gap-0.5 border-b border-border/60 pb-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Company Employees
            </CardTitle>
            <CardDescription>
              {filteredEmployees.length} of {employees.length} employees shown
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No employees yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                This organization does not have any employees registered yet.
              </p>
              <Button asChild className="mt-6 rounded-xl">
                <Link href={`/dashboard/users/create?orgId=${encodeURIComponent(organization._id)}&staff=1`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Employee
                </Link>
              </Button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <p className="text-sm font-medium text-foreground">No matching employees</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                No employees match the current filters or search criteria.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="h-10 min-w-[200px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="h-10 min-w-[150px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Designation
                    </TableHead>
                    <TableHead className="h-10 min-w-[140px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </TableHead>
                    <TableHead className="h-10 min-w-[220px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Work Email
                    </TableHead>
                    <TableHead className="h-10 min-w-[130px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date Joined
                    </TableHead>
                    <TableHead className="h-10 min-w-[130px] bg-muted/30 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Employment Status
                    </TableHead>
                    <TableHead className="h-10 bg-muted/30 px-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => {
                    const empUserId = emp.id || emp._id;
                    const fullName =
                      emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || '—';
                    const designation =
                      emp.designation ||
                      getRoleDisplayName(emp.role as UserRole) ||
                      emp.role ||
                      '—';
                    const joinedDate = emp.joiningDate
                      ? format(new Date(emp.joiningDate), 'MMM d, yyyy')
                      : emp.createdAt
                        ? format(new Date(emp.createdAt), 'MMM d, yyyy')
                        : '—';

                    return (
                      <TableRow
                        key={empUserId}
                        className="border-border/60 transition-colors hover:bg-muted/35"
                      >
                        {/* Name */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-xs text-primary ring-1 ring-primary/20">
                              {getInitials(emp)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-sm text-foreground">
                                {fullName}
                              </p>
                              {emp.employeeId && (
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  ID: {emp.employeeId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Designation */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="font-medium text-sm text-foreground">
                              {designation}
                            </span>
                          </div>
                        </TableCell>

                        {/* Department */}
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {emp.department ? (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-medium text-xs text-muted-foreground">
                              {emp.department}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Work Email */}
                        <TableCell className="px-4 py-3">
                          <a
                            href={`mailto:${emp.email}`}
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{emp.email}</span>
                          </a>
                        </TableCell>

                        {/* Date Joined */}
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {joinedDate}
                        </TableCell>

                        {/* Employment Status */}
                        <TableCell className="px-4 py-3">
                          {emp.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 font-medium"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {emp.invitationPending && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-xs"
                                disabled={resendingId === empUserId}
                                onClick={() => handleResendInvitation(emp)}
                                title="Resend invitation email"
                              >
                                {resendingId === empUserId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="mr-1 h-3.5 w-3.5" />
                                    Resend
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <Link
                                href={`/dashboard/users/${empUserId}`}
                                title="Edit employee"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
