import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AttendanceRecord {
  id: string;
  name: string;
  department: string;
  checkIn: string;
  checkOut: string | null;
  status: 'present' | 'late' | 'absent' | 'on-leave';
}

interface RecentAttendanceProps {
  records: AttendanceRecord[];
}

const statusConfig = {
  present: { label: 'Present', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  late: { label: 'Late', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  absent: { label: 'Absent', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  'on-leave': { label: 'On Leave', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
};

export function RecentAttendance({ records }: RecentAttendanceProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                  {record.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{record.name}</p>
                  <p className="text-sm text-gray-500">{record.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="text-gray-900">{record.checkIn}</p>
                  <p className="text-gray-500">{record.checkOut || '—'}</p>
                </div>
                <Badge variant="secondary" className={statusConfig[record.status].className}>
                  {statusConfig[record.status].label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
