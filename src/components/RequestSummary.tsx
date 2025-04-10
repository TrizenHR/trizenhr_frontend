
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Home, Users } from "lucide-react";
import { mockRequests } from '@/services/mockRequestData';

export const RequestSummary = () => {
  // Calculate summary statistics
  const totalRequests = mockRequests.length;
  const pendingRequests = mockRequests.filter(r => r.status.toLowerCase() === 'pending').length;
  const approvedRequests = mockRequests.filter(r => r.status.toLowerCase() === 'approved').length;
  const rejectedRequests = mockRequests.filter(r => r.status.toLowerCase() === 'rejected').length;
  
  // Count by request type
  const wfhRequests = mockRequests.filter(r => r.type.toLowerCase() === 'wfh').length;
  const odRequests = mockRequests.filter(r => r.type.toLowerCase() === 'od').length;
  const shiftRequests = mockRequests.filter(r => r.type.toLowerCase() === 'shift change').length;
  const regRequests = mockRequests.filter(r => r.type.toLowerCase() === 'attendance regularization').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            Out of {totalRequests} total requests
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
            {totalRequests > 0 
              ? `${Math.round((approvedRequests / (approvedRequests + rejectedRequests || 1)) * 100)}%` 
              : '0%'
            }
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
          <CardTitle className="text-sm font-medium">WFH Requests</CardTitle>
          <Home className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wfhRequests}</div>
          <p className="text-xs text-muted-foreground">
            {mockRequests.filter(r => r.type.toLowerCase() === 'wfh' && r.status.toLowerCase() === 'pending').length} pending approval
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Request Types</CardTitle>
          <Users className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span>WFH</span>
              <span className="font-medium">{wfhRequests}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span>OD</span>
              <span className="font-medium">{odRequests}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span>Shift Change</span>
              <span className="font-medium">{shiftRequests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Regularization</span>
              <span className="font-medium">{regRequests}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
