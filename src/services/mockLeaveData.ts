
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Sick' | 'Casual' | 'Paid' | 'Unpaid' | 'Maternity' | 'Paternity' | 'Bereavement';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  attachmentUrl?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: string;
  total: number;
  used: number;
  balance: number;
}

// Mock data for leave requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR-2025-0001',
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    department: 'Engineering',
    leaveType: 'Sick',
    fromDate: '2025-04-15',
    toDate: '2025-04-16',
    days: 2,
    reason: 'Fever and cold',
    status: 'Pending',
    appliedOn: '2025-04-12',
    attachmentUrl: '/lovable-uploads/03356e85-3c07-49e1-a539-d7a0314780cc.png',
  },
  {
    id: 'LR-2025-0002',
    employeeId: 'EMP-002',
    employeeName: 'Jane Smith',
    department: 'HR',
    leaveType: 'Casual',
    fromDate: '2025-04-20',
    toDate: '2025-04-22',
    days: 3,
    reason: 'Family function',
    status: 'Approved',
    appliedOn: '2025-04-10',
    reviewedBy: 'Admin',
    reviewedAt: '2025-04-11',
  },
  {
    id: 'LR-2025-0003',
    employeeId: 'EMP-003',
    employeeName: 'Mike Johnson',
    department: 'Marketing',
    leaveType: 'Paid',
    fromDate: '2025-04-25',
    toDate: '2025-05-02',
    days: 6,
    reason: 'Vacation',
    status: 'Rejected',
    appliedOn: '2025-04-05',
    reviewedBy: 'Admin',
    reviewedAt: '2025-04-07',
    remarks: 'High workload during this period',
  },
  {
    id: 'LR-2025-0004',
    employeeId: 'EMP-004',
    employeeName: 'Sarah Williams',
    department: 'Finance',
    leaveType: 'Maternity',
    fromDate: '2025-05-01',
    toDate: '2025-07-31',
    days: 92,
    reason: 'Maternity leave',
    status: 'Pending',
    appliedOn: '2025-04-01',
    attachmentUrl: '/lovable-uploads/a607618b-4d3d-4024-b728-4d2d5ee2f3c0.png',
  },
  {
    id: 'LR-2025-0005',
    employeeId: 'EMP-005',
    employeeName: 'Robert Brown',
    department: 'Engineering',
    leaveType: 'Sick',
    fromDate: '2025-04-18',
    toDate: '2025-04-18',
    days: 1,
    reason: 'Doctor appointment',
    status: 'Pending',
    appliedOn: '2025-04-17',
  },
  {
    id: 'LR-2025-0006',
    employeeId: 'EMP-006',
    employeeName: 'Emily Davis',
    department: 'Customer Support',
    leaveType: 'Casual',
    fromDate: '2025-04-28',
    toDate: '2025-04-30',
    days: 3,
    reason: 'Personal work',
    status: 'Approved',
    appliedOn: '2025-04-14',
    reviewedBy: 'Admin',
    reviewedAt: '2025-04-15',
  },
  {
    id: 'LR-2025-0007',
    employeeId: 'EMP-007',
    employeeName: 'David Wilson',
    department: 'Engineering',
    leaveType: 'Unpaid',
    fromDate: '2025-05-05',
    toDate: '2025-05-10',
    days: 6,
    reason: 'Family emergency',
    status: 'Pending',
    appliedOn: '2025-04-20',
  },
  {
    id: 'LR-2025-0008',
    employeeId: 'EMP-008',
    employeeName: 'Emma Taylor',
    department: 'Design',
    leaveType: 'Paid',
    fromDate: '2025-05-15',
    toDate: '2025-05-22',
    days: 6,
    reason: 'Vacation',
    status: 'Approved',
    appliedOn: '2025-04-25',
    reviewedBy: 'Admin',
    reviewedAt: '2025-04-26',
  },
];

// Mock data for leave balances
export const mockLeaveBalances: Record<string, Record<string, LeaveBalance>> = {
  'EMP-001': {
    'Sick': { employeeId: 'EMP-001', leaveType: 'Sick', total: 12, used: 4, balance: 8 },
    'Casual': { employeeId: 'EMP-001', leaveType: 'Casual', total: 15, used: 8, balance: 7 },
    'Paid': { employeeId: 'EMP-001', leaveType: 'Paid', total: 20, used: 10, balance: 10 },
  },
  'EMP-002': {
    'Sick': { employeeId: 'EMP-002', leaveType: 'Sick', total: 12, used: 2, balance: 10 },
    'Casual': { employeeId: 'EMP-002', leaveType: 'Casual', total: 15, used: 9, balance: 6 },
    'Paid': { employeeId: 'EMP-002', leaveType: 'Paid', total: 20, used: 15, balance: 5 },
  },
  'EMP-003': {
    'Sick': { employeeId: 'EMP-003', leaveType: 'Sick', total: 12, used: 0, balance: 12 },
    'Casual': { employeeId: 'EMP-003', leaveType: 'Casual', total: 15, used: 5, balance: 10 },
    'Paid': { employeeId: 'EMP-003', leaveType: 'Paid', total: 20, used: 18, balance: 2 },
  },
  'EMP-004': {
    'Sick': { employeeId: 'EMP-004', leaveType: 'Sick', total: 12, used: 6, balance: 6 },
    'Casual': { employeeId: 'EMP-004', leaveType: 'Casual', total: 15, used: 10, balance: 5 },
    'Paid': { employeeId: 'EMP-004', leaveType: 'Paid', total: 20, used: 5, balance: 15 },
    'Maternity': { employeeId: 'EMP-004', leaveType: 'Maternity', total: 180, used: 0, balance: 180 },
  },
  'EMP-005': {
    'Sick': { employeeId: 'EMP-005', leaveType: 'Sick', total: 12, used: 8, balance: 4 },
    'Casual': { employeeId: 'EMP-005', leaveType: 'Casual', total: 15, used: 7, balance: 8 },
    'Paid': { employeeId: 'EMP-005', leaveType: 'Paid', total: 20, used: 12, balance: 8 },
  },
  'EMP-006': {
    'Sick': { employeeId: 'EMP-006', leaveType: 'Sick', total: 12, used: 3, balance: 9 },
    'Casual': { employeeId: 'EMP-006', leaveType: 'Casual', total: 15, used: 12, balance: 3 },
    'Paid': { employeeId: 'EMP-006', leaveType: 'Paid', total: 20, used: 7, balance: 13 },
  },
  'EMP-007': {
    'Sick': { employeeId: 'EMP-007', leaveType: 'Sick', total: 12, used: 5, balance: 7 },
    'Casual': { employeeId: 'EMP-007', leaveType: 'Casual', total: 15, used: 15, balance: 0 },
    'Paid': { employeeId: 'EMP-007', leaveType: 'Paid', total: 20, used: 20, balance: 0 },
    'Unpaid': { employeeId: 'EMP-007', leaveType: 'Unpaid', total: 0, used: 0, balance: 0 },
  },
  'EMP-008': {
    'Sick': { employeeId: 'EMP-008', leaveType: 'Sick', total: 12, used: 2, balance: 10 },
    'Casual': { employeeId: 'EMP-008', leaveType: 'Casual', total: 15, used: 6, balance: 9 },
    'Paid': { employeeId: 'EMP-008', leaveType: 'Paid', total: 20, used: 12, balance: 8 },
  },
};

// Mock data for leave history
export const getLeaveHistory = (employeeId: string): LeaveRequest[] => {
  return mockLeaveRequests
    .filter(leave => leave.employeeId === employeeId)
    .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
    .slice(0, 5);
};

// Mock data for team overlaps
export const getTeamOverlaps = (departmentName: string, fromDate: string, toDate: string): LeaveRequest[] => {
  return mockLeaveRequests.filter(leave => 
    leave.department === departmentName && 
    leave.status !== 'Rejected' &&
    ((new Date(leave.fromDate) <= new Date(toDate) && new Date(leave.toDate) >= new Date(fromDate)))
  );
};
