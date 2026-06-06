'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { UserRole, type CreateDemoInvitationPayload, type DemoInvitationDefaults } from '@/lib/types';

const DEMO_ROLES = [
  { value: UserRole.EMPLOYEE, label: 'Employee' },
  { value: UserRole.SUPERVISOR, label: 'Manager' },
  { value: UserRole.HR, label: 'HR Admin' },
  { value: UserRole.ADMIN, label: 'Company Admin' },
] as const;

const SHARED_DEMO_ORG_NAME = 'DemoOrg';

interface DemoInvitationFormProps {
  defaults: DemoInvitationDefaults;
  onSubmit: (payload: CreateDemoInvitationPayload) => Promise<void>;
  onCancel: () => void;
}

export function DemoInvitationForm({ defaults, onSubmit, onCancel }: DemoInvitationFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [notes, setNotes] = useState('');
  const [overrideDefaults, setOverrideDefaults] = useState(false);
  const [inviteLinkTtlHours, setInviteLinkTtlHours] = useState(defaults.inviteLinkTtlHours);
  const [demoAccessTtlDays, setDemoAccessTtlDays] = useState(defaults.demoAccessTtlDays);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: CreateDemoInvitationPayload = {
        email: email.trim(),
        role,
        notes: notes.trim() || undefined,
      };
      if (overrideDefaults) {
        payload.inviteLinkTtlHours = inviteLinkTtlHours;
        payload.demoAccessTtlDays = demoAccessTtlDays;
      }
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        All invites use the shared demo organization{' '}
        <span className="font-medium text-foreground">{SHARED_DEMO_ORG_NAME}</span> (
        <span className="font-mono text-xs">demoorg</span> tenant).
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Prospect email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hr@companya.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role to demo</Label>
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEMO_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Internal notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Prospect company, sales context…"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Override default durations</p>
          <p className="text-xs text-muted-foreground">
            Defaults: {defaults.inviteLinkTtlHours}h invite / {defaults.demoAccessTtlDays}d demo
          </p>
        </div>
        <Switch checked={overrideDefaults} onCheckedChange={setOverrideDefaults} />
      </div>

      {overrideDefaults && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customHours">Invite link (hours)</Label>
            <Input
              id="customHours"
              type="number"
              min={1}
              max={168}
              value={inviteLinkTtlHours}
              onChange={(e) => setInviteLinkTtlHours(parseInt(e.target.value, 10) || 48)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customDays">Demo access (days)</Label>
            <Input
              id="customDays"
              type="number"
              min={1}
              max={90}
              value={demoAccessTtlDays}
              onChange={(e) => setDemoAccessTtlDays(parseInt(e.target.value, 10) || 7)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            'Send demo invitation'
          )}
        </Button>
      </div>
    </form>
  );
}
