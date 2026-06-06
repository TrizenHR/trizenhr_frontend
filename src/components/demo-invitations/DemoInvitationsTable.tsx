'use client';

import { format } from 'date-fns';
import { Loader2, Mail, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DemoInvitation, DemoInvitationStatus, UserRole } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = {
  [UserRole.ADMIN]: 'Company Admin',
  [UserRole.HR]: 'HR Admin',
  [UserRole.SUPERVISOR]: 'Manager',
  [UserRole.EMPLOYEE]: 'Employee',
};

function statusBadge(status: DemoInvitationStatus) {
  const map: Record<
    DemoInvitationStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    [DemoInvitationStatus.PENDING]: { label: 'Pending', variant: 'secondary' },
    [DemoInvitationStatus.ACCEPTED]: { label: 'Accepted', variant: 'default' },
    [DemoInvitationStatus.SUSPENDED]: { label: 'Suspended', variant: 'outline' },
    [DemoInvitationStatus.EXPIRED]: { label: 'Expired', variant: 'outline' },
    [DemoInvitationStatus.REVOKED]: { label: 'Revoked', variant: 'destructive' },
  };
  const cfg = map[status] ?? { label: status, variant: 'outline' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function formatDate(value?: string) {
  if (!value) return '—';
  try {
    return format(new Date(value), 'MMM d, yyyy HH:mm');
  } catch {
    return value;
  }
}

interface DemoInvitationsTableProps {
  items: DemoInvitation[];
  loading?: boolean;
  actionId?: string | null;
  onRevoke: (id: string) => void;
  onResend: (id: string) => void;
  onSuspend: (id: string) => void;
  onRestore: (id: string) => void;
}

export function DemoInvitationsTable({
  items,
  loading,
  actionId,
  onRevoke,
  onResend,
  onSuspend,
  onRestore,
}: DemoInvitationsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Mail className="h-10 w-10 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">No demo invitations yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Demo org</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Invite expires</TableHead>
            <TableHead>Demo expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((invite) => {
            const busy = actionId === invite._id;
            const canResend =
              invite.status === DemoInvitationStatus.PENDING ||
              invite.status === DemoInvitationStatus.EXPIRED ||
              invite.status === DemoInvitationStatus.REVOKED;
            const canRevokeInvite = invite.status === DemoInvitationStatus.PENDING;
            const canSuspend = invite.status === DemoInvitationStatus.ACCEPTED;
            const canRestore = invite.status === DemoInvitationStatus.SUSPENDED;
            const canRevokeAccess =
              invite.status === DemoInvitationStatus.ACCEPTED ||
              invite.status === DemoInvitationStatus.SUSPENDED;
            const hasActions =
              canResend || canRevokeInvite || canSuspend || canRestore || canRevokeAccess;

            return (
              <TableRow key={invite._id}>
                <TableCell className="font-medium">
                  {invite.demoTenantName || invite.companyName || 'DemoOrg'}
                </TableCell>
                <TableCell>{invite.email}</TableCell>
                <TableCell>{ROLE_LABELS[invite.role] ?? invite.role}</TableCell>
                <TableCell>{formatDate(invite.createdAt)}</TableCell>
                <TableCell>{formatDate(invite.inviteExpiresAt)}</TableCell>
                <TableCell>{formatDate(invite.demoAccessExpiresAt)}</TableCell>
                <TableCell>{statusBadge(invite.status)}</TableCell>
                <TableCell className="text-right">
                  {hasActions ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={busy} aria-label="Row actions">
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canResend && (
                          <DropdownMenuItem onClick={() => onResend(invite._id)}>
                            Resend invitation
                          </DropdownMenuItem>
                        )}
                        {canSuspend && (
                          <DropdownMenuItem onClick={() => onSuspend(invite._id)}>
                            Suspend access
                          </DropdownMenuItem>
                        )}
                        {canRestore && (
                          <DropdownMenuItem onClick={() => onRestore(invite._id)}>
                            Restore access
                          </DropdownMenuItem>
                        )}
                        {(canRevokeInvite || canRevokeAccess) && (
                          <>
                            {(canResend || canSuspend || canRestore) && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onRevoke(invite._id)}
                            >
                              {canRevokeInvite ? 'Revoke invitation' : 'Revoke access'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
