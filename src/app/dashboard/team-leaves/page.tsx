'use client';

import { useEffect, useState } from 'react';
import { leaveApi } from '@/lib/api';
import { Leave, LeaveStatus, LeaveType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, TrendingUp, Users, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameMonth, isAfter } from 'date-fns';
import Link from 'next/link';

export default function TeamLeavesPage() {
  const [upcomingLeaves, setUpcomingLeaves] = useState<Leave[]>([]);
  const [currentMonthLeaves, setCurrentMonthLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    onLeaveToday: 0,
    upcomingCount: 0,
    thisMonthCount: 0,
    pendingApprovals: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTeamLeaves();
  }, []);

  const loadTeamLeaves = async () => {
    try {
      setIsLoading(true);

      // Get current month's dates
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());

      // Get all approved leaves for current month (calendar view uses this)
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const monthLeaves = await leaveApi.getCalendarLeaves(month, year);
      
      // Filter only approved leaves
      const approvedMonthLeaves = monthLeaves.filter(
        (leave) => leave.status === LeaveStatus.APPROVED
      );
      setCurrentMonthLeaves(approvedMonthLeaves);

      // Get all leaves for stats
      const allLeaves = await leaveApi.getAllLeaves({});
      
      // Calculate on leave today
      const today = new Date();
      const onLeaveToday = allLeaves.records.filter((leave) => {
        if (leave.status !== LeaveStatus.APPROVED) return false;
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        return today >= start && today <= end;
      }).length;

      // Get upcoming leaves (approved and in future)
      const upcoming = allLeaves.records.filter((leave) => {
        if (leave.status !== LeaveStatus.APPROVED) return false;
        return isAfter(new Date(leave.startDate), today);
      });
      setUpcomingLeaves(upcoming);

      // Get pending approvals count
      const pending = allLeaves.records.filter(
        (leave) => leave.status === LeaveStatus.PENDING
      ).length;

      setStats({
        onLeaveToday,
        upcomingCount: upcoming.length,
        thisMonthCount: approvedMonthLeaves.length,
        pendingApprovals: pending,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load team leaves',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    const colors: Record<LeaveType, string> = {
      [LeaveType.SICK]: 'bg-red-100 text-red-800 border-red-200',
      [LeaveType.CASUAL]: 'bg-blue-100 text-blue-800 border-blue-200',
      [LeaveType.VACATION]: 'bg-purple-100 text-purple-800 border-purple-200',
      [LeaveType.UNPAID]: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type];
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels: Record<LeaveType, string> = {
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.CASUAL]: 'Casual Leave',
      [LeaveType.VACATION]: 'Vacation Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Leaves</h1>
          <p className="text-muted-foreground">Overview of team leave schedules</p>
        </div>
        <Link href="/dashboard/leave-approvals">
          <Button>
            View Pending Approvals
            {stats.pendingApprovals > 0 && (
              <Badge className="ml-2" variant="destructive">
                {stats.pendingApprovals}
              </Badge>
            )}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{stats.onLeaveToday}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Team members away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.upcomingCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved future leaves</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.thisMonthCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leaves in {format(new Date(), 'MMMM')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming Leaves ({upcomingLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="month">
            This Month ({currentMonthLeaves.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leaves</CardTitle>
              <CardDescription>Approved leaves scheduled for future dates</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : upcomingLeaves.length > 0 ? (
                <div className="space-y-3">
                  {upcomingLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {typeof leave.userId === 'object' && 'firstName' in leave.userId
                              ? `${leave.userId.firstName} ${leave.userId.lastName}`
                              : 'Unknown Employee'}
                          </span>
                          {typeof leave.userId === 'object' && 'employeeId' in leave.userId && (
                            <span className="text-sm text-muted-foreground">
                              {leave.userId.employeeId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getLeaveTypeColor(leave.leaveType)} variant="outline">
                          {getLeaveTypeLabel(leave.leaveType)}
                        </Badge>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {format(new Date(leave.startDate), 'MMM dd')} -{' '}
                              {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {leave.totalDays} {leave.totalDays === 1? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No upcoming leaves scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardHeader>
              <CardTitle>Leaves This Month</CardTitle>
              <CardDescription>
                All approved leaves for {format(new Date(), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : currentMonthLeaves.length > 0 ? (
                <div className="space-y-3">
                  {currentMonthLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {typeof leave.userId === 'object' && 'firstName' in leave.userId
                              ? `${leave.userId.firstName} ${leave.userId.lastName}`
                              : 'Unknown Employee'}
                          </span>
                          {typeof leave.userId === 'object' && 'employeeId' in leave.userId && (
                            <span className="text-sm text-muted-foreground">
                              {leave.userId.employeeId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getLeaveTypeColor(leave.leaveType)} variant="outline">
                          {getLeaveTypeLabel(leave.leaveType)}
                        </Badge>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {format(new Date(leave.startDate), 'MMM dd')} -{' '}
                              {format(new Date(leave.endDate), 'MMM dd')}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No leaves scheduled for this month
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Link to Calendar */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">View Full Team Calendar</h3>
              <p className="text-sm text-muted-foreground">
                See all team leaves and attendance on the calendar view
              </p>
            </div>
            <Link href="/dashboard/leave-calendar">
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Open Calendar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
