
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Download, ZoomIn, ZoomOut, RefreshCw, MinusCircle, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OrganizationNode } from '@/components/organization/OrganizationNode';
import { OrganizationNodeList } from '@/components/organization/OrganizationNodeList';
import { OrganizationTree } from '@/components/organization/OrganizationTree';
import { mockOrganizationData } from '@/services/mockOrganizationData';

const OrganizationChart: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'department' | 'list'>('tree');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [organizationData, setOrganizationData] = useState(mockOrganizationData);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1'])); // CEO node expanded by default
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setHighlightedNode(null);
      return;
    }
    
    // Simple search function that recursively looks through the org data
    const searchNodes = (node: any, query: string): string | null => {
      const nameMatch = node.name.toLowerCase().includes(query.toLowerCase());
      const roleMatch = node.designation.toLowerCase().includes(query.toLowerCase());
      const deptMatch = node.department.toLowerCase().includes(query.toLowerCase());
      
      if (nameMatch || roleMatch || deptMatch) {
        return node.id;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const foundId = searchNodes(child, query);
          if (foundId) return foundId;
        }
      }
      
      return null;
    };
    
    const foundNodeId = searchNodes(organizationData, searchQuery);
    if (foundNodeId) {
      // Expand all parent nodes up to the found node
      const expandAllParents = (node: any, targetId: string, parentPath: string[] = []): string[] | null => {
        if (node.id === targetId) {
          return parentPath;
        }
        
        if (node.children) {
          for (const child of node.children) {
            const path = expandAllParents(child, targetId, [...parentPath, node.id]);
            if (path) return path;
          }
        }
        
        return null;
      };
      
      const parentsToExpand = expandAllParents(organizationData, foundNodeId) || [];
      const newExpandedNodes = new Set([...expandedNodes, ...parentsToExpand, foundNodeId]);
      setExpandedNodes(newExpandedNodes);
      setHighlightedNode(foundNodeId);
      
      toast({
        title: "Employee Found",
        description: "The organization chart has been updated to show the found employee.",
      });
    } else {
      toast({
        title: "No Match Found",
        description: "No employee matches your search criteria.",
        variant: "destructive"
      });
    }
  };

  const handleExport = (format: 'png' | 'pdf') => {
    toast({
      title: "Export Started",
      description: `Exporting organization chart as ${format.toUpperCase()}. The file will download shortly.`,
    });
    
    // In a real app, this would trigger a more complex export function
    setTimeout(() => {
      toast({
        title: "Chart Exported",
        description: `Your organization chart has been exported as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(zoomLevel + 10);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };
  
  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-full">
        <h1 className="text-2xl font-bold mb-6">Organization Chart</h1>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 md:col-span-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by name, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </Card>
          
          <Card className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="mx-2 text-sm font-medium">{zoomLevel}%</span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetZoom}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('png')}>
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </Card>
        </div>
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="bg-white rounded-lg border p-4">
          <TabsList className="grid grid-cols-3 mb-6 w-[400px] mx-auto">
            <TabsTrigger value="tree">Hierarchical Tree</TabsTrigger>
            <TabsTrigger value="department">Department View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tree" className="relative min-h-[600px] border rounded-lg p-4 overflow-auto">
            <div className="flex justify-center" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
              <OrganizationTree
                data={organizationData}
                expandedNodes={expandedNodes}
                toggleNodeExpansion={toggleNodeExpansion}
                highlightedNode={highlightedNode}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="department" className="min-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
              {/* Group by departments */}
              {["Executive", "Technology", "Human Resources", "Marketing", "Finance", "Operations"].map((dept) => (
                <div key={dept} className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-bold mb-3">{dept} Department</h3>
                  <OrganizationNode 
                    node={{
                      id: `dept-${dept}`,
                      name: getDepartmentHead(dept, organizationData)?.name || "Department Head",
                      designation: getDepartmentHead(dept, organizationData)?.designation || "Head",
                      department: dept,
                      children: []
                    }}
                    isExpanded={true}
                    toggleExpansion={() => {}}
                    isHighlighted={false}
                    showChildren={false}
                    isHeader={true}
                  />
                  <div className="mt-4 space-y-3">
                    {getEmployeesByDepartment(dept, organizationData).map(emp => (
                      <OrganizationNode 
                        key={emp.id}
                        node={emp}
                        isExpanded={false}
                        toggleExpansion={() => {}}
                        isHighlighted={highlightedNode === emp.id}
                        showChildren={false}
                        isHeader={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <OrganizationNodeList
              data={organizationData}
              highlightedNode={highlightedNode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Helper function to get department head
const getDepartmentHead = (department: string, data: any): any => {
  // If it's CEO/Executive, return the top node
  if (department === "Executive" && data.department === "Executive") {
    return data;
  }
  
  // For other departments, find the head
  const findDeptHead = (node: any): any => {
    if (node.department === department && 
        (node.designation.includes("Head") || 
         node.designation.includes("Lead") || 
         node.designation.includes("Manager"))) {
      return node;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const result = findDeptHead(child);
        if (result) return result;
      }
    }
    
    return null;
  };
  
  return findDeptHead(data);
};

// Helper function to get all employees in a department
const getEmployeesByDepartment = (department: string, data: any): any[] => {
  const employees: any[] = [];
  
  const findEmployees = (node: any) => {
    if (node.department === department) {
      employees.push(node);
    }
    
    if (node.children) {
      node.children.forEach((child: any) => findEmployees(child));
    }
  };
  
  findEmployees(data);
  
  // Remove department head from the list
  const deptHead = getDepartmentHead(department, data);
  return employees.filter(emp => emp.id !== deptHead?.id);
};

export default OrganizationChart;
