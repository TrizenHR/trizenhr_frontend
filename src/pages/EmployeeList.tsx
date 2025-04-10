import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus, 
  SlidersHorizontal, 
  Upload, 
  Map, 
  Search,
  User,
  UserCheck,
  UserX,
  Users,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import StatCard from '@/components/StatCard';
import StatusSummaryCard from '@/components/StatusSummaryCard';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/Breadcrumb';
import { Link, useNavigate } from 'react-router-dom';

const employeeData = [
  { id: 12024, employeeId: 'NOQ08', name: 'Gopal Test', email: 'gopalanandh11+1@gmail.com', location: 'NOQU Thousand Lights', shiftGroup: 'SPLIT SHIFT 10', mobile: '-', onboardingDate: '17-12-2024' },
  { id: 12025, employeeId: 'NOQ09', name: 'Shreya Patel', email: 'shreya.patel@example.com', location: 'NOQU Anna Nagar', shiftGroup: 'MORNING SHIFT', mobile: '9876543210', onboardingDate: '20-12-2024' },
  { id: 12026, employeeId: 'NOQ10', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', location: 'NOQU T Nagar', shiftGroup: 'EVENING SHIFT', mobile: '8765432109', onboardingDate: '22-12-2024' },
  { id: 12027, employeeId: 'NOQ11', name: 'Priya Singh', email: 'priya.singh@example.com', location: 'NOQU Velachery', shiftGroup: 'NIGHT SHIFT', mobile: '7654321098', onboardingDate: '25-12-2024' },
  { id: 12028, employeeId: 'NOQ12', name: 'Aditya Kumar', email: 'aditya.kumar@example.com', location: 'NOQU Thousand Lights', shiftGroup: 'SPLIT SHIFT 12', mobile: '6543210987', onboardingDate: '28-12-2024' },
  { id: 12029, employeeId: 'NOQ13', name: 'Kavya Reddy', email: 'kavya.reddy@example.com', location: 'NOQU Anna Nagar', shiftGroup: 'MORNING SHIFT', mobile: '5432109876', onboardingDate: '02-01-2025' },
  { id: 12030, employeeId: 'NOQ14', name: 'Vijay Nair', email: 'vijay.nair@example.com', location: 'NOQU T Nagar', shiftGroup: 'EVENING SHIFT', mobile: '4321098765', onboardingDate: '05-01-2025' },
  { id: 12031, employeeId: 'NOQ15', name: 'Ananya Das', email: 'ananya.das@example.com', location: 'NOQU Velachery', shiftGroup: 'NIGHT SHIFT', mobile: '3210987654', onboardingDate: '08-01-2025' },
  { id: 12032, employeeId: 'NOQ16', name: 'Karthik Raja', email: 'karthik.raja@example.com', location: 'NOQU Thousand Lights', shiftGroup: 'SPLIT SHIFT 10', mobile: '2109876543', onboardingDate: '10-01-2025' },
  { id: 12033, employeeId: 'NOQ17', name: 'Meena Iyer', email: 'meena.iyer@example.com', location: 'NOQU Anna Nagar', shiftGroup: 'MORNING SHIFT', mobile: '1098765432', onboardingDate: '15-01-2025' },
];

const EmployeeList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = 58; // Total employees as per spec
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const navigate = useNavigate();
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Employee Management</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" isCurrentPage>Employee List</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee List</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatusSummaryCard 
            icon={<Users size={20} />} 
            label="Total Employee" 
            count={58} 
            color="#0B2447" 
            bgColor="white"
            className="border border-gray-200 shadow-sm"
          />
          <StatusSummaryCard 
            icon={<UserCheck size={20} />} 
            label="Active Employee" 
            count={51} 
            color="#16A34A" 
            bgColor="#F2FCE2"
          />
          <StatusSummaryCard 
            icon={<UserX size={20} />} 
            label="Inactive Employee" 
            count={3} 
            color="#EA580C" 
            bgColor="#FFF1F0"
          />
          <StatusSummaryCard 
            icon={<Clock size={20} />} 
            label="Inactive-Suspended" 
            count={3} 
            color="#7E22CE" 
            bgColor="#E5DEFF"
          />
          <StatusSummaryCard 
            icon={<User size={20} />} 
            label="Inactive-Relieved" 
            count={1} 
            color="#EA580C" 
            bgColor="#FFEDD5"
          />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Id, EmployeeId, Name And Email"
              className="w-full pl-9 border-gray-300"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 text-gray-700">
              <SlidersHorizontal size={16} />
              Customize Column
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-gray-700">
              <Filter size={16} />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-gray-700">
              <Upload size={16} />
              Bulk Upload
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-gray-700">
              <Map size={16} />
              Plan Mapping
            </Button>
            <Button 
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => navigate('/admin/dashboard/create-employee')}
            >
              <Plus size={16} />
              Create
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-md shadow-sm">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-medium py-3">ID</TableHead>
                <TableHead className="font-medium py-3">Employee ID</TableHead>
                <TableHead className="font-medium py-3">Name</TableHead>
                <TableHead className="font-medium py-3">Email ID</TableHead>
                <TableHead className="font-medium py-3">Location</TableHead>
                <TableHead className="font-medium py-3">Shift Group</TableHead>
                <TableHead className="font-medium py-3">Mobile Number</TableHead>
                <TableHead className="font-medium py-3">Onboarding Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeData.map((employee) => (
                <TableRow key={employee.id} className="border-b hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">{employee.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.employeeId}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.location}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.shiftGroup}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.mobile}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.onboardingDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing 1 to 10 of {totalItems} entries
          </span>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === index + 1
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeList;
