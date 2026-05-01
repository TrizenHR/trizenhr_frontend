'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { organizationApi } from '@/lib/api';
import { Organization, UserRole } from '@/lib/types';
import { isPlatformHost } from '@/lib/is-platform-host';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requestNotificationsRefresh } from '@/lib/notifications-events';

const NONE = '__none__';

/**
 * System Admin + main platform URL: pick which organization API calls apply to
 * (e.g. organization settings). Shown only on Settings — not in the global header.
 */
export function SettingsOrganizationContext() {
  const { user, selectedOrganizationId, setSelectedOrganizationId } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== UserRole.SUPER_ADMIN) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const orgs = await organizationApi.getAll();
        if (!cancelled) setOrganizations(orgs);
      } catch {
        if (!cancelled) setOrganizations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  if (typeof window === 'undefined' || !isPlatformHost()) {
    return null;
  }

  const selectedName = organizations.find((o) => o._id === selectedOrganizationId)?.name;
  const selectValue = selectedOrganizationId ?? NONE;

  return (
    <Card className="mb-6 border-blue-100 bg-blue-50/30 shadow-sm ring-1 ring-blue-950/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-950">Organization context</CardTitle>
        <CardDescription className="text-blue-900/75">
          On the main site, choose which company&apos;s settings you are editing. This selection is
          saved for your session and used by organization-related APIs until you change it here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="settings-org-context">Active organization</Label>
          <Select
            value={selectValue}
            onValueChange={(v) => {
              setSelectedOrganizationId(v === NONE ? null : v);
              requestNotificationsRefresh();
            }}
            disabled={loading}
          >
            <SelectTrigger id="settings-org-context" className="max-w-md bg-white">
              <SelectValue placeholder={loading ? 'Loading organizations…' : 'Choose an organization'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None — platform-wide only</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org._id} value={org._id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedOrganizationId && selectedName ? (
          <p className="text-sm text-blue-900/90">
            Editing settings for{' '}
            <span className="font-semibold text-blue-950">{selectedName}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pick an organization to load working hours, leave policy, and general options below.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
