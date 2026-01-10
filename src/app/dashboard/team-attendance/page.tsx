'use client';

import { useEffect, useState } from 'react';
import { attendanceApi, userApi } from '@/lib/api';
import { Attendance, AttendanceStatus, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, TrendingUp, Download } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

type TeamMemberStatus = {
  user: User;
  attendance?: Attendance;
  status: 'present' | 'absent' | 'on_leave' | 'half_day' | 'late' | 'not_marked';
};

export default function TeamAttendancePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberStatus[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMemberStatus[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    halfDay: 0,
    late: 0,
    notMarked: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTeamAttendance();
  }, [selectedDate]);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, statusFilter, searchQuery]);

  const loadTeamAttendance = async () => {
    try {
      setIsLoading(true);

      // Get all users (for now, show all employees)
      // TODO: Filter by supervisor's team when team/department relationship is implemented
      const users = await userApi.getAllUsers();

      // Get attendance for selected date
      const startDate = startOfDay(new Date(selectedDate));
      const endDate = endOfDay(new Date(selectedDate));
      
      const attendanceResponse = await attendanceApi.getAllAttendance({
        startDate,
        endDate,
      });

      // Map users with their attendance
      const teamStatus: TeamMemberStatus[] = users.map((user) => {
        const attendance = attendanceResponse.records.find(
          (att) => {
            const userId = typeof att.userId === 'object' 
              ? (att.userId._id || att.userId.id)
              : att.userId;
            return userId === user.id || userId === user._id;
          }
        );

        let status: TeamMemberStatus['status'] = 'not_marked';
        
        if (attendance) {
          switch (attendance.status) {
            case AttendanceStatus.PRESENT:
              status = 'present';
              break;
            case AttendanceStatus.ABSENT:
              status = 'absent';
              break;
            case AttendanceStatus.ON_LEAVE:
              status = 'on_leave';
              break;
            case AttendanceStatus.HALF_DAY:
              status = 'half_day';
              break;
            case AttendanceStatus.LATE:
              status = 'late';
              break;
          }
        }

        return {
          user,
          attendance,
          status,
        };
      });

      setTeamMembers(teamStatus);
      calculateStats(teamStatus);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load team attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (members: TeamMemberStatus[]) => {
    const stats = {
      total: members.length,
      present: members.filter((m) => m.status === 'present').length,
      absent: members.filter((m) => m.status === 'absent').length,
      onLeave: members.filter((m) => m.status === 'on_leave').length,
      halfDay: members.filter((m) => m.status === 'half_day').length,
      late: members.filter((m) => m.status === 'late').length,
      notMarked: members.filter((m) => m.status === 'not_marked').length,
    };
    setStats(stats);
  };

  const filterMembers = () => {
    let filtered = [...teamMembers];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.user.firstName.toLowerCase().includes(query) ||
          m.user.lastName.toLowerCase().includes(query) ||
          m.user.email.toLowerCase().includes(query) ||
          m.user.employeeId?.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const getStatusBadge = (status: TeamMemberStatus['status']) => {
    const config: Record<TeamMemberStatus['status'], { variant: any; label: string; className: string }> = {
      present: { variant: 'default', label: 'Present', className: 'bg-green-100 text-green-800' },
      absent: { variant: 'destructive', label: 'Absent', className: 'bg-red-100 text-red-800' },
      on_leave: { variant: 'secondary', label: 'On Leave', className: 'bg-purple-100 text-purple-800' },
      half_day: { variant: 'secondary', label: 'Half Day', className: 'bg-yellow-100 text-yellow-800' },
      late: { variant: 'secondary', label: 'Late', className: 'bg-orange-100 text-orange-800' },
      not_marked: { variant: 'outline', label: 'Not Marked', className: 'bg-gray-100 text-gray-600' },
    };

    const { variant, label, className } = config[status];
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Email', 'Status', 'Check-in', 'Check-out'].join(','),
      ...filteredMembers.map((m) =>
        [
          m.user.employeeId || '',
          `${m.user.firstName} ${m.user.lastName}`,
          m.user.email,
          m.status.toUpperCase(),        
          m.attendance?.checkIn ? format(new Date(m.attendance.checkIn), 'HH:mm') : '-',
          m.attendance?.checkOut ? format(new Date(m.attendance.checkOut), 'HH:mm') : '-',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Attendance</h1>
          <p className="text-muted-foreground">Monitor your team's attendance</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.present}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-purple-600">{stats.onLeave}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Half Day</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-yellow-600">{stats.halfDay}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">{stats.late}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Not Marked</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-gray-600">{stats.notMarked}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="not_marked">Not Marked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            Showing attendance for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <TableRow key={member.user._id}>
                        <TableCell className="font-medium">{member.user.employeeId || '-'}</TableCell>
                        <TableCell>
                          {member.user.firstName} {member.user.lastName}
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.user.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          {member.attendance?.checkIn
                            ? format(new Date(member.attendance.checkIn), 'HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {member.attendance?.checkOut
                            ? format(new Date(member.attendance.checkOut), 'HH:mm')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No team members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
