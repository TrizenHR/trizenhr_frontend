
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AttendanceSummaryProps {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  totalEmployees,
  presentCount,
  absentCount,
  leaveCount,
}) => {
  const chartData = [
    {
      name: "Mon",
      present: 45,
      absent: 12,
      leave: 8,
    },
    {
      name: "Tue",
      present: 52,
      absent: 8,
      leave: 5,
    },
    {
      name: "Wed",
      present: 48,
      absent: 10,
      leave: 7,
    },
    {
      name: "Thu",
      present: 50,
      absent: 9,
      leave: 6,
    },
    {
      name: "Fri",
      present: 40,
      absent: 15,
      leave: 10,
    },
  ];

  const chartConfig = {
    present: {
      label: "Present",
      color: "#2ecc71",
    },
    absent: {
      label: "Absent",
      color: "#e74c3c",
    },
    leave: {
      label: "Leave",
      color: "#f1c40f",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base">Attendance Overview</h3>
              <span className="text-sm text-gray-500">This Week</span>
            </div>
            
            <div className="h-[180px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Bar 
                      dataKey="present"
                      fill={chartConfig.present.color}
                      radius={[4, 4, 0, 0]}
                      stackId="stack"
                    />
                    <Bar 
                      dataKey="absent"
                      fill={chartConfig.absent.color}
                      radius={[4, 4, 0, 0]}
                      stackId="stack"
                    />
                    <Bar 
                      dataKey="leave"
                      fill={chartConfig.leave.color}
                      radius={[4, 4, 0, 0]}
                      stackId="stack"
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => (
                        <ChartTooltipContent 
                          active={active}
                          payload={payload}
                        />
                      )} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-base">Today's Summary</h3>
              <p className="text-sm text-gray-500">Total: {totalEmployees} employees</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-md bg-green-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-present" />
                  <span className="font-medium">Present</span>
                </div>
                <span className="font-semibold">{presentCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-md bg-red-50">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-status-absent" />
                  <span className="font-medium">Absent</span>
                </div>
                <span className="font-semibold">{absentCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-md bg-yellow-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-status-leave" />
                  <span className="font-medium">On Leave</span>
                </div>
                <span className="font-semibold">{leaveCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceSummary;
