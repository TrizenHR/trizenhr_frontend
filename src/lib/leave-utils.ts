import {
  ApproverType,
  ApprovalWorkflow,
  Leave,
  LeaveStatus,
  LeaveTypeRecord,
} from './types';

export function isLeaveTypeRecord(
  value: string | LeaveTypeRecord | undefined | null
): value is LeaveTypeRecord {
  return typeof value === 'object' && value !== null && 'name' in value;
}

export function resolveLeaveTypeName(leave: Leave): string {
  if (leave.otherLeaveTypeName?.trim()) {
    return leave.otherLeaveTypeName.trim();
  }
  if (isLeaveTypeRecord(leave.leaveTypeId)) {
    return leave.leaveTypeId.name;
  }
  return 'Leave';
}

export function resolveLeaveTypeCode(leave: Leave): string {
  if (isLeaveTypeRecord(leave.leaveTypeId)) {
    return leave.leaveTypeId.code;
  }
  return '';
}

export function formatWorkflowSteps(workflow: ApprovalWorkflow | string | undefined): string {
  if (!workflow || typeof workflow === 'string') return '';
  return workflow.steps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => s.approverType)
    .join(' → ');
}

export function formatApproverType(type: ApproverType): string {
  const labels: Record<ApproverType, string> = {
    [ApproverType.SUPERVISOR]: 'Manager',
    [ApproverType.HR]: 'HR',
    [ApproverType.ADMIN]: 'Admin',
  };
  return labels[type] ?? type;
}

export function normalizeLeaveStatus(status?: string | null): LeaveStatus | null {
  if (!status) return null;
  const upper = status.toUpperCase();
  if (Object.values(LeaveStatus).includes(upper as LeaveStatus)) {
    return upper as LeaveStatus;
  }
  const legacy: Record<string, LeaveStatus> = {
    pending: LeaveStatus.PENDING,
    approved: LeaveStatus.APPROVED,
    rejected: LeaveStatus.REJECTED,
    cancelled: LeaveStatus.CANCELLED,
  };
  return legacy[status.toLowerCase()] ?? null;
}

export function getLeaveStatusLabel(status: LeaveStatus | string): string {
  const normalized = normalizeLeaveStatus(status) ?? LeaveStatus.PENDING;
  const labels: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: 'Pending',
    [LeaveStatus.PARTIALLY_APPROVED]: 'In Review',
    [LeaveStatus.APPROVED]: 'Approved',
    [LeaveStatus.REJECTED]: 'Rejected',
    [LeaveStatus.CANCELLED]: 'Cancelled',
  };
  return labels[normalized];
}

export function getLeaveStatusVariant(
  status: LeaveStatus | string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const normalized = normalizeLeaveStatus(status) ?? LeaveStatus.PENDING;
  switch (normalized) {
    case LeaveStatus.APPROVED:
      return 'default';
    case LeaveStatus.REJECTED:
      return 'destructive';
    case LeaveStatus.CANCELLED:
      return 'outline';
    case LeaveStatus.PARTIALLY_APPROVED:
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function isLeaveAwaitingApproval(status: LeaveStatus | string): boolean {
  const normalized = normalizeLeaveStatus(status);
  return (
    normalized === LeaveStatus.PENDING || normalized === LeaveStatus.PARTIALLY_APPROVED
  );
}

export function getLeaveTypeColor(code: string, status?: string): string {
  const normalized = status ? normalizeLeaveStatus(status) : null;
  if (normalized === LeaveStatus.APPROVED) {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  const colors: Record<string, string> = {
    SL: 'bg-red-50 text-red-700 border-red-200',
    CL: 'bg-blue-50 text-blue-700 border-blue-200',
    VAC: 'bg-green-50 text-green-700 border-green-200',
    EL: 'bg-purple-50 text-purple-700 border-purple-200',
    BL: 'bg-gray-50 text-gray-700 border-gray-200',
    UPL: 'bg-orange-50 text-orange-700 border-orange-200',
    ML: 'bg-pink-50 text-pink-700 border-pink-200',
    OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return colors[code.toUpperCase()] ?? 'bg-muted text-foreground border-border';
}
