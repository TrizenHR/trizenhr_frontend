'use client';

import { useEffect, useMemo, useState } from 'react';
import { approvalWorkflowApi } from '@/lib/api';
import { ApprovalWorkflow, ApproverType, WorkflowStatus } from '@/lib/types';
import { formatApproverType, formatWorkflowSteps } from '@/lib/leave-utils';
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
import { GitBranch, Plus, CheckCircle2, Star, Loader2, Trash2 } from 'lucide-react';

const APPROVER_OPTIONS = [
  ApproverType.SUPERVISOR,
  ApproverType.HR,
  ApproverType.ADMIN,
];

export default function ApprovalWorkflowsPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApprovalWorkflow | null>(null);
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<ApproverType[]>([ApproverType.SUPERVISOR, ApproverType.HR]);

  const stats = useMemo(
    () => ({
      total: workflows.length,
      active: workflows.filter((w) => w.status === WorkflowStatus.ACTIVE).length,
      default: workflows.filter((w) => w.isDefault).length,
    }),
    [workflows]
  );

  useEffect(() => {
    void loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const data = await approvalWorkflowApi.getAll();
      setWorkflows(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load workflows', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSteps([ApproverType.SUPERVISOR, ApproverType.HR]);
    setDialogOpen(true);
  };

  const openEdit = (workflow: ApprovalWorkflow) => {
    setEditing(workflow);
    setName(workflow.workflowName);
    setSteps(
      workflow.steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s) => s.approverType)
    );
    setDialogOpen(true);
  };

  const save = async () => {
    if (!name.trim() || steps.length === 0) {
      toast({ title: 'Validation', description: 'Name and at least one step required', variant: 'destructive' });
      return;
    }
    const payload = {
      workflowName: name.trim(),
      steps: steps.map((approverType, index) => ({ order: index + 1, approverType })),
    };
    try {
      setIsSaving(true);
      if (editing) {
        await approvalWorkflowApi.update(editing._id, payload);
        toast({ title: 'Updated', description: 'Workflow updated' });
      } else {
        await approvalWorkflowApi.create(payload);
        toast({ title: 'Created', description: 'Workflow created' });
      }
      setDialogOpen(false);
      await loadWorkflows();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await approvalWorkflowApi.setDefault(id);
      toast({ title: 'Default updated' });
      await loadWorkflows();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to set default',
        variant: 'destructive',
      });
    }
  };

  const remove = async (workflow: ApprovalWorkflow) => {
    if (!confirm(`Delete workflow "${workflow.workflowName}"?`)) return;
    try {
      await approvalWorkflowApi.delete(workflow._id);
      toast({ title: 'Deleted' });
      await loadWorkflows();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete workflow',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Policies</p>
        <h1 className="text-2xl font-bold md:text-3xl">Approval Workflows</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure multi-step leave approval chains
        </p>
      </div>

      <div className="grid gap-3 grid-cols-3 max-w-lg">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Workflows</p>
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

      <Button onClick={openCreate} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Workflow
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Card key={workflow._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{workflow.workflowName}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatWorkflowSteps(workflow)}
                    </CardDescription>
                  </div>
                  {workflow.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(workflow)}>
                  Edit
                </Button>
                {!workflow.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => void setDefault(workflow._id)}>
                    Set Default
                  </Button>
                )}
                {!workflow.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => void remove(workflow)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Workflow' : 'Add Workflow'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Approval steps</Label>
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                  <Select
                    value={step}
                    onValueChange={(v) => {
                      const next = [...steps];
                      next[index] = v as ApproverType;
                      setSteps(next);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVER_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {formatApproverType(opt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={steps.length <= 1}
                    onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSteps([...steps, ApproverType.HR])}
              >
                Add step
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
