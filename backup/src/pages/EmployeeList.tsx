
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
  Clock,
  Eye,
  Pencil,
  Trash2,
  Download
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
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Enhanced employee data with more fields
const employeeData = [
  { 
    id: 12024, 
    employeeId: 'NOQ08', 
    name: 'Gopal Test', 
    email: 'gopalanandh11+1@gmail.com', 
    location: 'NOQU Thousand Lights', 
    shiftGroup: 'SPLIT SHIFT 10', 
    mobile: '9876543210', 
    onboardingDate: '17-12-2024',
    department: 'IT',
    designation: 'Software Developer',
    status: 'Active',
    manager: 'Aditya Kumar',
    roleType: 'Employee',
    employmentType: 'Full-Time'
  },
  { 
    id: 12025, 
    employeeId: 'NOQ09', 
    name: 'Shreya Patel', 
    email: 'shreya.patel@example.com', 
    location: 'NOQU Anna Nagar', 
    shiftGroup: 'MORNING SHIFT', 
    mobile: '9876543210', 
    onboardingDate: '20-12-2024',
    department: 'HR',
    designation: 'HR Manager',
    status: 'Active',
    manager: 'Meena Iyer',
    roleType: 'Manager',
    employmentType: 'Full-Time'
  },
  { 
    id: 12026, 
    employeeId: 'NOQ10', 
    name: 'Rahul Sharma', 
    email: 'rahul.sharma@example.com', 
    location: 'NOQU T Nagar', 
    shiftGroup: 'EVENING SHIFT', 
    mobile: '8765432109', 
    onboardingDate: '22-12-2024',
    department: 'Finance',
    designation: 'Accountant',
    status: 'On Leave',
    manager: 'Meena Iyer',
    roleType: 'Employee',
    employmentType: 'Full-Time'
  },
  { 
    id: 12027, 
    employeeId: 'NOQ11', 
    name: 'Priya Singh', 
    email: 'priya.singh@example.com', 
    location: 'NOQU Velachery', 
    shiftGroup: 'NIGHT SHIFT', 
    mobile: '7654321098', 
    onboardingDate: '25-12-2024',
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'On Notice',
    manager: 'Vijay Nair',
    roleType: 'Employee',
    employmentType: 'Full-Time'
  },
  { 
    id: 12028, 
    employeeId: 'NOQ12', 
    name: 'Aditya Kumar', 
    email: 'aditya.kumar@example.com', 
    location: 'NOQU Thousand Lights', 
    shiftGroup: 'SPLIT SHIFT 12', 
    mobile: '6543210987', 
    onboardingDate: '28-12-2024',
    department: 'IT',
    designation: 'IT Manager',
    status: 'Active',
    manager: 'Meena Iyer',
    roleType: 'Manager',
    employmentType: 'Full-Time'
  },
  { 
    id: 12029, 
    employeeId: 'NOQ13', 
    name: 'Kavya Reddy', 
    email: 'kavya.reddy@example.com', 
    location: 'NOQU Anna Nagar', 
    shiftGroup: 'MORNING SHIFT', 
    mobile: '5432109876', 
    onboardingDate: '02-01-2025',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    status: 'Active',
    manager: 'Vijay Nair',
    roleType: 'Employee',
    employmentType: 'Contract'
  },
  { 
    id: 12030, 
    employeeId: 'NOQ14', 
    name: 'Vijay Nair', 
    email: 'vijay.nair@example.com', 
    location: 'NOQU T Nagar', 
    shiftGroup: 'EVENING SHIFT', 
    mobile: '4321098765', 
    onboardingDate: '05-01-2025',
    department: 'Marketing',
    designation: 'Marketing Director',
    status: 'Active',
    manager: 'Meena Iyer',
    roleType: 'Manager',
    employmentType: 'Full-Time'
  },
  { 
    id: 12031, 
    employeeId: 'NOQ15', 
    name: 'Ananya Das', 
    email: 'ananya.das@example.com', 
    location: 'NOQU Velachery', 
    shiftGroup: 'NIGHT SHIFT', 
    mobile: '3210987654', 
    onboardingDate: '08-01-2025',
    department: 'Operations',
    designation: 'Operations Analyst',
    status: 'Inactive',
    manager: 'Aditya Kumar',
    roleType: 'Employee',
    employmentType: 'Part-Time'
  },
  { 
    id: 12032, 
    employeeId: 'NOQ16', 
    name: 'Karthik Raja', 
    email: 'karthik.raja@example.com', 
    location: 'NOQU Thousand Lights', 
    shiftGroup: 'SPLIT SHIFT 10', 
    mobile: '2109876543', 
    onboardingDate: '10-01-2025',
    department: 'IT',
    designation: 'Software Developer',
    status: 'Active',
    manager: 'Aditya Kumar',
    roleType: 'Employee',
    employmentType: 'Full-Time'
  },
  { 
    id: 12033, 
    employeeId: 'NOQ17', 
    name: 'Meena Iyer', 
    email: 'meena.iyer@example.com', 
    location: 'NOQU Anna Nagar', 
    shiftGroup: 'MORNING SHIFT', 
    mobile: '1098765432', 
    onboardingDate: '15-01-2025',
    department: 'Management',
    designation: 'CEO',
    status: 'Active',
    manager: '',
    roleType: 'Admin',
    employmentType: 'Full-Time'
  },
];

const EmployeeList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const itemsPerPage = 10;
  const totalItems = 58; // Total employees as per spec
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get unique departments, designations, and statuses for filters
  const departments = Array.from(new Set(employeeData.map(emp => emp.department)));
  const designations = Array.from(new Set(employeeData.map(emp => emp.designation)));
  const statuses = Array.from(new Set(employeeData.map(emp => emp.status)));
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter employees based on search and filters
  const filteredEmployees = employeeData.filter(employee => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !employee.name.toLowerCase().includes(query) &&
        !employee.employeeId.toLowerCase().includes(query) &&
        !employee.email.toLowerCase().includes(query) &&
        !employee.mobile.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    // Department filter
    if (departmentFilter !== 'all' && employee.department !== departmentFilter) {
      return false;
    }
    
    // Designation filter
    if (designationFilter !== 'all' && employee.designation !== designationFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && employee.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setDesignationFilter('all');
    setStatusFilter('all');
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    navigate(`/admin/dashboard/edit-employee/${employee.id}`);
  };

  const handleDeleteEmployee = (employee: any) => {
    // In a real application, this would call an API
    toast({
      title: "Employee Deleted",
      description: `${employee.name} has been deleted successfully.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
      case 'On Leave':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">On Leave</Badge>;
      case 'On Notice':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Notice</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
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
            label="On Notice" 
            count={3} 
            color="#7E22CE" 
            bgColor="#E5DEFF"
          />
          <StatusSummaryCard 
            icon={<User size={20} />} 
            label="New Joinee (This Month)" 
            count={5} 
            color="#0369A1" 
            bgColor="#E0F7FF"
          />
        </div>
        
        {/* Filters and Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by name, ID, email, phone"
                className="w-full pl-9 border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
          
          {/* Additional filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={designationFilter} onValueChange={setDesignationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {designations.map(desg => (
                  <SelectItem key={desg} value={desg}>{desg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-md shadow-sm">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-medium py-3">Employee ID</TableHead>
                <TableHead className="font-medium py-3">Name</TableHead>
                <TableHead className="font-medium py-3">Department</TableHead>
                <TableHead className="font-medium py-3">Designation</TableHead>
                <TableHead className="font-medium py-3">Email</TableHead>
                <TableHead className="font-medium py-3">Location</TableHead>
                <TableHead className="font-medium py-3">Status</TableHead>
                <TableHead className="font-medium py-3">Joining Date</TableHead>
                <TableHead className="font-medium py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="border-b hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">{employee.employeeId}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.department}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.designation}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.location}</TableCell>
                  <TableCell className="whitespace-nowrap">{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.onboardingDate}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditEmployee(employee)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing 1 to {Math.min(itemsPerPage, filteredEmployees.length)} of {totalItems} entries
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

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Employee Profile</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Profile Overview */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <User size={30} />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{selectedEmployee.name}</h2>
                    <p className="text-gray-500">{selectedEmployee.employeeId} | {selectedEmployee.roleType}</p>
                    <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleEditEmployee(selectedEmployee)}>
                  <Pencil size={14} className="mr-2" />
                  Edit Info
                </Button>
              </div>
              
              {/* Employment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Employment Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="font-medium">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reporting Manager</p>
                    <p className="font-medium">{selectedEmployee.manager || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium">{selectedEmployee.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedEmployee.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="font-medium">{selectedEmployee.onboardingDate}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{selectedEmployee.mobile}</p>
                  </div>
                </div>
              </div>
              
              {/* Documents */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded-md bg-white">
                    <span>Offer Letter</span>
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md bg-white">
                    <span>ID Proof</span>
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md bg-white">
                    <span>Resume</span>
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default EmployeeList;
