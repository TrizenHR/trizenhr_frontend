
import React from 'react';
import { cn } from "@/lib/utils";

interface StatusSummaryCardProps {
  label: string;
  count: number;
  color: string;
  className?: string;
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({ label, count, color, className }) => {
  return (
    <div 
      className={cn(
        "flex flex-col justify-center items-center rounded-md py-3 px-5", 
        className
      )}
      style={{ backgroundColor: `${color}10` }} // Light background with opacity
    >
      <span className="font-semibold text-sm" style={{ color }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {count}
      </span>
    </div>
  );
};

export default StatusSummaryCard;
