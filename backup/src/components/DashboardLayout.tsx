
import React from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Attendance', path: '/admin/dashboard/attendance' },
    { name: 'Attendance Reports', path: '/admin/dashboard/attendance-reports' },
    { name: 'Request and Approvals', path: '/admin/dashboard/approvals' },
    { name: 'Leave Approvals', path: '/admin/dashboard/leave-approvals' },
    { name: 'Employee Management', path: '/admin/dashboard/employee-list' },
    { name: 'Report Scheduler', path: '/admin/dashboard/report-scheduler' },
    { name: 'Additional Reports', path: '/admin/dashboard/additional-reports' },
    { name: 'Organization Chart', path: '/admin/dashboard/organization-chart' },
    { name: 'Regularization', path: '/admin/dashboard' },
    { name: 'Settings', path: '/admin/dashboard/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard/employee-list' && 
        (location.pathname === '/admin/dashboard/create-employee' || 
         location.pathname === '/admin/dashboard/employee-list')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleNavClick = (path: string, name: string) => {
    // Handle the special case for Regularization which should go to the root admin dashboard
    if (name === 'Regularization') {
      navigate('/admin/dashboard');
      return;
    }
    
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">NOQU-TAM</div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-500" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1">
                <span className="text-sm">Hello, NOQU DEMO</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
                <Avatar className="h-8 w-8 bg-orange-500">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0B2447] text-white">
          <div className="p-5 font-semibold uppercase">NOQU DEMO</div>
          <nav className="mt-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button 
                    onClick={() => handleNavClick(item.path, item.name)}
                    className={`px-5 py-2.5 block hover:bg-[#1E3A8A] uppercase font-medium w-full text-left ${
                      isActive(item.path) 
                        ? 'text-yellow-400 bg-[#1E3A8A]' 
                        : 'text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
