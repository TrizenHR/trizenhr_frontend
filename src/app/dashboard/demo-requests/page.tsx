'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Loader2,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  Globe,
  Smartphone,
  UserPlus,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAuth } from '@/hooks/use-auth';
import { platformApi } from '@/lib/api';
import {
  DemoRequestItem,
  DemoRequestSource,
  DemoRequestStatus,
  UserRole,
} from '@/lib/types';

const ALLOWED_EMAIL = 'demo@trizenventures.com';

export default function DemoRequestsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [requests, setRequests] = useState<DemoRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedRequestForInvite, setSelectedRequestForInvite] = useState<DemoRequestItem | null>(null);
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.ADMIN);
  const [inviteEmailOverride, setInviteEmailOverride] = useState('');

  // Manual create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    sendInvitation: true,
    role: UserRole.ADMIN,
  });

  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<DemoRequestItem | null>(null);

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Check email access authorization
  const isAuthorized = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === ALLOWED_EMAIL.toLowerCase();
  }, [user]);

  // Load demo requests from backend API
  const loadRequests = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      setLoading(true);
      const data = await platformApi.listDemoRequests({
        status: statusFilter === 'all' ? undefined : (statusFilter as DemoRequestStatus),
        source: sourceFilter === 'all' ? undefined : (sourceFilter as DemoRequestSource),
        limit: 100,
      });
      setRequests(data.items);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Failed to load requests',
        description: err.response?.data?.message || 'Could not fetch demo request leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, statusFilter, sourceFilter, toast]);

  useEffect(() => {
    if (!isAuthLoading && isAuthorized) {
      void loadRequests();
    }
  }, [isAuthLoading, isAuthorized, loadRequests]);

  // Filter requests locally by search query
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase().trim();
    return requests.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        (r.phone && r.phone.toLowerCase().includes(q))
    );
  }, [requests, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === DemoRequestStatus.PENDING).length,
      contacted: requests.filter((r) => r.status === DemoRequestStatus.CONTACTED).length,
      closed: requests.filter((r) => r.status === DemoRequestStatus.CLOSED).length,
    };
  }, [requests]);

  // Status update handler
  const handleUpdateStatus = async (id: string, newStatus: DemoRequestStatus) => {
    try {
      setActionLoadingId(id);
      const updated = await platformApi.updateDemoRequestStatus(id, newStatus);
      setRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast({
        title: 'Status updated',
        description: `Demo request status changed to ${newStatus}.`,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error updating status',
        description: err.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Dispatch demo invitation handler
  const handleOpenInviteModal = (reqItem: DemoRequestItem) => {
    setSelectedRequestForInvite(reqItem);
    setInviteRole(UserRole.ADMIN);
    setInviteEmailOverride(reqItem.email);
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedRequestForInvite) return;
    try {
      setActionLoadingId(selectedRequestForInvite.id);
      const result = await platformApi.sendDemoRequestInvitation(
        selectedRequestForInvite.id,
        inviteRole,
        inviteEmailOverride.trim() || undefined
      );
      setRequests((prev) => prev.map((item) => (item.id === selectedRequestForInvite.id ? result.request : item)));
      toast({
        title: 'Demo Invitation Sent!',
        description: `Time-limited demo invite dispatched to ${inviteEmailOverride || selectedRequestForInvite.email}.`,
      });
      setInviteModalOpen(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Failed to send invitation',
        description: err.response?.data?.message || 'Error creating demo invitation',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoadingId(deleteId);
      await platformApi.deleteDemoRequest(deleteId);
      setRequests((prev) => prev.filter((item) => item.id !== deleteId));
      toast({
        title: 'Request deleted',
        description: 'Demo request record has been permanently removed.',
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || 'Error deleting request',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
      setActionLoadingId(null);
    }
  };

  // Create manual demo request handler
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.company) {
      toast({
        title: 'Validation error',
        description: 'Name, email, and company name are required.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      await platformApi.createDemoRequest({
        name: createForm.name,
        email: createForm.email,
        company: createForm.company,
        phone: createForm.phone || undefined,
        message: createForm.message || undefined,
        sendInvitation: createForm.sendInvitation,
        role: createForm.role,
      });
      toast({
        title: 'Demo Request Recorded',
        description: createForm.sendInvitation
          ? 'Request added and invitation sent successfully.'
          : 'Demo request added to pending queue.',
      });
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        sendInvitation: true,
        role: UserRole.ADMIN,
      });
      await loadRequests();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Failed to record request',
        description: err.response?.data?.message || 'Could not record demo request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Render auth loading state
  if (isAuthLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render restriction screen if user email is not demo@trizenventures.com
  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="border-destructive/30 shadow-lg">
          <CardHeader className="space-y-3 pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Access Restricted</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              This page is exclusively reserved for <strong>{ALLOWED_EMAIL}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              You are currently signed in as <strong>{user?.email || 'Unknown'}</strong>. If you believe this is an error, please log out and sign in with the designated demo administrator account.
            </p>
            <div className="pt-2">
              <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold">
              EXPRESS DEMO CONSOLE
            </Badge>
            <span className="text-xs text-muted-foreground">• Authorized for {ALLOWED_EMAIL}</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Demo Access Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage prospects who requested demo access. Review lead details, update status, and send sandbox invites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadRequests()}
            disabled={loading}
            className="h-10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Record Request
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Total Requests
            </CardDescription>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{stats.total}</div>
            <p className="mt-1 text-xs text-muted-foreground">All time demo requests</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending Needs Action
            </CardDescription>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600">{stats.pending}</div>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting follow-up or invite</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Contacted / Invited
            </CardDescription>
            <Send className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600">{stats.contacted}</div>
            <p className="mt-1 text-xs text-muted-foreground">Demo invitation dispatched</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Closed Leads
            </CardDescription>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">{stats.closed}</div>
            <p className="mt-1 text-xs text-muted-foreground">Onboarded or completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="shadow-xs">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Filter:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={DemoRequestStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={DemoRequestStatus.CONTACTED}>Contacted</SelectItem>
                  <SelectItem value={DemoRequestStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value={DemoRequestSource.WEB}>Web</SelectItem>
                  <SelectItem value={DemoRequestSource.MOBILE}>Mobile</SelectItem>
                  <SelectItem value={DemoRequestSource.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && requests.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">No demo requests found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try clearing your search query or adjusting your filters.'
                  : 'No user demo requests have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Requester Info</th>
                    <th className="px-4 py-3">Company & Contact</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Requested On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{req.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <a href={`mailto:${req.email}`} className="hover:underline text-primary">
                            {req.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {req.company}
                        </div>
                        {req.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            {req.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className="flex w-fit items-center gap-1 text-[11px] font-medium"
                        >
                          {req.source === DemoRequestSource.WEB && <Globe className="h-3 w-3 text-blue-500" />}
                          {req.source === DemoRequestSource.MOBILE && <Smartphone className="h-3 w-3 text-purple-500" />}
                          {req.source === DemoRequestSource.ADMIN && <UserPlus className="h-3 w-3 text-slate-500" />}
                          <span className="capitalize">{req.source}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={req.status}
                          onValueChange={(val) => handleUpdateStatus(req.id, val as DemoRequestStatus)}
                          disabled={actionLoadingId === req.id}
                        >
                          <SelectTrigger
                            className={`h-7 w-[125px] text-xs font-semibold rounded-full border-0 ${
                              req.status === DemoRequestStatus.PENDING
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : req.status === DemoRequestStatus.CONTACTED
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DemoRequestStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={DemoRequestStatus.CONTACTED}>Contacted</SelectItem>
                            <SelectItem value={DemoRequestStatus.CLOSED}>Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.message && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="View message notes"
                              onClick={() => {
                                setSelectedRequestDetails(req);
                                setDetailsModalOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleOpenInviteModal(req)}
                            disabled={actionLoadingId === req.id}
                          >
                            <Send className="mr-1.5 h-3.5 w-3.5" />
                            {req.status === DemoRequestStatus.CONTACTED ? 'Resend Invite' : 'Send Invite'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete request"
                            onClick={() => setDeleteId(req.id)}
                            disabled={actionLoadingId === req.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Send Demo Invitation */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-primary" />
              Dispatch Demo Invitation
            </DialogTitle>
            <DialogDescription>
              Create sandbox demo access for <strong>{selectedRequestForInvite?.name}</strong> from{' '}
              <strong>{selectedRequestForInvite?.company}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Recipient Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmailOverride}
                onChange={(e) => setInviteEmailOverride(e.target.value)}
                placeholder="email@company.com"
              />
              <p className="text-[11px] text-muted-foreground">
                An invitation set-password link will be sent to this email address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Demo Access Role</Label>
              <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as UserRole)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Company Admin (Full org setup)</SelectItem>
                  <SelectItem value={UserRole.HR}>HR Manager (Employee & leaves setup)</SelectItem>
                  <SelectItem value={UserRole.SUPERVISOR}>Supervisor / Manager</SelectItem>
                  <SelectItem value={UserRole.EMPLOYEE}>Regular Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRequestForInvite?.message && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Requester Message: </span>
                &quot;{selectedRequestForInvite.message}&quot;
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSendInvitation()}
              disabled={actionLoadingId === selectedRequestForInvite?.id}
            >
              {actionLoadingId === selectedRequestForInvite?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: View Details & Notes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demo Request Details</DialogTitle>
            <DialogDescription>Full request details from lead submission</DialogDescription>
          </DialogHeader>
          {selectedRequestDetails && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Name:</span>
                <span className="col-span-2 font-medium text-foreground">{selectedRequestDetails.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Email:</span>
                <span className="col-span-2 font-medium text-foreground">{selectedRequestDetails.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Company:</span>
                <span className="col-span-2 font-medium text-foreground">{selectedRequestDetails.company}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Phone:</span>
                <span className="col-span-2 text-foreground">{selectedRequestDetails.phone || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Source:</span>
                <span className="col-span-2 capitalize text-foreground">{selectedRequestDetails.source}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Submitted:</span>
                <span className="col-span-2 text-foreground">
                  {new Date(selectedRequestDetails.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1 pt-2">
                <span className="font-semibold text-muted-foreground">Message / Requirements:</span>
                <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-foreground">
                  {selectedRequestDetails.message || 'No additional message provided.'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Record Manual Request */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Demo Request</DialogTitle>
            <DialogDescription>Manually register a prospect demo request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="req-name">Full Name *</Label>
              <Input
                id="req-name"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-email">Work Email *</Label>
              <Input
                id="req-email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-company">Company Name *</Label>
              <Input
                id="req-company"
                required
                value={createForm.company}
                onChange={(e) => setCreateForm((p) => ({ ...p, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-phone">Phone Number (optional)</Label>
              <Input
                id="req-phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-message">Notes / Requirements</Label>
              <Input
                id="req-message"
                value={createForm.message}
                onChange={(e) => setCreateForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Interested in payroll & attendance..."
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="send-invite-check"
                checked={createForm.sendInvitation}
                onChange={(e) => setCreateForm((p) => ({ ...p, sendInvitation: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="send-invite-check" className="text-xs font-normal cursor-pointer">
                Send demo invitation link immediately
              </Label>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Record Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog: Confirm Delete */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Demo Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this demo request lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
