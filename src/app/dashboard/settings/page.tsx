'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Settings, Save, Loader2, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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
import { OrganizationSwitcher } from '@/components/dashboard/OrganizationSwitcher';
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
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!hasAnyRole(user.role, [...SETTINGS_ROLES])) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">
            You don&apos;t have permission to view settings. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const organizationSettingsBody = () => {
    if (needsOrgPickerForOrgSettings) {
      return (
        <Card className="border-blue-100 bg-blue-50/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-950">
              <Building2 className="h-5 w-5 text-blue-600" />
              Select an organization
            </CardTitle>
            <CardDescription className="text-blue-900/80">
              On the main site, pick a company to load its working hours, leave policy, and general
              options. You can use the header selector or choose below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <OrganizationSwitcher />
            <p className="text-xs text-muted-foreground sm:max-w-md">
              After you select an organization, this section loads immediately — no page refresh
              required.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (orgLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (orgAccessDenied) {
      return (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">
            You don&apos;t have permission to view organization settings for this context.
          </p>
        </div>
      );
    }

    if (!settings) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load organization settings.</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isSuperAdmin && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Organization settings</h2>
                <p className="text-sm text-muted-foreground">
                  Policies and defaults for the selected company.
                </p>
              </>
            )}
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="working-hours" className="text-xs sm:text-sm">
              Working hours
            </TabsTrigger>
            <TabsTrigger value="leave-policy" className="text-xs sm:text-sm">
              Leave policy
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs sm:text-sm">
              General
            </TabsTrigger>
            {hasAnyRole(user.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
              <TabsTrigger value="billing" className="text-xs sm:text-sm">
                Billing
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="working-hours" className="mt-6">
            <WorkingHoursSettings
              workingHours={settings.workingHours}
              onChange={(workingHours) => handleSettingsChange({ workingHours })}
            />
          </TabsContent>

          <TabsContent value="leave-policy" className="mt-6">
            <LeavePolicySettings
              leavePolicy={settings.leavePolicy}
              onChange={(leavePolicy) => handleSettingsChange({ leavePolicy })}
            />
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <GeneralSettings
              timezone={settings.timezone}
              fiscalYearStart={settings.fiscalYearStart}
              onChange={(updates) => handleSettingsChange(updates)}
            />
          </TabsContent>

          {hasAnyRole(user.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
            <TabsContent value="billing" className="mt-6">
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Billing &amp; subscription
                    </CardTitle>
                    <p className="mt-1 text-xs text-gray-500">
                      Review plan, usage, and invoices for this organization.
                    </p>
                  </div>
                  <Button variant="default" onClick={() => router.push('/dashboard/billing')}>
                    Open billing
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
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
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform preferences for your System Admin account, and organization policies when a
            company is selected.
          </p>
        </div>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'platform' | 'organization')}>
          <TabsList className="mb-6 grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1">
            <TabsTrigger value="platform" className="text-sm">
              Platform (System)
            </TabsTrigger>
            <TabsTrigger value="organization" className="text-sm">
              Organization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="mt-0 outline-none">
            <SystemAdminPlatformSettings />
          </TabsContent>

          <TabsContent value="organization" className="mt-0 outline-none">
            {organizationSettingsBody()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold md:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization&apos;s settings and policies
        </p>
      </div>
      {organizationSettingsBody()}
    </div>
  );
}

