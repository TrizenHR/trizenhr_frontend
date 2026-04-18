'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import type { PlatformNotificationPreferences } from '@/lib/types';

const POLL_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 300] as const;

export function SystemAdminPlatformSettings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<PlatformNotificationPreferences>({
    pollIntervalSec: 45,
    refreshOnTabFocus: true,
    showUnreadBadge: true,
  });

  useEffect(() => {
    const n = user?.platformPreferences?.notifications;
    if (n) {
      setPrefs({
        pollIntervalSec: n.pollIntervalSec ?? 45,
        refreshOnTabFocus: n.refreshOnTabFocus !== false,
        showUnreadBadge: n.showUnreadBadge !== false,
      });
    }
  }, [user?.platformPreferences?.notifications]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await authApi.updatePlatformPreferences({ notifications: prefs });
      updateUser(updated);
      toast({ title: 'Saved', description: 'Platform preferences updated.' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Could not save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-950">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </CardTitle>
          <CardDescription className="text-blue-900/70">
            Control how often the header checks for updates and what is highlighted. These apply to
            your System Admin session on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-6">
          <div className="space-y-2">
            <Label htmlFor="poll-interval">Refresh interval</Label>
            <Select
              value={String(prefs.pollIntervalSec ?? 45)}
              onValueChange={(v) =>
                setPrefs((p) => ({ ...p, pollIntervalSec: Number.parseInt(v, 10) }))
              }
            >
              <SelectTrigger id="poll-interval" className="max-w-xs">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                {POLL_OPTIONS.map((sec) => (
                  <SelectItem key={sec} value={String(sec)}>
                    Every {sec} seconds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Lower values feel more real-time; higher values reduce background requests.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="tab-focus">Refresh when tab becomes visible</Label>
              <p className="text-xs text-muted-foreground">
                Pull latest notifications when you return to this browser tab.
              </p>
            </div>
            <Switch
              id="tab-focus"
              checked={prefs.refreshOnTabFocus !== false}
              onCheckedChange={(checked) => setPrefs((p) => ({ ...p, refreshOnTabFocus: checked }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="unread-badge">Unread count on bell</Label>
              <p className="text-xs text-muted-foreground">
                Show a badge on the notification icon when there are unread items.
              </p>
            </div>
            <Switch
              id="unread-badge"
              checked={prefs.showUnreadBadge !== false}
              onCheckedChange={(checked) => setPrefs((p) => ({ ...p, showUnreadBadge: checked }))}
            />
          </div>

          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save platform preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">About platform settings</CardTitle>
          <CardDescription>
            Organization-specific policies (working hours, leave, billing) are managed under the
            Organization tab and require a selected company when you use the main platform URL.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
