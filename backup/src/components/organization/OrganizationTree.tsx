
import React from 'react';
import { OrganizationNode } from './OrganizationNode';

interface OrganizationTreeProps {
  data: any;
  expandedNodes: Set<string>;
  toggleNodeExpansion: (id: string) => void;
  highlightedNode: string | null;
}

export const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  data,
  expandedNodes,
  toggleNodeExpansion,
  highlightedNode
}) => {
  // Recursively render the tree
  const renderNode = (node: any) => {
    const isExpanded = expandedNodes.has(node.id);
    const isHighlighted = highlightedNode === node.id;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <OrganizationNode
          node={node}
          isExpanded={isExpanded}
          toggleExpansion={toggleNodeExpansion}
          isHighlighted={isHighlighted}
        />
        
        {/* If node is expanded and has children, render them */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="relative mt-6">
            {/* Vertical connector line */}
            <div className="absolute h-6 w-0.5 bg-gray-300 left-1/2 -top-6 transform -translate-x-1/2"></div>
            
            {/* Children container */}
            <div className="relative flex flex-wrap justify-center gap-6">
              {/* Horizontal connector line for multiple children */}
              {node.children.length > 1 && (
                <div className="absolute h-0.5 bg-gray-300 top-0 left-0 right-0 transform -translate-y-3"></div>
              )}
              
              {/* Render each child */}
              {node.children.map((child: any, index: number) => (
                <div key={child.id} className="relative">
                  {/* Vertical connector to each child when there are multiple children */}
                  {node.children.length > 1 && (
                    <div className="absolute h-3 w-0.5 bg-gray-300 left-1/2 -top-3 transform -translate-x-1/2"></div>
                  )}
                  
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return <div className="pt-4">{renderNode(data)}</div>;
};
