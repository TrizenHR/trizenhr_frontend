'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2, DollarSign } from 'lucide-react';
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

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('working-hours');
  const [settings, setSettings] = useState<Organization['settings'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user has access to settings (organization-level settings, not for Super Admin)
  if (!user || !hasAnyRole(user.role, [UserRole.ADMIN, UserRole.HR])) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">
            You don't have permission to view settings. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = await organizationApi.getMySettings();
      setSettings(currentSettings);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage your organization's settings and policies
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="working-hours" className="text-xs sm:text-sm">Working Hours</TabsTrigger>
          <TabsTrigger value="leave-policy" className="text-xs sm:text-sm">Leave Policy</TabsTrigger>
          <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
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
                    Billing &amp; Subscription
                  </CardTitle>
                  <p className="mt-1 text-xs text-gray-500">
                    Review your plan, usage, invoices, and manage payment methods for this organization.
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={() => router.push('/dashboard/billing')}
                >
                  Open Billing
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>From the Billing page you can:</p>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  <li>See how your monthly charges are calculated from active employees.</li>
                  <li>Download past invoices for finance and compliance.</li>
                  <li>Configure payment methods and auto‑pay behavior.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
