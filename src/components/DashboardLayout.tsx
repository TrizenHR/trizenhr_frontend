
import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">NOQU-TAM</div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-500" />
          <div className="flex items-center gap-2">
            <span className="text-sm">Hello, NOQU DEMO</span>
            <Avatar className="h-8 w-8 bg-orange-500">
              <AvatarFallback>N</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-48 bg-slate-800 text-white">
          <div className="p-4 font-bold">NOQU DEMO</div>
          <nav className="mt-4">
            <ul>
              <li className="px-4 py-2 hover:bg-slate-700">Dashboard</li>
              <li className="px-4 py-2 hover:bg-slate-700">Attendance</li>
              <li className="px-4 py-2 hover:bg-slate-700">Request and Approvals</li>
              <li className="px-4 py-2 hover:bg-slate-700">Leave Approvals</li>
              <li className="px-4 py-2 hover:bg-slate-700">Employee Management</li>
              <li className="px-4 py-2 hover:bg-slate-700">Report Scheduler</li>
              <li className="px-4 py-2 hover:bg-slate-700">Attendance Reports</li>
              <li className="px-4 py-2 hover:bg-slate-700">Additional Reports</li>
              <li className="px-4 py-2 hover:bg-slate-700">Organization Chart</li>
              <li className="px-4 py-2 bg-slate-900">Regularization</li>
              <li className="px-4 py-2 hover:bg-slate-700">Settings</li>
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
