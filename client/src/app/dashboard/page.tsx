import { StatCard } from '@/components/dashboard/StatCard';
import { RecentAttendance } from '@/components/dashboard/RecentAttendance';
import { Users, Clock, UserCheck, UserX } from 'lucide-react';

// Mock data for dashboard display
const mockStats = {
  totalEmployees: 156,
  presentToday: 142,
  onLeave: 8,
  lateArrivals: 6,
};

const mockRecentAttendance = [
  {
    id: '1',
    name: 'Rahul Sharma',
    department: 'Engineering',
    checkIn: '09:02 AM',
    checkOut: null,
    status: 'present' as const,
  },
  {
    id: '2',
    name: 'Priya Patel',
    department: 'Design',
    checkIn: '09:15 AM',
    checkOut: null,
    status: 'late' as const,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    department: 'Sales',
    checkIn: '08:55 AM',
    checkOut: null,
    status: 'present' as const,
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    department: 'HR',
    checkIn: '—',
    checkOut: null,
    status: 'on-leave' as const,
  },
  {
    id: '5',
    name: 'Vikram Singh',
    department: 'Marketing',
    checkIn: '09:00 AM',
    checkOut: null,
    status: 'present' as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500">
          Today&apos;s attendance summary and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={mockStats.totalEmployees}
          icon={<Users className="h-5 w-5" />}
          description="Active workforce"
        />
        <StatCard
          title="Present Today"
          value={mockStats.presentToday}
          icon={<UserCheck className="h-5 w-5" />}
          trend={{ value: 2.5, isPositive: true }}
          description="vs. last week"
        />
        <StatCard
          title="On Leave"
          value={mockStats.onLeave}
          icon={<UserX className="h-5 w-5" />}
          description="Scheduled leaves"
        />
        <StatCard
          title="Late Arrivals"
          value={mockStats.lateArrivals}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 1.2, isPositive: false }}
          description="vs. last week"
        />
      </div>

      {/* Recent Attendance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAttendance records={mockRecentAttendance} />

        {/* Quick Actions Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-base font-medium text-gray-900">Quick Actions</h3>
          <p className="mt-1 text-sm text-gray-500">Common tasks and shortcuts</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickActionButton label="Mark Attendance" />
            <QuickActionButton label="View Reports" />
            <QuickActionButton label="Add Employee" />
            <QuickActionButton label="Export Data" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ label }: { label: string }) {
  return (
    <button className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
      {label}
    </button>
  );
}
