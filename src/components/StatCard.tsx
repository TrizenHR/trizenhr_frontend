
import React from 'react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  hasBorder?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  count, 
  color, 
  bgColor,
  hasBorder = false,
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center p-4 rounded-md",
        hasBorder && "border border-gray-200 shadow-sm",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {icon && (
        <div className="mr-3" style={{ color }}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm" style={{ color }}>
          {label}
        </p>
        <p className="text-lg font-semibold" style={{ color }}>
          {count}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
