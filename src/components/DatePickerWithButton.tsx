
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithButtonProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export const DatePickerWithButton: React.FC<DatePickerWithButtonProps> = ({
  date,
  setDate,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium">Date</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left text-sm font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date ? format(date, "dd MMM yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <Button 
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        Apply
      </Button>
    </div>
  );
};
