
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OrganizationNodeListProps {
  data: any;
  highlightedNode: string | null;
}

export const OrganizationNodeList: React.FC<OrganizationNodeListProps> = ({
  data,
  highlightedNode
}) => {
  const [filterValue, setFilterValue] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Flatten hierarchy to list on component mount
  React.useEffect(() => {
    const flattenedEmployees: any[] = [];
    
    const flatten = (node: any, managerName: string | null = null) => {
      flattenedEmployees.push({
        ...node,
        managerName
      });
      
      if (node.children) {
        node.children.forEach((child: any) => flatten(child, node.name));
      }
    };
    
    flatten(data);
    setEmployees(flattenedEmployees);
  }, [data]);
  
  // Filter employees based on search input
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(filterValue.toLowerCase()) || 
    emp.designation.toLowerCase().includes(filterValue.toLowerCase()) || 
    emp.department.toLowerCase().includes(filterValue.toLowerCase())
  );
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Get department badge variant
  const getDepartmentBadgeVariant = (department: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "warning"> = {
      'Executive': 'default',
      'Technology': 'secondary',
      'Human Resources': 'outline',
      'Marketing': 'warning',
      'Finance': 'default',
      'Operations': 'destructive',
    };
    
    return variants[department] || 'outline';
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Filter by name, role, or department..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Reports To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow 
              key={employee.id}
              className={highlightedNode === employee.id ? "bg-blue-50" : undefined}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className={
                    employee.department === 'Executive' ? 'bg-purple-500' :
                    employee.department === 'Technology' ? 'bg-blue-500' :
                    employee.department === 'Human Resources' ? 'bg-green-500' :
                    employee.department === 'Marketing' ? 'bg-orange-500' :
                    employee.department === 'Finance' ? 'bg-yellow-500' :
                    employee.department === 'Operations' ? 'bg-red-500' :
                    'bg-gray-500'
                  }>
                    {employee.image ? (
                      <AvatarImage src={employee.image} alt={employee.name} />
                    ) : (
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    {employee.email && (
                      <div className="text-xs text-gray-500">{employee.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.designation}</TableCell>
              <TableCell>
                <Badge variant={getDepartmentBadgeVariant(employee.department)}>
                  {employee.department}
                </Badge>
              </TableCell>
              <TableCell>{employee.managerName || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
