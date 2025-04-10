
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
        "flex items-center rounded-md p-3 border border-[#e7ecef]", 
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {icon && <div className="mr-3">{icon}</div>}
      <div className="flex items-center justify-between flex-1">
        <span className="font-medium text-sm" style={{ color }}>
          {label}
        </span>
        <span className="text-xl font-bold" style={{ color }}>
          {count}
        </span>
      </div>
    </div>
  );
};

export default StatusSummaryCard;
