
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Plus, Clock, Calendar } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const attendanceData = [
  { day: '03 Apr', loggedHours: 7.5, lateBy: 0.8, weeklyOff: 0, absent: 0 },
  { day: '04 Apr', loggedHours: 8, lateBy: 0.5, weeklyOff: 0, absent: 0 },
  { day: '05 Apr', loggedHours: 0, lateBy: 0, weeklyOff: 8, absent: 0 },
  { day: '06 Apr', loggedHours: 0, lateBy: 0, weeklyOff: 8, absent: 0 },
  { day: '07 Apr', loggedHours: 7.2, lateBy: 1.0, weeklyOff: 0, absent: 0 },
  { day: '08 Apr', loggedHours: 7.8, lateBy: 0.7, weeklyOff: 0, absent: 0 },
  { day: '09 Apr', loggedHours: 7.5, lateBy: 0.5, weeklyOff: 0, absent: 0 },
];

const holidays = [
  { date: '01 May', day: 'Thu', name: 'Labour Day/Maharashtra Din', type: 'Holiday' },
  { date: '02 Jun', day: 'Mon', name: 'Telangana Formation Day', type: 'Holiday' },
  { date: '15 Aug', day: 'Fri', name: 'Independence Day', type: 'National Holiday' },
  { date: '27 Aug', day: 'Wed', name: 'Ganesh Chaturthi', type: 'Holiday' },
  { date: '02 Oct', day: 'Thu', name: 'Mahatma Gandhi Jayanti/Dussehra', type: 'National Holiday' },
];

const chartConfig = {
  loggedHours: {
    label: "Logged Hours",
    color: "#3B82F6", // blue
  },
  lateBy: {
    label: "Late By",
    color: "#F97316", // orange
  },
  weeklyOff: {
    label: "Weekly Off / Holiday / Leave",
    color: "#D1D5DB", // light gray
  },
  absent: {
    label: "Absent",
    color: "#EF4444", // red
  },
};

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("Week");

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">NOQU-TAM - User Dashboard</div>
        <Button 
          variant="outline"
          onClick={logout}
        >
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Title and Request Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="mr-1" size={16} />
            Request
          </Button>
        </div>

        {/* Pending Requests */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Pending Requests</h2>
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <img 
              src="/lovable-uploads/a607618b-4d3d-4024-b728-4d2d5ee2f3c0.png" 
              alt="No pending requests" 
              className="w-40 h-40 object-contain mb-4"
            />
            <p className="text-gray-600">There are no pending requests</p>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Attendance Metrics */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Attendance Metrics</h2>
              <Button 
                variant="ghost" 
                className="text-gray-600 flex items-center"
                onClick={() => {}}
              >
                {selectedTimeframe} <ChevronDown size={16} className="ml-1" />
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-semibold text-gray-800">06:37</div>
                <div className="text-sm text-gray-500">Avg. Work Duration</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">00:50</div>
                <div className="text-sm text-gray-500">Avg. Late By</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-72">
              <ChartContainer config={chartConfig}>
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={10} />
                  <YAxis 
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} 
                    fontSize={10}
                    tickCount={5}
                  />
                  <Bar 
                    dataKey="weeklyOff" 
                    stackId="a" 
                    fill={chartConfig.weeklyOff.color} 
                    name={chartConfig.weeklyOff.label}
                  />
                  <Bar 
                    dataKey="loggedHours" 
                    stackId="a" 
                    fill={chartConfig.loggedHours.color} 
                    name={chartConfig.loggedHours.label}
                  />
                  <Bar 
                    dataKey="lateBy" 
                    stackId="a" 
                    fill={chartConfig.lateBy.color} 
                    name={chartConfig.lateBy.label}
                  />
                  <Bar 
                    dataKey="absent" 
                    stackId="a" 
                    fill={chartConfig.absent.color} 
                    name={chartConfig.absent.label}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => (
                      <ChartTooltipContent active={active} payload={payload} />
                    )}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Middle Column - Leave Balances */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Leave Balances</h2>
              <Button variant="link" className="text-blue-500">
                View All
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="mb-6">
                  <div className="text-4xl font-semibold text-gray-800">3</div>
                  <div className="text-sm text-gray-600">Annual Leaves</div>
                </div>
                <div className="flex items-center text-red-500">
                  <div className="mr-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="#EF4444"/>
                    </svg>
                  </div>
                  <span className="text-sm">Loss of Pay</span>
                </div>
              </CardContent>
            </Card>

            {/* Decorative mountain chart */}
            <div className="h-48 mt-auto">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path d="M0,150 L20,140 L40,145 L60,135 L80,140 L100,120 L120,130 L140,110 L160,120 L180,100 L200,110 L220,95 L240,105 L260,85 L280,95 L300,75 L320,85 L340,70 L360,80 L380,60 L400,70 L400,200 L0,200 Z" fill="#3B82F6" opacity="0.8" />
                <path d="M0,160 L20,155 L40,165 L60,150 L80,160 L100,140 L120,150 L140,135 L160,145 L180,125 L200,135 L220,115 L240,125 L260,105 L280,115 L300,95 L320,105 L340,90 L360,100 L380,80 L400,90 L400,200 L0,200 Z" fill="#1E40AF" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Right Column - Current Day Info + Upcoming Holidays */}
          <div className="space-y-6">
            {/* Current Day Info */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Let's Get the Ball Rolling</h3>
                  <p className="text-sm text-gray-600">10 Apr, Thursday</p>
                </div>
                <div className="text-3xl font-bold text-center my-4">
                  {formatTime(currentTime)}
                </div>
                <div className="bg-green-100 h-1 w-full rounded-full mb-4"></div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="text-gray-600">
                    <Clock size={14} className="inline mr-1" />
                    10:21:04
                  </div>
                  <div className="text-gray-600">
                    17:07:45
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">
                    Shift: 10:00 - 19:00
                  </div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto">
                    View Policies
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Upcoming Time Off</h3>
                <Button variant="link" className="text-blue-500">
                  View All
                </Button>
              </div>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {holidays.map((holiday, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700">{holiday.date.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">{holiday.day}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{holiday.name}</div>
                        <div className="text-xs text-gray-500">{holiday.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
