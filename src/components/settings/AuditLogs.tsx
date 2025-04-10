
import React, { useState } from 'react';
import { 
  Search,
  FileText,
  Calendar,
  User,
  Filter,
  Download,
  Clock,
  ShieldAlert,
  UserPlus,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for audit logs
const auditLogs = [
  {
    id: 1,
    user: 'admin@trizen.com',
    action: 'login',
    actionText: 'User Login',
    details: 'Successful login via web browser',
    timestamp: '2025-04-10 09:45:12',
    ipAddress: '192.168.1.10',
    module: 'auth'
  },
  {
    id: 2,
    user: 'john.smith@trizen.com',
    action: 'create',
    actionText: 'Employee Added',
    details: 'Added new employee: Emma Johnson',
    timestamp: '2025-04-10 10:23:05',
    ipAddress: '192.168.1.15',
    module: 'employee'
  },
  {
    id: 3,
    user: 'emma.johnson@trizen.com',
    action: 'update',
    actionText: 'Profile Updated',
    details: 'Updated profile information: phone number',
    timestamp: '2025-04-10 11:12:34',
    ipAddress: '192.168.1.22',
    module: 'employee'
  },
  {
    id: 4,
    user: 'admin@trizen.com',
    action: 'update',
    actionText: 'Settings Changed',
    details: 'Updated company working hours: 9:00 AM - 6:00 PM',
    timestamp: '2025-04-09 15:47:21',
    ipAddress: '192.168.1.10',
    module: 'settings'
  },
  {
    id: 5,
    user: 'michael.brown@trizen.com',
    action: 'approve',
    actionText: 'Leave Approved',
    details: 'Approved leave request for Sarah Wilson (2025-04-15 to 2025-04-17)',
    timestamp: '2025-04-09 14:32:10',
    ipAddress: '192.168.1.18',
    module: 'leave'
  },
  {
    id: 6,
    user: 'sarah.wilson@trizen.com',
    action: 'create',
    actionText: 'Leave Request',
    details: 'Created leave request: Sick Leave (2025-04-15 to 2025-04-17)',
    timestamp: '2025-04-09 13:58:45',
    ipAddress: '192.168.1.25',
    module: 'leave'
  },
  {
    id: 7,
    user: 'david.taylor@trizen.com',
    action: 'delete',
    actionText: 'Record Deleted',
    details: 'Deleted attendance record for 2025-04-08',
    timestamp: '2025-04-09 10:11:32',
    ipAddress: '192.168.1.30',
    module: 'attendance'
  },
  {
    id: 8,
    user: 'admin@trizen.com',
    action: 'export',
    actionText: 'Data Export',
    details: 'Exported employee data (CSV format)',
    timestamp: '2025-04-08 16:22:07',
    ipAddress: '192.168.1.10',
    module: 'data'
  },
  {
    id: 9,
    user: 'john.smith@trizen.com',
    action: 'logout',
    actionText: 'User Logout',
    details: 'User logged out',
    timestamp: '2025-04-08 17:30:45',
    ipAddress: '192.168.1.15',
    module: 'auth'
  },
  {
    id: 10,
    user: 'admin@trizen.com',
    action: 'permission',
    actionText: 'Permission Changed',
    details: 'Updated role permissions for HR Manager',
    timestamp: '2025-04-08 14:09:36',
    ipAddress: '192.168.1.10',
    module: 'settings'
  }
];

const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [userFilter, setUserFilter] = useState('all');

  // Get unique users for filtering
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.user)));

  // Filter logs based on all filters
  const filteredLogs = auditLogs.filter(log => {
    // Search filter
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    
    // Module filter
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    
    // Action filter
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    // User filter
    const matchesUser = userFilter === 'all' || log.user === userFilter;
    
    // Date filter
    const logDate = new Date(log.timestamp);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;
    
    return matchesSearch && matchesModule && matchesAction && matchesUser && matchesDateFrom && matchesDateTo;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="h-4 w-4" />;
      case 'logout': return <LogOut className="h-4 w-4" />;
      case 'create': return <UserPlus className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash className="h-4 w-4" />;
      case 'approve': return <Check className="h-4 w-4" />;
      case 'reject': return <X className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'permission': return <ShieldAlert className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-green-500';
      case 'logout': return 'bg-blue-500';
      case 'create': return 'bg-blue-500';
      case 'update': return 'bg-amber-500';
      case 'delete': return 'bg-red-500';
      case 'approve': return 'bg-green-500';
      case 'reject': return 'bg-red-500';
      case 'export': return 'bg-purple-500';
      case 'permission': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'auth': return <User className="h-4 w-4" />;
      case 'employee': return <User className="h-4 w-4" />;
      case 'leave': return <Calendar className="h-4 w-4" />;
      case 'attendance': return <Clock className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      case 'data': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Audit Logs</h2>
        <p className="text-gray-500 text-sm">Track user actions and system changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Logs</CardTitle>
          <CardDescription>Refine logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search logs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="employee">Employee Management</SelectItem>
                  <SelectItem value="leave">Leave Management</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="data">Data Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approval</SelectItem>
                  <SelectItem value="reject">Rejection</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="permission">Permission Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP') : 'From Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP') : 'To Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setModuleFilter('all');
                setActionFilter('all');
                setDateFrom(undefined);
                setDateTo(undefined);
                setUserFilter('all');
              }}
            >
              Clear Filters
            </Button>
            
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <div>
          <Badge variant="outline" className="mr-2">
            {filteredLogs.length} Logs
          </Badge>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead className="w-[300px]">Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No audit logs found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getActionColor(log.action)} text-white flex items-center gap-1`}
                        >
                          {getActionIcon(log.action)}
                          {log.actionText}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getModuleIcon(log.module)}
                          <span className="capitalize">{log.module}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-end space-x-2 py-4 px-4">
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4"
                disabled
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
