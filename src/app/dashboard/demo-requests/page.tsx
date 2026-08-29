'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Search, ShieldAlert, Trash2, Users, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { platformApi } from '@/lib/api';
import type { DemoAccessAccount } from '@/lib/types';

const ALLOWED_EMAIL = 'demo@trizenventures.com';

function formatDate(value?: string) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDemoPeriod(value?: string) {
  if (!value) return '—';

  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return '—';

  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  const startLabel = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(start);

  const endLabel = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(end);

  return `${startLabel} – ${endLabel}`;
}

function planLabel(planId?: string) {
  return planId ? `${planId.slice(0, 1)}${planId.slice(1).toLowerCase()}` : 'Trial';
}

export default function DemoAccessPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<DemoAccessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalLimit, setGlobalLimit] = useState('50');
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [draftLimits, setDraftLimits] = useState<Record<string, string>>({});

  const isAuthorized = user?.email?.toLowerCase() === ALLOWED_EMAIL;

  const loadAccounts = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        platformApi.listDemoAccess({ limit: 100 }),
        platformApi.getDemoAccessLimitSettings(),
      ]);
      setAccounts(data.items);
      setGlobalLimit(String(settings.employeeLimit));
      setDraftLimits(
        Object.fromEntries(data.items.filter((account) => account.organizationId).map((account) => [account.organizationId, String(account.employeeLimit ?? '')]))
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Could not load demo access',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, toast]);

  useEffect(() => {
    if (!isAuthLoading && isAuthorized) void loadAccounts();
  }, [isAuthLoading, isAuthorized, loadAccounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return accounts;
    return accounts.filter((account) =>
      [account.name, account.email, account.organizationName, account.prospectLabel]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [accounts, search]);

  const stats = useMemo(() => {
    const configuredLimit = Number(globalLimit);
    const fallbackTotal = accounts.reduce((sum, account) => sum + (account.employeeLimit ?? 0), 0);

    return {
      total: accounts.length,
      opened: accounts.filter((account) => account.opened).length,
      unopened: accounts.filter((account) => !account.opened).length,
      activeUsers:
        Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : fallbackTotal,
    };
  }, [accounts, globalLimit]);

  const handleLimitSave = async (account: DemoAccessAccount) => {
    if (!account.organizationId) return;
    const employeeLimit = Number(draftLimits[account.organizationId]);
    if (!Number.isInteger(employeeLimit) || employeeLimit < 1 || employeeLimit > 99999) {
      toast({
        title: 'Invalid user limit',
        description: 'Enter a whole number between 1 and 99,999.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingId(account.organizationId);
      const updated = await platformApi.updateDemoAccessLimit(account.organizationId, employeeLimit);
      setAccounts((previous) =>
        previous.map((item) =>
          item.organizationId === account.organizationId
            ? { ...item, employeeLimit: updated.employeeLimit, planId: updated.planId }
            : item
        )
      );
      toast({ title: 'Limit updated', description: `${employeeLimit} users can now be added to this demo account.` });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Could not update limit',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleGlobalLimitSave = async () => {
    const employeeLimit = Number(globalLimit);
    if (!Number.isInteger(employeeLimit) || employeeLimit < 1 || employeeLimit > 99999) {
      toast({ title: 'Invalid global limit', description: 'Enter a whole number between 1 and 99,999.', variant: 'destructive' });
      return;
    }
    try {
      setSavingGlobal(true);
      const updated = await platformApi.updateDemoAccessLimitSettings(employeeLimit);
      setGlobalLimit(String(updated.employeeLimit));

      const refreshedAccounts = accounts.map((account) =>
        account.organizationId && !account.individualLimitOverride
          ? { ...account, employeeLimit }
          : account
      );
      setAccounts(refreshedAccounts);
      setDraftLimits((previous) => {
        const next = { ...previous };
        refreshedAccounts.forEach((account) => {
          if (account.organizationId && !account.individualLimitOverride) {
            next[account.organizationId] = String(employeeLimit);
          }
        });
        return next;
      });

      await loadAccounts();
      toast({ title: 'Global limit updated', description: 'All demo accounts without an individual override now use this limit.' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Could not update global limit', description: err.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleDelete = async (account: DemoAccessAccount) => {
    const label = account.email || account.organizationName;
    if (!window.confirm(`Delete demo access for ${label}? This permanently removes the demo account and its users.`)) return;
    const id = account.organizationId || account.id;
    try {
      setDeletingId(id);
      await platformApi.deleteDemoAccess(id);
      setAccounts((previous) => previous.filter((item) => item.id !== account.id && item.organizationId !== account.organizationId));
      toast({ title: 'Demo access deleted', description: `${label} was removed.` });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Could not delete demo access', description: err.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  if (isAuthLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="border-destructive/30 shadow-lg">
          <CardHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><ShieldAlert className="h-7 w-7" /></div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>This page is reserved for {ALLOWED_EMAIL}.</CardDescription>
          </CardHeader>
          <CardContent><Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">OTP DEMO CONSOLE</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Demo Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accounts created through OTP onboarding. Track first access and control how many users each demo account may add.</p>
        </div>
        <Button variant="outline" onClick={() => void loadAccounts()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total accounts</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">OTP demo access records</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Opened</CardDescription><CardTitle className="flex items-center gap-2 text-3xl text-emerald-600"><CheckCircle2 className="h-6 w-6" />{stats.opened}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Successful account login</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Not opened</CardDescription><CardTitle className="flex items-center gap-2 text-3xl text-amber-600"><XCircle className="h-6 w-6" />{stats.unopened}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">No successful login yet</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Configured user capacity</CardDescription><CardTitle className="flex items-center gap-2 text-3xl"><Users className="h-6 w-6 text-primary" />{stats.activeUsers}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Across all demo accounts</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Global demo user limit</CardTitle><CardDescription>Apply this limit to every demo account that does not have an individual override.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full max-w-xs space-y-2"><Label htmlFor="global-demo-limit">Users allowed per demo account</Label><Input id="global-demo-limit" type="number" min={1} max={99999} value={globalLimit} onChange={(event) => setGlobalLimit(event.target.value)} /></div>
          <Button onClick={() => void handleGlobalLimitSave()} disabled={savingGlobal}>{savingGlobal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{savingGlobal ? 'Applying...' : 'Apply globally'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Demo accounts</CardTitle><CardDescription>Change each account&apos;s active user limit independently of the requested team size.</CardDescription></div>
          <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name, email, or company" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        </CardHeader>
        <CardContent>
          {loading && accounts.length === 0 ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : filteredAccounts.length === 0 ? <div className="py-16 text-center text-sm text-muted-foreground">No OTP demo accounts found.</div> : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Employees</th><th className="px-4 py-3">Demo Period</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">User limit</th><th className="px-4 py-3">Action</th></tr></thead>
                <tbody className="divide-y">
                  {filteredAccounts.map((account) => {
                    const rowId = account.organizationId || account.id;
                    const busy = savingId === account.organizationId;
                    const demoPeriod = formatDemoPeriod(account.requestedAt);
                    return <tr key={rowId} className="hover:bg-muted/30">
                      <td className="px-4 py-4"><div className="font-semibold">{account.name || 'Unnamed admin'}</div><div className="text-xs text-primary">{account.email || 'No email'}</div><div className="mt-1 text-xs text-muted-foreground">{account.organizationName}</div></td>
                      <td className="px-4 py-4"><div>{account.requestedEmployeeCount ?? '—'} employees</div></td>
                      <td className="px-4 py-4"><div className="text-sm text-muted-foreground">{demoPeriod}</div></td>
                      <td className="px-4 py-4"><Badge variant="secondary">{planLabel(account.planId)}</Badge></td>
                      <td className="px-4 py-4">{account.organizationId ? <div className="space-y-1"><div className="flex items-center gap-2"><Label className="sr-only" htmlFor={`limit-${rowId}`}>User limit</Label><Input id={`limit-${rowId}`} type="number" min={1} max={99999} className="w-28" value={draftLimits[account.organizationId] ?? account.employeeLimit ?? ''} onChange={(event) => setDraftLimits((previous) => ({ ...previous, [account.organizationId!]: event.target.value }))} /></div><span className="text-[11px] text-muted-foreground">{account.individualLimitOverride ? 'Individual override' : 'Global limit'}</span></div> : <span className="text-xs text-muted-foreground">Complete registration first</span>}</td>
                      <td className="px-4 py-4">{account.organizationId ? <div className="flex items-center gap-2"><Button size="sm" onClick={() => void handleLimitSave(account)} disabled={busy || Boolean(deletingId)}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{busy ? 'Saving' : 'Save limit'}</Button><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Delete demo account" onClick={() => void handleDelete(account)} disabled={busy || deletingId === rowId}><Trash2 className="h-4 w-4" /></Button></div> : <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Delete OTP request" onClick={() => void handleDelete(account)} disabled={deletingId === rowId}><Trash2 className="h-4 w-4" /></Button>}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
