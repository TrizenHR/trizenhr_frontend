
import React from 'react';
import { cn } from "@/lib/utils";

interface StatusSummaryCardProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  className?: string;
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({ 
  label, 
  count, 
  color, 
  bgColor, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col justify-center items-center rounded-md py-4 px-5 text-center", 
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      <span className="font-semibold text-md mb-1" style={{ color }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {count}
      </span>
    </div>
  );
};

export default StatusSummaryCard;
