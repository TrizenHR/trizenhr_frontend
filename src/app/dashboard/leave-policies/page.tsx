'use client';

import { useEffect, useMemo, useState } from 'react';
import { leavePolicyApi, leaveTypeApi, approvalWorkflowApi } from '@/lib/api';
import {
  ApprovalWorkflow,
  LeavePolicyRecord,
  LeavePolicyStatus,
  LeaveTypeRecord,
} from '@/lib/types';
import { formatWorkflowSteps, isLeaveTypeRecord } from '@/lib/leave-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, CheckCircle2, Star, Loader2, Trash2 } from 'lucide-react';

type RuleForm = { leaveTypeId: string; annualAllocation: number };

export default function LeavePoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<LeavePolicyRecord[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRecord[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeavePolicyRecord | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [rules, setRules] = useState<RuleForm[]>([]);

  const stats = useMemo(
    () => ({
      total: policies.length,
      active: policies.filter((p) => p.status === LeavePolicyStatus.ACTIVE).length,
      default: policies.filter((p) => p.isDefault).length,
    }),
    [policies]
  );

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [policyData, typeData, workflowData] = await Promise.all([
        leavePolicyApi.getAll(),
        leaveTypeApi.getAll(true),
        approvalWorkflowApi.getAll(),
      ]);
      setPolicies(policyData);
      setLeaveTypes(typeData);
      setWorkflows(workflowData);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave policies', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setPolicyName('');
    setWorkflowId(workflows.find((w) => w.isDefault)?._id ?? workflows[0]?._id ?? '');
    setRules(
      leaveTypes.slice(0, 4).map((t) => ({
        leaveTypeId: t._id,
        annualAllocation: t.code === 'UPL' ? 0 : 12,
      }))
    );
    setDialogOpen(true);
  };

  const openEdit = (policy: LeavePolicyRecord) => {
    setEditing(policy);
    setPolicyName(policy.policyName);
    const wf = policy.workflowId;
    setWorkflowId(typeof wf === 'string' ? wf : wf._id);
    setRules(
      policy.leaveRules.map((r) => ({
        leaveTypeId: isLeaveTypeRecord(r.leaveTypeId) ? r.leaveTypeId._id : String(r.leaveTypeId),
        annualAllocation: r.annualAllocation,
      }))
    );
    setDialogOpen(true);
  };

  const save = async () => {
    if (!policyName.trim() || !workflowId || rules.length === 0) {
      toast({ title: 'Validation', description: 'Name, workflow, and rules are required', variant: 'destructive' });
      return;
    }
    const payload = { policyName: policyName.trim(), workflowId, leaveRules: rules };
    try {
      setIsSaving(true);
      if (editing) {
        await leavePolicyApi.update(editing._id, payload);
        toast({ title: 'Updated', description: 'Leave policy updated' });
      } else {
        await leavePolicyApi.create(payload);
        toast({ title: 'Created', description: 'Leave policy created' });
      }
      setDialogOpen(false);
      await loadAll();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save policy',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await leavePolicyApi.setDefault(id);
      toast({ title: 'Default updated' });
      await loadAll();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to set default',
        variant: 'destructive',
      });
    }
  };

  const remove = async (policy: LeavePolicyRecord) => {
    if (!confirm(`Delete policy "${policy.policyName}"?`)) return;
    try {
      await leavePolicyApi.delete(policy._id);
      toast({ title: 'Deleted' });
      await loadAll();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete policy',
        variant: 'destructive',
      });
    }
  };

  const ruleSummary = (policy: LeavePolicyRecord) => {
    const lines = policy.leaveRules.slice(0, 3).map((r) => {
      const name = isLeaveTypeRecord(r.leaveTypeId) ? r.leaveTypeId.name : 'Leave';
      return `${name}: ${r.annualAllocation} days/yr`;
    });
    const extra = policy.leaveRules.length > 3 ? `+${policy.leaveRules.length - 3} more` : null;
    return { lines, extra, count: policy.leaveRules.length };
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Policies</p>
        <h1 className="text-2xl font-bold md:text-3xl">Leave Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign leave allocations and approval workflows
        </p>
      </div>

      <div className="grid gap-3 grid-cols-3 max-w-lg">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
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
            <Star className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Default</p>
              <p className="text-xl font-bold">{stats.default}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={openCreate} className="w-full sm:w-auto" disabled={workflows.length === 0}>
        <Plus className="mr-2 h-4 w-4" />
        Create Leave Policy
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => {
            const summary = ruleSummary(policy);
            const wf =
              typeof policy.workflowId === 'object' ? policy.workflowId : undefined;
            return (
              <Card key={policy._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{policy.policyName}</CardTitle>
                      <CardDescription className="mt-1">
                        {wf ? formatWorkflowSteps(wf) : 'Workflow linked'}
                      </CardDescription>
                    </div>
                    {policy.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {summary.count} leave rule{summary.count !== 1 ? 's' : ''}
                  </p>
                  <ul className="text-sm space-y-0.5">
                    {summary.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                    {summary.extra && <li className="text-muted-foreground">{summary.extra}</li>}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(policy)}>
                      Edit
                    </Button>
                    {!policy.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => void setDefault(policy._id)}>
                        Set Default
                      </Button>
                    )}
                    {!policy.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => void remove(policy)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Leave Policy' : 'Create Leave Policy'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Policy name</Label>
              <Input value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Approval workflow</Label>
              <Select value={workflowId} onValueChange={setWorkflowId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((w) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.workflowName} ({formatWorkflowSteps(w)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Leave rules</Label>
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={rule.leaveTypeId}
                      onValueChange={(v) => {
                        const next = [...rules];
                        next[index] = { ...next[index], leaveTypeId: v };
                        setRules(next);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.name} ({t.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Days/yr</Label>
                    <Input
                      type="number"
                      min={0}
                      value={rule.annualAllocation}
                      onChange={(e) => {
                        const next = [...rules];
                        next[index] = {
                          ...next[index],
                          annualAllocation: Number(e.target.value),
                        };
                        setRules(next);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRules(rules.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRules([
                    ...rules,
                    { leaveTypeId: leaveTypes[0]?._id ?? '', annualAllocation: 0 },
                  ])
                }
              >
                Add rule
              </Button>
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
