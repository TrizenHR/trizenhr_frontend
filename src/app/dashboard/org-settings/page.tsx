'use client';

import { useEffect, useState } from 'react';
import { organizationApi } from '@/lib/api';
import { Organization, WeeklyOffPattern } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Globe, Clock, FileText, Loader2 } from 'lucide-react';

const FISCAL_MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function OrgSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings form state (matching Organization['settings'])
  const [settings, setSettings] = useState<Organization['settings']>({
    workingHours: {
      startTime: '09:00',
      endTime: '18:00',
    },
    workingDays: {
      weeklyOffPattern: WeeklyOffPattern.MON_FRI,
    },
    leavePolicy: {
      sickLeave: 12,
      casualLeave: 10,
      vacationLeave: 15,
    },
    timezone: 'Asia/Kolkata',
    fiscalYearStart: 4, // April
  });

  // Branding states (pure frontend mockup)
  const [branding, setBranding] = useState({
    companyName: 'Trizent Technologies',
    primaryColor: '#0f172a',
    accentColor: '#3b82f6',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await organizationApi.getMySettings();
      if (data) {
        setSettings({
          workingHours: data.workingHours || { startTime: '09:00', endTime: '18:00' },
          workingDays: data.workingDays || { weeklyOffPattern: WeeklyOffPattern.MON_FRI },
          leavePolicy: data.leavePolicy || { sickLeave: 12, casualLeave: 10, vacationLeave: 15 },
          timezone: data.timezone || 'Asia/Kolkata',
          fiscalYearStart: data.fiscalYearStart || 4,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Info',
        description: 'No existing organization settings found. Default configuration loaded.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await organizationApi.updateMySettings(settings);
      
      toast({
        title: 'Settings Saved',
        description: 'Organization settings updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Settings',
        description: error.response?.data?.error || 'Failed to update organization settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrandingSave = () => {
    toast({
      title: 'Branding Updated',
      description: 'Branding options updated locally. Backend upload pending.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Retrieving organization settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl font-sf">Organization Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure company profiles, default constraints, and global metadata</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-md">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile and branding settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-500" />
              Company Details & Branding
            </CardTitle>
            <CardDescription>Setup your organization identifier and brand coloring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={branding.companyName}
                onChange={e => setBranding(p => ({ ...p, companyName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primaryColor"
                    className="w-12 h-9 p-0.5 border cursor-pointer rounded-lg"
                    value={branding.primaryColor}
                    onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                  />
                  <Input
                    value={branding.primaryColor}
                    className="flex-1 font-mono uppercase text-xs"
                    onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="accentColor"
                    className="w-12 h-9 p-0.5 border cursor-pointer rounded-lg"
                    value={branding.accentColor}
                    onChange={e => setBranding(p => ({ ...p, accentColor: e.target.value }))}
                  />
                  <Input
                    value={branding.accentColor}
                    className="flex-1 font-mono uppercase text-xs"
                    onChange={e => setBranding(p => ({ ...p, accentColor: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleBrandingSave}>Save Branding</Button>
          </CardFooter>
        </Card>

        {/* Global Metadata Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-indigo-500" />
              Regional Settings & Metadata
            </CardTitle>
            <CardDescription>Configure global dates, fiscal start points, and system timezones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={val => setSettings(p => ({ ...p, timezone: val }))}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST - UTC-05:00)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT/BST - UTC+00:00)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fiscalYear">Fiscal Year Start Month</Label>
              <Select
                value={String(settings.fiscalYearStart)}
                onValueChange={val => setSettings(p => ({ ...p, fiscalYearStart: Number(val) }))}
              >
                <SelectTrigger id="fiscalYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FISCAL_MONTHS.map(m => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Sets the boundary for resetting yearly leave allotments and tax computations.</p>
            </div>
          </CardContent>
        </Card>

        {/* Organization Workday Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-rose-500" />
              System Core Hours & Workdays
            </CardTitle>
            <CardDescription>Default working week structure and baseline attendance shifts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Workday Start Time</Label>
                <Input
                  type="time"
                  id="startTime"
                  value={settings.workingHours.startTime}
                  onChange={e => setSettings(p => ({
                    ...p,
                    workingHours: { ...p.workingHours, startTime: e.target.value },
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">Workday End Time</Label>
                <Input
                  type="time"
                  id="endTime"
                  value={settings.workingHours.endTime}
                  onChange={e => setSettings(p => ({
                    ...p,
                    workingHours: { ...p.workingHours, endTime: e.target.value },
                  }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pattern">Weekly Off pattern</Label>
              <Select
                value={settings.workingDays?.weeklyOffPattern || WeeklyOffPattern.MON_FRI}
                onValueChange={val => setSettings(p => ({
                  ...p,
                  workingDays: { weeklyOffPattern: val as WeeklyOffPattern },
                }))}
              >
                <SelectTrigger id="pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WeeklyOffPattern.MON_FRI}>Saturday & Sunday Off</SelectItem>
                  <SelectItem value={WeeklyOffPattern.MON_SAT}>Sunday Off Only</SelectItem>
                  <SelectItem value={WeeklyOffPattern.SECOND_FOURTH_SAT}>2nd & 4th Saturday Off, Sunday Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leave Allocation Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-emerald-500" />
              Base Leave Allocation
            </CardTitle>
            <CardDescription>Setup default annual limits for standard leave classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sickLeave">Sick Leave</Label>
                <Input
                  type="number"
                  id="sickLeave"
                  value={settings.leavePolicy.sickLeave}
                  onChange={e => setSettings(p => ({
                    ...p,
                    leavePolicy: { ...p.leavePolicy, sickLeave: Number(e.target.value) },
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="casualLeave">Casual Leave</Label>
                <Input
                  type="number"
                  id="casualLeave"
                  value={settings.leavePolicy.casualLeave}
                  onChange={e => setSettings(p => ({
                    ...p,
                    leavePolicy: { ...p.leavePolicy, casualLeave: Number(e.target.value) },
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vacationLeave">Vacation</Label>
                <Input
                  type="number"
                  id="vacationLeave"
                  value={settings.leavePolicy.vacationLeave}
                  onChange={e => setSettings(p => ({
                    ...p,
                    leavePolicy: { ...p.leavePolicy, vacationLeave: Number(e.target.value) },
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={loadSettings}>Discard Changes</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
