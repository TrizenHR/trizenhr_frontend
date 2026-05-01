'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Settings, Save, Loader2, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { hasAnyRole } from '@/lib/permissions';
import { UserRole } from '@/lib/types';
import { organizationApi } from '@/lib/api';
import { Organization } from '@/lib/types';
import WorkingHoursSettings from '@/components/settings/WorkingHoursSettings';
import LeavePolicySettings from '@/components/settings/LeavePolicySettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import { SystemAdminPlatformSettings } from '@/components/settings/SystemAdminPlatformSettings';
import { SettingsOrganizationContext } from '@/components/settings/SettingsOrganizationContext';
import { isPlatformHost } from '@/lib/is-platform-host';

const SETTINGS_ROLES = [UserRole.ADMIN, UserRole.HR, UserRole.SUPER_ADMIN] as const;

export default function SettingsPage() {
  const { user, selectedOrganizationId } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('working-hours');
  const [mainTab, setMainTab] = useState<'platform' | 'organization'>('platform');
  const [settings, setSettings] = useState<Organization['settings'] | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [orgAccessDenied, setOrgAccessDenied] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const needsOrgPickerForOrgSettings = Boolean(
    isSuperAdmin &&
      typeof window !== 'undefined' &&
      isPlatformHost() &&
      !selectedOrganizationId
  );

  const loadOrgSettings = useCallback(async () => {
    try {
      setOrgLoading(true);
      setOrgAccessDenied(false);
      const currentSettings = await organizationApi.getMySettings();
      setSettings(currentSettings);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err?.response?.status === 403) {
        setOrgAccessDenied(true);
        setSettings(null);
        return;
      }
      toast({
        title: 'Error',
        description: err.message || 'Failed to load settings',
        variant: 'destructive',
      });
      setSettings(null);
    } finally {
      setOrgLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    if (!hasAnyRole(user.role, [...SETTINGS_ROLES])) return;

    if (isSuperAdmin && mainTab !== 'organization') {
      setOrgLoading(false);
      return;
    }

    if (needsOrgPickerForOrgSettings) {
      setOrgLoading(false);
      setSettings(null);
      return;
    }

    void loadOrgSettings();
  }, [
    user?.id,
    user?.role,
    selectedOrganizationId,
    mainTab,
    loadOrgSettings,
    isSuperAdmin,
    needsOrgPickerForOrgSettings,
  ]);

  /** Super Admin: changing org context drops unsaved org edits and resets sub-tabs */
  useEffect(() => {
    if (!isSuperAdmin) return;
    setHasChanges(false);
    setActiveTab('working-hours');
  }, [selectedOrganizationId, isSuperAdmin]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await organizationApi.updateMySettings(settings);
      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err?.response?.status === 403) {
        setOrgAccessDenied(true);
        return;
      }
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsChange = (updatedSettings: Partial<Organization['settings']>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updatedSettings });
    setHasChanges(true);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </div>
      </div>
    );
  }

  if (!hasAnyRole(user.role, [...SETTINGS_ROLES])) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="rounded-2xl border border-border/80 bg-card px-6 py-12 text-center shadow-sm ring-1 ring-border/40">
          <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold text-foreground">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don&apos;t have permission to view settings. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const organizationSettingsBody = () => {
    if (needsOrgPickerForOrgSettings) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="max-w-md text-sm text-muted-foreground">
            Choose an organization in <span className="font-medium text-foreground">Organization context</span>{' '}
            above. Settings for that company will load here automatically.
          </p>
        </div>
      );
    }

    if (orgLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </div>
      );
    }

    if (orgAccessDenied) {
      return (
        <div className="rounded-2xl border border-border/80 bg-card px-6 py-12 text-center shadow-sm ring-1 ring-border/40">
          <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold text-foreground">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don&apos;t have permission to view organization settings for this context.
          </p>
        </div>
      );
    }

    if (!settings) {
      return (
        <div className="rounded-2xl border border-border/80 bg-card px-6 py-12 text-center shadow-sm ring-1 ring-border/40">
          <p className="text-sm text-muted-foreground">Failed to load organization settings.</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isSuperAdmin && (
              <>
                <h2 className="text-base font-semibold text-foreground">Organization settings</h2>
                <p className="text-sm text-muted-foreground">
                  Policies and defaults for the selected company.
                </p>
              </>
            )}
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="h-9 w-full rounded-xl sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-muted/40 p-1 sm:grid-cols-4">
            <TabsTrigger value="working-hours" className="rounded-xl text-xs sm:text-sm">
              Working hours
            </TabsTrigger>
            <TabsTrigger value="leave-policy" className="rounded-xl text-xs sm:text-sm">
              Leave policy
            </TabsTrigger>
            <TabsTrigger value="general" className="rounded-xl text-xs sm:text-sm">
              General
            </TabsTrigger>
            {hasAnyRole(user.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
              <TabsTrigger value="billing" className="rounded-xl text-xs sm:text-sm">
                Billing
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="working-hours" className="mt-4 outline-none">
            <WorkingHoursSettings
              workingHours={settings.workingHours}
              onChange={(workingHours) => handleSettingsChange({ workingHours })}
            />
          </TabsContent>

          <TabsContent value="leave-policy" className="mt-4 outline-none">
            <LeavePolicySettings
              leavePolicy={settings.leavePolicy}
              onChange={(leavePolicy) => handleSettingsChange({ leavePolicy })}
            />
          </TabsContent>

          <TabsContent value="general" className="mt-4 outline-none">
            <GeneralSettings
              timezone={settings.timezone}
              fiscalYearStart={settings.fiscalYearStart}
              onChange={(updates) => handleSettingsChange(updates)}
            />
          </TabsContent>

          {hasAnyRole(user.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
            <TabsContent value="billing" className="mt-4 outline-none">
              <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
                <CardHeader className="flex flex-col gap-3 border-b border-border/60 pb-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Billing &amp; subscription
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Review plan, usage, and invoices for this organization.
                    </p>
                  </div>
                  <Button variant="default" className="h-9 rounded-xl" onClick={() => router.push('/dashboard/billing')}>
                    Open billing
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 py-4 text-sm text-muted-foreground">
                  <p>From the billing page you can:</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>See how monthly charges are calculated from active employees.</li>
                    <li>Download past invoices.</li>
                    <li>Configure payment methods and auto-pay.</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </>
    );
  };

  if (isSuperAdmin) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6 lg:py-8">
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/15">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
          />
          <div className="relative flex min-h-[7.5rem] flex-col justify-center gap-3 px-4 py-3.5 sm:min-h-[8rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5 md:py-4">
            <div className="min-w-0 space-y-1.5">
              <span className="inline-flex w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                Preferences
              </span>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Settings</h1>
              <p className="max-w-2xl text-sm leading-snug text-primary-foreground/85 sm:line-clamp-2">
                Configure platform preferences for your System Admin account, and edit organization policies when a company is selected.
              </p>
            </div>
          </div>
        </section>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'platform' | 'organization')}>
          <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 rounded-2xl bg-muted/40 p-1">
            <TabsTrigger value="platform" className="rounded-xl text-sm">
              Platform (System)
            </TabsTrigger>
            <TabsTrigger value="organization" className="rounded-xl text-sm">
              Organization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="mt-4 outline-none">
            <SystemAdminPlatformSettings />
          </TabsContent>

          <TabsContent value="organization" className="mt-4 space-y-0 outline-none">
            <SettingsOrganizationContext />
            {organizationSettingsBody()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6 lg:py-8">
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/15">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div className="relative flex min-h-[7.5rem] flex-col justify-center gap-3 px-4 py-3.5 sm:min-h-[8rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5 md:py-4">
          <div className="min-w-0 space-y-1.5">
            <span className="inline-flex w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              Organization
            </span>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Settings</h1>
            <p className="max-w-2xl text-sm leading-snug text-primary-foreground/85 sm:line-clamp-2">
              Manage your organization’s settings and policies.
            </p>
          </div>
        </div>
      </section>
      {organizationSettingsBody()}
    </div>
  );
}

