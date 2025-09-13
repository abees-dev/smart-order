import * as React from "react";
import { CalendarIcon, Check, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = "Chọn khoảng thời gian",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);

  // Sync tempDate when date prop changes
  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleApply = () => {
    onDateChange?.(tempDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
  };

  const formatDateRange = (dateRange: DateRange) => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd/MM/yyyy", {
        locale: vi,
      })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`;
    }
    if (dateRange.from) {
      return format(dateRange.from, "dd/MM/yyyy", { locale: vi });
    }
    return placeholder;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? formatDateRange(date) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="flex">
              {/* Calendar */}
              <div className="p-3">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempDate?.from}
                  selected={tempDate}
                  onSelect={setTempDate}
                  numberOfMonths={2}
                  locale={vi}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 p-3 border-t bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-3 w-3" />
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="flex items-center gap-2"
              >
                <Check className="h-3 w-3" />
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
