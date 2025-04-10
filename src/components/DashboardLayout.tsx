
import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
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
            <ChevronDown className="h-4 w-4 text-gray-500" />
            <Avatar className="h-8 w-8 bg-orange-500">
              <AvatarFallback>N</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-[#1E2A38] text-white">
          <div className="p-5 font-semibold uppercase">NOQU DEMO</div>
          <nav className="mt-4">
            <ul className="space-y-1">
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Dashboard</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Attendance</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Request and Approvals</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Leave Approvals</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Employee Management</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Report Scheduler</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Attendance Reports</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Additional Reports</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Organization Chart</li>
              <li className="px-5 py-2.5 bg-[#283747] uppercase font-medium">Regularization</li>
              <li className="px-5 py-2.5 hover:bg-[#2c3e50] uppercase font-medium">Settings</li>
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
