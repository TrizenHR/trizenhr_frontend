'use client';

import { useEffect, useMemo, useState } from 'react';
import { leaveTypeApi } from '@/lib/api';
import { LeaveTypeRecord, LeaveTypeStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Layers, Plus, CheckCircle2, PauseCircle, Loader2 } from 'lucide-react';

type FormState = {
  name: string;
  code: string;
  description: string;
  isPaid: boolean;
  requiresDocument: boolean;
  allowHalfDay: boolean;
  isOther: boolean;
};

const emptyForm: FormState = {
  name: '',
  code: '',
  description: '',
  isPaid: true,
  requiresDocument: false,
  allowHalfDay: true,
  isOther: false,
};

export default function LeaveTypesPage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<LeaveTypeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveTypeRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const stats = useMemo(
    () => ({
      total: types.length,
      active: types.filter((t) => t.status === LeaveTypeStatus.ACTIVE).length,
      inactive: types.filter((t) => t.status === LeaveTypeStatus.INACTIVE).length,
    }),
    [types]
  );

  useEffect(() => {
    void loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await leaveTypeApi.getAll();
      setTypes(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave types', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (type: LeaveTypeRecord) => {
    setEditing(type);
    setForm({
      name: type.name,
      code: type.code,
      description: type.description ?? '',
      isPaid: type.isPaid,
      requiresDocument: type.requiresDocument,
      allowHalfDay: type.allowHalfDay,
      isOther: type.isOther,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: 'Validation', description: 'Name and code are required', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      if (editing) {
        await leaveTypeApi.update(editing._id, form);
        toast({ title: 'Updated', description: 'Leave type updated' });
      } else {
        await leaveTypeApi.create(form);
        toast({ title: 'Created', description: 'Leave type created' });
      }
      setDialogOpen(false);
      await loadTypes();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save leave type',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (type: LeaveTypeRecord) => {
    const next =
      type.status === LeaveTypeStatus.ACTIVE ? LeaveTypeStatus.INACTIVE : LeaveTypeStatus.ACTIVE;
    try {
      await leaveTypeApi.updateStatus(type._id, next);
      toast({
        title: next === LeaveTypeStatus.ACTIVE ? 'Activated' : 'Deactivated',
        description: `${type.name} is now ${next === LeaveTypeStatus.ACTIVE ? 'active' : 'inactive'}`,
      });
      await loadTypes();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Policies</p>
        <h1 className="text-2xl font-bold md:text-3xl">Leave Types</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure organization leave categories
        </p>
      </div>

      <div className="grid gap-3 grid-cols-3 max-w-lg">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Inactive</p>
              <p className="text-xl font-bold">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={openCreate} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Leave Type
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {types.map((type) => (
            <Card key={type._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    <CardDescription>
                      {type.code} · {type.isPaid ? 'Paid' : 'Unpaid'}
                    </CardDescription>
                  </div>
                  <Badge variant={type.status === LeaveTypeStatus.ACTIVE ? 'default' : 'secondary'}>
                    {type.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(type)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => void toggleStatus(type)}
                >
                  {type.status === LeaveTypeStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Paid leave</Label>
              <Switch checked={form.isPaid} onCheckedChange={(v) => setForm({ ...form, isPaid: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Requires document</Label>
              <Switch
                checked={form.requiresDocument}
                onCheckedChange={(v) => setForm({ ...form, requiresDocument: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Allow half day</Label>
              <Switch
                checked={form.allowHalfDay}
                onCheckedChange={(v) => setForm({ ...form, allowHalfDay: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>&quot;Other&quot; type (free text)</Label>
              <Switch checked={form.isOther} onCheckedChange={(v) => setForm({ ...form, isOther: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
