'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { platformApi } from '@/lib/api';
import {
  DemoInvitation,
  DemoInvitationDefaults,
  DemoInvitationStatus,
} from '@/lib/types';
import { DemoInvitationForm } from '@/components/demo-invitations/DemoInvitationForm';
import { DemoInvitationsTable } from '@/components/demo-invitations/DemoInvitationsTable';

export default function DemoInvitationsPage() {
  const { toast } = useToast();
  const [invites, setInvites] = useState<DemoInvitation[]>([]);
  const [defaults, setDefaults] = useState<DemoInvitationDefaults>({
    inviteLinkTtlHours: 48,
    demoAccessTtlDays: 7,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [defaultsData, listData] = await Promise.all([
        platformApi.getDemoInvitationDefaults(),
        platformApi.listDemoInvites({
          status:
            statusFilter === 'all'
              ? undefined
              : (statusFilter as DemoInvitationStatus),
          limit: 50,
        }),
      ]);
      setDefaults(defaultsData);
      setInvites(listData.items);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load demo invitations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (payload: Parameters<typeof platformApi.createDemoInvite>[0]) => {
    try {
      await platformApi.createDemoInvite(payload);
      toast({ title: 'Invitation sent', description: 'Demo invitation email was dispatched.' });
      setDialogOpen(false);
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send demo invitation',
        variant: 'destructive',
      });
      throw e;
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      setActionId(id);
      await platformApi.revokeDemoInvite(id);
      toast({ title: 'Revoked', description: 'Demo invitation access has been revoked.' });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to revoke invitation',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      setActionId(id);
      await platformApi.suspendDemoInvite(id);
      toast({ title: 'Suspended', description: 'Demo access has been suspended for this user.' });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to suspend demo access',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setActionId(id);
      await platformApi.restoreDemoInvite(id);
      toast({ title: 'Restored', description: 'Demo access has been restored for this user.' });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to restore demo access',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleResend = async (id: string) => {
    try {
      setActionId(id);
      await platformApi.resendDemoInvite(id);
      toast({ title: 'Resent', description: 'A new demo invitation email was sent.' });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  };

  const stats = {
    pending: invites.filter((i) => i.status === DemoInvitationStatus.PENDING).length,
    accepted: invites.filter((i) => i.status === DemoInvitationStatus.ACCEPTED).length,
    suspended: invites.filter((i) => i.status === DemoInvitationStatus.SUSPENDED).length,
    expired: invites.filter((i) => i.status === DemoInvitationStatus.EXPIRED).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Demo Invitations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send time-limited demo invites to the shared <strong>DemoOrg</strong> sandbox. Track
            acceptance and manage prospect access by role.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New demo invitation
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl">{stats.accepted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suspended</CardDescription>
            <CardTitle className="text-3xl">{stats.suspended}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expired</CardDescription>
            <CardTitle className="text-3xl">{stats.expired}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Invitation ledger
            </CardTitle>
            <CardDescription>
              Defaults: {defaults.inviteLinkTtlHours}h invite link · {defaults.demoAccessTtlDays}d
              demo access after accept
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={DemoInvitationStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={DemoInvitationStatus.ACCEPTED}>Accepted</SelectItem>
              <SelectItem value={DemoInvitationStatus.SUSPENDED}>Suspended</SelectItem>
              <SelectItem value={DemoInvitationStatus.EXPIRED}>Expired</SelectItem>
              <SelectItem value={DemoInvitationStatus.REVOKED}>Revoked</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading && invites.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DemoInvitationsTable
              items={invites}
              loading={loading}
              actionId={actionId}
              onRevoke={handleRevoke}
              onResend={handleResend}
              onSuspend={handleSuspend}
              onRestore={handleRestore}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send demo invitation</DialogTitle>
            <DialogDescription>
              Creates a user in the shared DemoOrg tenant and sends a secure invite link (no
              password in email).
            </DialogDescription>
          </DialogHeader>
          <DemoInvitationForm
            defaults={defaults}
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
