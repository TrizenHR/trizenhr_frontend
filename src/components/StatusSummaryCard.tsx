
import React from 'react';
import { cn } from "@/lib/utils";

interface StatusSummaryCardProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
  className?: string;
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({ 
  label, 
  count, 
  color, 
  bgColor, 
  icon,
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex items-start rounded-md p-4 border border-[#e7ecef]", 
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {icon && <div className="mr-3">{icon}</div>}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color }}>
            {label}
          </span>
        </div>
        <span className="text-3xl font-bold mt-1" style={{ color }}>
          {count}
        </span>
      </div>
    </div>
  );
};

export default StatusSummaryCard;
