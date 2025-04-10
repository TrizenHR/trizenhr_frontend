
import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Request and Approvals', path: '/approvals' },
    { name: 'Leave Approvals', path: '/leave-approvals' },
    { name: 'Employee Management', path: '/employee-list' },
    { name: 'Report Scheduler', path: '/report-scheduler' },
    { name: 'Attendance Reports', path: '/attendance-reports' },
    { name: 'Additional Reports', path: '/additional-reports' },
    { name: 'Organization Chart', path: '/organization-chart' },
    { name: 'Regularization', path: '/' },
    { name: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/employee-list' && location.pathname === '/create-employee') {
      return true;
    }
    return location.pathname === path;
  };

  const handleNavClick = (path: string, name: string) => {
    // Handle the special case for Regularization which should go to the root (Index.tsx)
    if (name === 'Regularization') {
      navigate('/');
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
