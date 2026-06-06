'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { platformApi } from '@/lib/api';
import type { DemoInvitationDefaults } from '@/lib/types';

const INVITE_HOUR_PRESETS = [24, 48, 72] as const;
const DEMO_DAY_PRESETS = [7, 14, 30] as const;

export function DemoInvitationDefaultsSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState<DemoInvitationDefaults>({
    inviteLinkTtlHours: 48,
    demoAccessTtlDays: 7,
  });

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const data = await platformApi.getDemoInvitationDefaults();
        setDefaults(data);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to load demo invitation defaults',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await platformApi.updateDemoInvitationDefaults(defaults);
      setDefaults(updated);
      toast({ title: 'Saved', description: 'Demo invitation defaults updated.' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Could not save defaults',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-blue-100 shadow-sm">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-blue-950">
          <Clock className="h-5 w-5 text-blue-600" />
          Demo invitation defaults
        </CardTitle>
        <CardDescription className="text-blue-900/70">
          Configure how long demo invite links stay valid and how long demo access lasts after
          acceptance. New invites snapshot these values at send time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invite-hours">Invite link valid for (hours)</Label>
            <Select
              value={String(defaults.inviteLinkTtlHours)}
              onValueChange={(v) =>
                setDefaults((prev) => ({ ...prev, inviteLinkTtlHours: parseInt(v, 10) }))
              }
            >
              <SelectTrigger id="invite-hours">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITE_HOUR_PRESETS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h} hours
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={168}
              value={defaults.inviteLinkTtlHours}
              onChange={(e) =>
                setDefaults((prev) => ({
                  ...prev,
                  inviteLinkTtlHours: parseInt(e.target.value, 10) || prev.inviteLinkTtlHours,
                }))
              }
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-days">Demo access after accept (days)</Label>
            <Select
              value={String(defaults.demoAccessTtlDays)}
              onValueChange={(v) =>
                setDefaults((prev) => ({ ...prev, demoAccessTtlDays: parseInt(v, 10) }))
              }
            >
              <SelectTrigger id="demo-days">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_DAY_PRESETS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={90}
              value={defaults.demoAccessTtlDays}
              onChange={(e) =>
                setDefaults((prev) => ({
                  ...prev,
                  demoAccessTtlDays: parseInt(e.target.value, 10) || prev.demoAccessTtlDays,
                }))
              }
              className="mt-2"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save defaults
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
