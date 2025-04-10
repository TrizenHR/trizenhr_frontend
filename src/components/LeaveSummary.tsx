
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { mockLeaveRequests } from '@/services/mockLeaveData';

export const LeaveSummary = () => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  // Calculate summary statistics
  const totalRequests = mockLeaveRequests.length;
  const pendingRequests = mockLeaveRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = mockLeaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = mockLeaveRequests.filter(r => r.status === 'Rejected').length;
  
  // Find most common leave type
  const leaveTypeCounts: Record<string, number> = {};
  mockLeaveRequests.forEach(leave => {
    leaveTypeCounts[leave.leaveType] = (leaveTypeCounts[leave.leaveType] || 0) + 1;
  });
  
  const mostCommonLeaveType = Object.entries(leaveTypeCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests}</div>
          <p className="text-xs text-muted-foreground">
            For {currentMonth}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            Requiring your attention
          </p>
          <div className="mt-4 h-1 w-full bg-gray-100 rounded">
            <div 
              className="h-1 bg-yellow-400 rounded" 
              style={{ width: `${(pendingRequests / totalRequests) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((approvedRequests / (approvedRequests + rejectedRequests || 1)) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {approvedRequests} approved, {rejectedRequests} rejected
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-1 w-full bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-1 bg-green-400 rounded" 
                style={{ width: `${(approvedRequests / totalRequests) * 100}%` }}
              ></div>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-1 bg-red-400 rounded" 
                style={{ width: `${(rejectedRequests / totalRequests) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Popular Leave Type</CardTitle>
          <XCircle className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostCommonLeaveType}</div>
          <p className="text-xs text-muted-foreground">
            {leaveTypeCounts[mostCommonLeaveType]} requests
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
