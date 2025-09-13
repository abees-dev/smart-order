import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ReportFilters as ReportFiltersType } from "../types";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: Partial<ReportFiltersType>) => void;
  loading?: boolean;
}

export function ReportFilters({
  filters,
  onChange,
  loading,
}: ReportFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePeriodChange = (period: ReportFiltersType["period"]) => {
    onChange({ period });
  };

  const handleMonthChange = (month: string) => {
    onChange({ month });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onChange({ dateFrom: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onChange({ dateTo: date });
  };

  const handleInvoiceTypeChange = (
    invoiceType: ReportFiltersType["invoiceType"]
  ) => {
    onChange({ invoiceType });
  };

  const handleIncludeAdditionalCostsChange = (checked: boolean) => {
    onChange({ includeAdditionalCosts: checked });
  };

  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy", { locale: vi });
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Bộ lọc báo cáo
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Khoảng thời gian</Label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Theo tháng</SelectItem>
                <SelectItem value="quarterly">Theo quý</SelectItem>
                <SelectItem value="yearly">Theo năm</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.period === "monthly" && (
            <div className="space-y-2">
              <Label>Tháng</Label>
              <Select value={filters.month} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Loại hóa đơn</Label>
            <Select
              value={filters.invoiceType || "all"}
              onValueChange={(value) =>
                handleInvoiceTypeChange(
                  value === "all" ? undefined : (value as "input" | "output")
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả hóa đơn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hóa đơn</SelectItem>
                <SelectItem value="input">Hóa đơn đầu vào</SelectItem>
                <SelectItem value="output">Hóa đơn đầu ra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range */}
        {filters.period === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(filters.dateFrom, "dd/MM/yyyy")
                      : "Chọn ngày bắt đầu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={handleDateFromChange}
                    locale={vi}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(filters.dateTo, "dd/MM/yyyy")
                      : "Chọn ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={handleDateToChange}
                    locale={vi}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Additional Options */}
        {isExpanded && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAdditionalCosts"
                checked={filters.includeAdditionalCosts || false}
                onCheckedChange={handleIncludeAdditionalCostsChange}
              />
              <Label htmlFor="includeAdditionalCosts">
                Bao gồm chi phí phát sinh trong báo cáo
              </Label>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
