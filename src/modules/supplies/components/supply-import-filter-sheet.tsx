import { useState, useEffect } from "react";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SupplyImportFilters } from "../types";

interface SupplyImportFilterSheetProps {
  filters: SupplyImportFilters;
  onFiltersChange: (filters: SupplyImportFilters) => void;
}

export function SupplyImportFilterSheet({
  filters,
  onFiltersChange,
}: SupplyImportFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<SupplyImportFilters>(filters);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  useEffect(() => {
    setTempFilters(filters);
    if (filters.dateFrom) {
      setDateFrom(filters.dateFrom.toDate());
    }
    if (filters.dateTo) {
      setDateTo(filters.dateTo.toDate());
    }
  }, [filters]);

  const handleApplyFilters = () => {
    const newFilters: SupplyImportFilters = {
      ...tempFilters,
    };

    // Convert dates to Timestamp if they exist
    if (dateFrom) {
      // Set to start of day (00:00:00)
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      newFilters.dateFrom = Timestamp.fromDate(fromDate);
    }
    if (dateTo) {
      // Set to end of day (23:59:59.999) to include all data from that day
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      newFilters.dateTo = Timestamp.fromDate(toDate);
    }

    onFiltersChange(newFilters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: SupplyImportFilters = {};
    setTempFilters(resetFilters);
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange(resetFilters);
    setOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] p-4">
        <SheetHeader className="p-0">
          <SheetTitle>Bộ lọc phiếu nhập</SheetTitle>
          <SheetDescription>
            Áp dụng các bộ lọc để tìm kiếm phiếu nhập phù hợp
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={tempFilters.status || "all"}
              onValueChange={(value) =>
                setTempFilters((prev) => ({
                  ...prev,
                  status:
                    value === "all"
                      ? undefined
                      : (value as "pending" | "completed" | "cancelled"),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label>Thời gian tạo</Label>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        format(dateFrom, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={vi}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Đến ngày
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? (
                        format(dateTo, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={vi}
                      initialFocus
                      disabled={(date) => (dateFrom ? date < dateFrom : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
          <Button onClick={handleApplyFilters}>Áp dụng</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
