'use client';

import { useEffect, useState } from 'react';
import { attendanceApi, userApi } from '@/lib/api';
import { Attendance, AttendanceStatus, User, UserRole } from '@/lib/types';
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
import { useAuth } from '@/hooks/use-auth';
import { Users, TrendingUp, Download, UserX } from 'lucide-react';
import { format, isBefore, parseISO } from 'date-fns';
import { hasAnyRole } from '@/lib/permissions';
import { formatTimeOnly } from '@/lib/date-utils';
import {
  CheckInPhotoButton,
  CheckInPhotoDialog,
  type CheckInPhotoTarget,
} from './CheckInPhotoDialog';
import { AttendancePunchCell, punchExportLabel } from './AttendancePunchCell';

type TeamMemberStatus = {
  user: User;
  attendance?: Attendance;
  status: 'present' | 'absent' | 'on_leave' | 'half_day' | 'late' | 'not_marked';
};

export type TeamAttendanceBoardProps = {
  title?: string;
  subtitle?: string;
  membersTableTitle?: string;
  exportFilePrefix?: string;
  showHeader?: boolean;
  /** Show area name under check-in / check-out times (Company Attendance admin view). */
  showLocationColumns?: boolean;
};

export function TeamAttendanceBoard({
  title = 'Team Attendance',
  subtitle = "Monitor your team's attendance",
  membersTableTitle = 'Team Members',
  exportFilePrefix = 'team-attendance',
  showHeader = true,
  showLocationColumns = false,
}: TeamAttendanceBoardProps) {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMemberStatus[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMemberStatus[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [photoTarget, setPhotoTarget] = useState<CheckInPhotoTarget | null>(null);
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
  const canMarkAutoAbsent = hasAnyRole((user?.role ?? '') as UserRole, [
    UserRole.HR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ]);
  const selectedDateIsPast = isBefore(parseISO(`${selectedDate}T12:00:00`), new Date());

  const handleMarkAutoAbsent = async () => {
    try {
      const result = await attendanceApi.markAutoAbsent(selectedDate);
      toast({
        title: 'Auto absent complete',
        description: `Marked ${result.marked} absent (${result.skipped} skipped)`,
      });
      await loadTeamAttendance();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to mark absent',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadTeamAttendance();
  }, [selectedDate, user?._id, user?.role]);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, statusFilter, searchQuery]);

  const loadTeamAttendance = async () => {
    try {
      setIsLoading(true);

      const currentUserId = user?._id || user?.id;
      if (!currentUserId) {
        throw new Error('Missing user id');
      }

      const isSupervisor = user?.role === UserRole.SUPERVISOR;
      const users = await userApi.getAllUsers({ isActive: true });

      const attendanceByUserId = new Map<string, Attendance | undefined>();
      if (isSupervisor) {
        await Promise.all(
          users.map(async (u) => {
            const userKey = String(u._id || u.id);
            try {
              const res = await attendanceApi.getUserAttendance(userKey, {
                startDate: selectedDate,
                endDate: selectedDate,
                page: 1,
                limit: 1,
              });
              attendanceByUserId.set(userKey, res.records?.[0]);
            } catch {
              attendanceByUserId.set(userKey, undefined);
            }
          })
        );
      } else {
        const allAttendance = await attendanceApi.getAllAttendance({
          startDate: selectedDate,
          endDate: selectedDate,
          page: 1,
          limit: 1000,
        });
        for (const record of allAttendance.records) {
          const recordUserId =
            typeof record.userId === 'object' && record.userId
              ? String((record.userId as { _id?: string; id?: string })._id || (record.userId as { id?: string }).id)
              : String(record.userId);
          if (recordUserId) {
            attendanceByUserId.set(recordUserId, record);
          }
        }
      }

      const teamStatus: TeamMemberStatus[] = users.map((member) => {
        const memberKey = String(member._id || member.id);
        const attendance = attendanceByUserId.get(memberKey);

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
          user: member,
          attendance,
          status,
        };
      });

      setTeamMembers(teamStatus);
      calculateStats(teamStatus);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (members: TeamMemberStatus[]) => {
    setStats({
      total: members.length,
      present: members.filter((m) => m.status === 'present').length,
      absent: members.filter((m) => m.status === 'absent').length,
      onLeave: members.filter((m) => m.status === 'on_leave').length,
      halfDay: members.filter((m) => m.status === 'half_day').length,
      late: members.filter((m) => m.status === 'late').length,
      notMarked: members.filter((m) => m.status === 'not_marked').length,
    });
  };

  const filterMembers = () => {
    let filtered = [...teamMembers];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

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
    const config: Record<
      TeamMemberStatus['status'],
      { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string; className: string }
    > = {
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
    const headers = ['Employee ID', 'Name', 'Email', 'Status', 'Check-in', 'Check-out'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map((m) =>
        [
          m.user.employeeId || '',
          `${m.user.firstName} ${m.user.lastName}`,
          m.user.email,
          m.status.toUpperCase(),
          showLocationColumns
            ? punchExportLabel(
                m.attendance?.checkIn,
                m.attendance?.checkInLocationLabel,
                m.attendance?.checkInLat,
                m.attendance?.checkInLng,
                true
              )
            : m.attendance?.checkIn
              ? formatTimeOnly(m.attendance.checkIn)
              : '-',
          showLocationColumns
            ? punchExportLabel(
                m.attendance?.checkOut,
                m.attendance?.checkOutLocationLabel,
                m.attendance?.checkOutLat,
                m.attendance?.checkOutLng,
                true
              )
            : m.attendance?.checkOut
              ? formatTimeOnly(m.attendance.checkOut)
              : '-',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilePrefix}-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <CheckInPhotoDialog target={photoTarget} onClose={() => setPhotoTarget(null)} />

      {showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canMarkAutoAbsent && selectedDateIsPast && (
              <Button onClick={handleMarkAutoAbsent} variant="secondary">
                <UserX className="mr-2 h-4 w-4" />
                Mark auto absent
              </Button>
            )}
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="cursor-pointer">
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
                className="cursor-text"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
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

      <Card>
        <CardHeader>
          <CardTitle>
            {membersTableTitle} ({filteredMembers.length})
          </CardTitle>
          <CardDescription>
            Showing attendance for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
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
                    <TableHead>Photo</TableHead>
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
                          <AttendancePunchCell
                            time={member.attendance?.checkIn}
                            latitude={member.attendance?.checkInLat}
                            longitude={member.attendance?.checkInLng}
                            locationLabel={member.attendance?.checkInLocationLabel}
                            showLocation={showLocationColumns}
                          />
                        </TableCell>
                        <TableCell>
                          <AttendancePunchCell
                            time={member.attendance?.checkOut}
                            latitude={member.attendance?.checkOutLat}
                            longitude={member.attendance?.checkOutLng}
                            locationLabel={member.attendance?.checkOutLocationLabel}
                            showLocation={showLocationColumns}
                          />
                        </TableCell>
                        <TableCell>
                          {member.attendance?.checkIn &&
                          (member.attendance.hasCheckInPhoto || member.attendance.photoUrl) ? (
                            <CheckInPhotoButton
                              attendanceId={member.attendance._id}
                              employeeName={`${member.user.firstName} ${member.user.lastName}`}
                              date={member.attendance.date}
                              checkIn={member.attendance.checkIn}
                              onView={setPhotoTarget}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No employees found
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
