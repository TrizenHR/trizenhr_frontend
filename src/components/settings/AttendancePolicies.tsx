
import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit,
  Trash,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AttendancePoliciesProps {
  onChange: () => void;
}

const initialLeaveTypes = [
  { 
    id: 1, 
    name: 'Casual Leave (CL)', 
    days: 12, 
    accrual: 'monthly', 
    carryForward: true, 
    carryLimit: 3, 
    halfDayAllowed: true,
    color: '#38bdf8'
  },
  { 
    id: 2, 
    name: 'Sick Leave (SL)', 
    days: 8, 
    accrual: 'quarterly', 
    carryForward: false, 
    carryLimit: 0, 
    halfDayAllowed: true,
    color: '#fb7185'
  },
  { 
    id: 3, 
    name: 'Earned Leave (EL)', 
    days: 15, 
    accrual: 'yearly', 
    carryForward: true, 
    carryLimit: 5, 
    halfDayAllowed: false,
    color: '#a3e635'
  },
  { 
    id: 4, 
    name: 'Work From Home (WFH)', 
    days: 10, 
    accrual: 'monthly', 
    carryForward: false, 
    carryLimit: 0, 
    halfDayAllowed: true,
    color: '#60a5fa'
  }
];

const AttendancePolicies: React.FC<AttendancePoliciesProps> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceSettings, setAttendanceSettings] = useState({
    lateMarkThreshold: 15,
    halfDayAfter: 240,
    gracePeriod: 3,
    autoApproval: false,
    weekendAttendance: false,
    holidayAttendance: false,
    manualEntryAllowed: true,
    requireApproval: true
  });
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);
  const [isAddingLeaveType, setIsAddingLeaveType] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<typeof initialLeaveTypes[0] | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendanceSettings((prev) => ({ 
      ...prev, 
      [name]: name === 'lateMarkThreshold' || name === 'halfDayAfter' || name === 'gracePeriod' 
        ? parseInt(value, 10) 
        : value 
    }));
    onChange();
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setAttendanceSettings((prev) => ({ ...prev, [name]: checked }));
    onChange();
  };

  const handleAddLeaveType = () => {
    setEditingLeaveType(null);
    setIsAddingLeaveType(true);
  };

  const handleEditLeaveType = (leaveType: typeof initialLeaveTypes[0]) => {
    setEditingLeaveType(leaveType);
    setIsAddingLeaveType(true);
  };

  const handleDeleteConfirm = (id: number) => {
    setLeaveToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteLeaveType = () => {
    if (leaveToDelete) {
      setLeaveTypes(leaveTypes.filter(type => type.id !== leaveToDelete));
      setDeleteConfirmOpen(false);
      setLeaveToDelete(null);
      onChange();
    }
  };

  const handleSaveLeaveType = (leaveType: typeof initialLeaveTypes[0]) => {
    if (editingLeaveType) {
      setLeaveTypes(leaveTypes.map(type => 
        type.id === editingLeaveType.id ? leaveType : type
      ));
    } else {
      setLeaveTypes([...leaveTypes, { ...leaveType, id: leaveTypes.length + 1 }]);
    }
    setIsAddingLeaveType(false);
    setEditingLeaveType(null);
    onChange();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Attendance & Leave Policies</h2>
        <p className="text-gray-500 text-sm">Configure rules for tracking attendance and managing leave requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance">
            <Clock className="mr-2 h-4 w-4" />
            Attendance Settings
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="mr-2 h-4 w-4" />
            Leave Types & Rules
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5" />
                  Late Arrival Policy
                </CardTitle>
                <CardDescription>Rules for managing late arrivals and absences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lateMarkThreshold">
                    Late Mark Threshold (minutes)
                  </Label>
                  <Input 
                    id="lateMarkThreshold" 
                    name="lateMarkThreshold" 
                    type="number" 
                    min="0"
                    value={attendanceSettings.lateMarkThreshold} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-gray-500">
                    Employees arriving after this many minutes will be marked late
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="halfDayAfter">
                    Auto Half-Day After (minutes)
                  </Label>
                  <Input 
                    id="halfDayAfter" 
                    name="halfDayAfter" 
                    type="number"
                    min="0" 
                    value={attendanceSettings.halfDayAfter} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-gray-500">
                    Arrivals after this many minutes will be marked as half-day
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">
                    Grace Period Per Month
                  </Label>
                  <Input 
                    id="gracePeriod" 
                    name="gracePeriod" 
                    type="number"
                    min="0" 
                    value={attendanceSettings.gracePeriod} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-gray-500">
                    Number of late marks allowed without penalty per month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5" />
                  General Attendance Settings
                </CardTitle>
                <CardDescription>Configure how attendance is tracked and managed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-approval">Auto-Approve Attendance</Label>
                    <p className="text-sm text-gray-500">
                      Automatically approve all attendance records
                    </p>
                  </div>
                  <Switch 
                    id="auto-approval" 
                    checked={attendanceSettings.autoApproval}
                    onCheckedChange={(checked) => handleToggleChange('autoApproval', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekend">Enable Weekend Attendance</Label>
                    <p className="text-sm text-gray-500">
                      Allow tracking attendance on weekends
                    </p>
                  </div>
                  <Switch 
                    id="weekend" 
                    checked={attendanceSettings.weekendAttendance}
                    onCheckedChange={(checked) => handleToggleChange('weekendAttendance', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="holiday">Enable Holiday Attendance</Label>
                    <p className="text-sm text-gray-500">
                      Allow tracking attendance on holidays
                    </p>
                  </div>
                  <Switch 
                    id="holiday" 
                    checked={attendanceSettings.holidayAttendance}
                    onCheckedChange={(checked) => handleToggleChange('holidayAttendance', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="manual-entry">Allow Manual Entries</Label>
                    <p className="text-sm text-gray-500">
                      Employees can manually add missing attendance
                    </p>
                  </div>
                  <Switch 
                    id="manual-entry" 
                    checked={attendanceSettings.manualEntryAllowed}
                    onCheckedChange={(checked) => handleToggleChange('manualEntryAllowed', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require Manager Approval</Label>
                    <p className="text-sm text-gray-500">
                      Manual entries require manager approval
                    </p>
                  </div>
                  <Switch 
                    id="require-approval" 
                    checked={attendanceSettings.requireApproval}
                    onCheckedChange={(checked) => handleToggleChange('requireApproval', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leave" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Leave Type Configuration</h3>
            <Button onClick={handleAddLeaveType}>
              <Plus className="mr-2 h-4 w-4" />
              Add Leave Type
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Leave Type</TableHead>
                <TableHead>Yearly Quota</TableHead>
                <TableHead>Accrual Frequency</TableHead>
                <TableHead>Carry Forward</TableHead>
                <TableHead>Half Day Allowed</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell className="font-medium">{leaveType.name}</TableCell>
                  <TableCell>{leaveType.days} days</TableCell>
                  <TableCell className="capitalize">{leaveType.accrual}</TableCell>
                  <TableCell>
                    {leaveType.carryForward ? 
                      `Yes (up to ${leaveType.carryLimit} days)` : 
                      'No'
                    }
                  </TableCell>
                  <TableCell>{leaveType.halfDayAllowed ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: leaveType.color }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditLeaveType(leaveType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteConfirm(leaveType.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leave Approvals & Workflow</CardTitle>
              <CardDescription>Configure how leave requests are processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="approval-method">Approval Method</Label>
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue placeholder="Select approval method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager Approval</SelectItem>
                      <SelectItem value="hr">HR Approval</SelectItem>
                      <SelectItem value="both">Both (Sequential)</SelectItem>
                      <SelectItem value="auto">Auto-Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min-notice">Minimum Notice Period (days)</Label>
                  <Input id="min-notice" type="number" defaultValue="1" />
                  <p className="text-xs text-gray-500">
                    Advanced notice required for leave requests
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="restrict-weekends">Restrict Weekend Leave Requests</Label>
                  <p className="text-sm text-gray-500">
                    Prevent employees from requesting leaves only on Mondays/Fridays
                  </p>
                </div>
                <Switch id="restrict-weekends" />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="require-reason">Require Reason for Leave</Label>
                  <p className="text-sm text-gray-500">
                    Employees must provide a reason when requesting leave
                  </p>
                </div>
                <Switch id="require-reason" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for adding/editing leave types */}
      <Dialog 
        open={isAddingLeaveType} 
        onOpenChange={(open) => {
          if (!open) setIsAddingLeaveType(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}</DialogTitle>
            <DialogDescription>
              Configure settings for this leave type
            </DialogDescription>
          </DialogHeader>
          
          <LeaveTypeForm 
            leaveType={editingLeaveType} 
            onSave={handleSaveLeaveType}
            onCancel={() => setIsAddingLeaveType(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for delete */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leave Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLeaveType}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface LeaveTypeFormProps {
  leaveType: typeof initialLeaveTypes[0] | null;
  onSave: (leaveType: typeof initialLeaveTypes[0]) => void;
  onCancel: () => void;
}

const LeaveTypeForm: React.FC<LeaveTypeFormProps> = ({ leaveType, onSave, onCancel }) => {
  const [formData, setFormData] = useState(leaveType || {
    id: 0,
    name: '',
    days: 12,
    accrual: 'monthly',
    carryForward: false,
    carryLimit: 0,
    halfDayAllowed: true,
    color: '#38bdf8'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Leave Type Name</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="e.g., Casual Leave (CL)" 
          value={formData.name} 
          onChange={handleInputChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="days">Yearly Quota (days)</Label>
          <Input 
            id="days" 
            name="days" 
            type="number" 
            min="0"
            value={formData.days} 
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accrual">Accrual Frequency</Label>
          <Select 
            value={formData.accrual} 
            onValueChange={(value) => handleSelectChange('accrual', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="carryForward">Allow Carry Forward</Label>
          <p className="text-sm text-gray-500">
            Unused leaves can be carried forward to next year
          </p>
        </div>
        <Switch 
          id="carryForward" 
          checked={formData.carryForward}
          onCheckedChange={(checked) => handleToggleChange('carryForward', checked)}
        />
      </div>
      
      {formData.carryForward && (
        <div className="space-y-2">
          <Label htmlFor="carryLimit">Maximum Carry Forward Limit</Label>
          <Input 
            id="carryLimit" 
            name="carryLimit" 
            type="number" 
            min="0"
            value={formData.carryLimit} 
            onChange={handleInputChange}
          />
          <p className="text-xs text-gray-500">
            Maximum days that can be carried forward
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="halfDayAllowed">Allow Half-Day Leaves</Label>
          <p className="text-sm text-gray-500">
            Employees can apply for half-day leaves
          </p>
        </div>
        <Switch 
          id="halfDayAllowed" 
          checked={formData.halfDayAllowed}
          onCheckedChange={(checked) => handleToggleChange('halfDayAllowed', checked)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="color">Color Code</Label>
        <div className="flex items-center gap-3">
          <Input 
            id="color" 
            name="color" 
            type="color" 
            value={formData.color} 
            onChange={handleInputChange}
            className="w-12 h-10 p-1"
          />
          <div className="flex-1">
            <Badge 
              style={{ backgroundColor: formData.color }} 
              className="text-white"
            >
              {formData.name || 'Leave Type Preview'}
            </Badge>
          </div>
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(formData)}
          disabled={!formData.name.trim()}
        >
          {leaveType ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AttendancePolicies;
