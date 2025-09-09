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
import { SupplierService } from "@/modules/suppliers/services/supplier.service";
import type { Supplier } from "@/modules/suppliers";
import type { SupplyImportFilters } from "../types";

interface SupplyImportFilterSheetProps {
  filters: SupplyImportFilters;
  onFiltersChange: (filters: SupplyImportFilters) => void;
}

// Standalone Supplier Select without form context
function StandaloneSupplierSelect({
  value,
  onValueChange,
  placeholder,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  // Load suppliers when dropdown opens
  useEffect(() => {
    const loadSuppliers = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const allSuppliers = await SupplierService.getActiveSuppliers();
        setSuppliers(allSuppliers.slice(0, 50));
      } catch (error) {
        console.error("Error loading suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, [isOpen]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === value);

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "all") {
      onValueChange?.("");
    } else {
      onValueChange?.(selectedValue);
    }
    setIsOpen(false);
  };

  return (
    <Select
      value={value || "all"}
      onValueChange={handleValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedSupplier ? (
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {selectedSupplier.name}
              </span>
            </div>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>

        {loading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Đang tải...
          </div>
        )}

        {!loading && suppliers.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Không có nhà cung cấp nào
          </div>
        )}

        {!loading &&
          suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              <div className="flex flex-col items-start gap-1 w-full">
                <span className="font-medium">{supplier.name}</span>
                {supplier.phone && (
                  <span className="text-xs text-muted-foreground">
                    {supplier.phone}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
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
