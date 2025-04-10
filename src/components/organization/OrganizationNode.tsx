
import React from 'react';
import { ChevronDown, ChevronRight, Mail, Calendar, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrganizationNodeProps {
  node: {
    id: string;
    name: string;
    designation: string;
    department: string;
    email?: string;
    phone?: string;
    joiningDate?: string;
    image?: string;
    children?: any[];
  };
  isExpanded: boolean;
  toggleExpansion: (id: string) => void;
  isHighlighted: boolean;
  showChildren?: boolean;
  isHeader?: boolean;
}

export const OrganizationNode: React.FC<OrganizationNodeProps> = ({
  node,
  isExpanded,
  toggleExpansion,
  isHighlighted,
  showChildren = true,
  isHeader = false
}) => {
  // Get department color
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Executive': 'bg-purple-100 border-purple-300 text-purple-800',
      'Technology': 'bg-blue-100 border-blue-300 text-blue-800',
      'Human Resources': 'bg-green-100 border-green-300 text-green-800',
      'Marketing': 'bg-orange-100 border-orange-300 text-orange-800',
      'Finance': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'Operations': 'bg-red-100 border-red-300 text-red-800',
    };
    
    return colors[department] || 'bg-gray-100 border-gray-300 text-gray-800';
  };
  
  // Get department badge color
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
  
  // Get avatar fallback initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      className={`relative border rounded-lg p-3 transition-all duration-300 ${
        isHighlighted 
          ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
          : isHeader 
            ? getDepartmentColor(node.department) 
            : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      id={`org-node-${node.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle expand/collapse if has children */}
        {node.children && node.children.length > 0 && showChildren && (
          <button
            onClick={() => toggleExpansion(node.id)}
            className="mt-2 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {/* Avatar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={`h-10 w-10 ${
                node.department === 'Executive' ? 'bg-purple-500' :
                node.department === 'Technology' ? 'bg-blue-500' :
                node.department === 'Human Resources' ? 'bg-green-500' :
                node.department === 'Marketing' ? 'bg-orange-500' :
                node.department === 'Finance' ? 'bg-yellow-500' :
                node.department === 'Operations' ? 'bg-red-500' :
                'bg-gray-500'
              }`}>
                {node.image ? (
                  <AvatarImage src={node.image} alt={node.name} />
                ) : (
                  <AvatarFallback>{getInitials(node.name)}</AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div className="font-medium">{node.name}</div>
                {node.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{node.email}</span>
                  </div>
                )}
                {node.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{node.phone}</span>
                  </div>
                )}
                {node.joiningDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined: {node.joiningDate}</span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Employee details */}
        <div>
          <h3 className="font-bold text-sm">{node.name}</h3>
          <p className="text-xs text-gray-600">{node.designation}</p>
          <Badge variant={getDepartmentBadgeVariant(node.department)} className="mt-1 text-xs">
            {node.department}
          </Badge>
        </div>
      </div>
      
      {/* Children nodes */}
      {showChildren && isExpanded && node.children && node.children.length > 0 && (
        <div className="pl-7 mt-3 space-y-3 pt-3 border-t border-dashed border-gray-200">
          {node.children.map(child => (
            <OrganizationNode
              key={child.id}
              node={child}
              isExpanded={isExpanded && isExpanded}
              toggleExpansion={toggleExpansion}
              isHighlighted={isHighlighted && child.id === isHighlighted}
              showChildren={showChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
};
