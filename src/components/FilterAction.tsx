import { useState, useCallback, useEffect, type ReactNode, memo } from "react";
import { Filter, X, ChevronDown, Sparkles, RotateCcw } from "lucide-react";

// Helper function to generate effective placeholder text
const getEffectivePlaceholder = (
  field: FilterField,
  defaultPlaceholder: string
): string => {
  const basePlaceholder = field.placeholder || defaultPlaceholder;

  if (field.showLabelInPlaceholder) {
    return `${field.label}: ${basePlaceholder}`;
  }

  return basePlaceholder;
};
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import { DateRangePicker } from "./ui/date-range-picker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import SelectSearch from "./ui/select-search";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DateRange } from "react-day-picker";
import { formatDateRange } from "@/utils";

// Filter field types
export type FilterFieldType =
  | "text"
  | "select"
  | "multiSelect"
  | "checkbox"
  | "date"
  | "dateRange"
  | "number";

// Filter field configuration
export interface FilterField {
  key: string;
  type: FilterFieldType;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  clearable?: boolean;
  showLabelInPlaceholder?: boolean;
  hideLabel?: boolean;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
    render?: (options: {
      value: string;
      label: string;
      disabled?: boolean;
    }) => ReactNode;
  }>;
  defaultValue?: string | number | boolean | Date | DateRange;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  icon?: ReactNode;
}

// Filter layout types
export type FilterLayout = "inline" | "sheet" | "popover" | "auto";

// Filter configuration
export interface FilterConfig {
  fields: FilterField[];
  layout?: FilterLayout;
  title?: string;
  description?: string;
  showActiveCount?: boolean;
  showClearAll?: boolean;
  compactMode?: boolean;
  showActiveFilters?: boolean;
}

// Filter values type
export type FilterValues = Record<
  string,
  string | number | boolean | Date | DateRange | undefined
>;

// Props for the FilterAction component
export interface FilterActionProps {
  config: FilterConfig;
  values: FilterValues;
  onFiltersChange: (values: FilterValues) => void;
  className?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "sm" | "default" | "lg";
}

// Individual filter field components
const FilterTextField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div
    className={cn(
      field.hideLabel ? "space-y-0" : "space-y-2",
      field.icon && "relative"
    )}
  >
    {!field.hideLabel && <Label htmlFor={field.key}>{field.label}</Label>}
    {field.icon && (
      <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
        {field.icon}
      </div>
    )}
    <Input
      id={field.key}
      placeholder={getEffectivePlaceholder(field, "Nhập để tìm kiếm...")}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(field.icon && "pl-8")}
    />
  </div>
);

const FilterSelectField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const handleValueChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const searchOptions = [
    ...(field.options || []).map((option) => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
      renderOption: option.render,
    })),
  ];

  return (
    <div
      className={cn(
        field.hideLabel ? "space-y-0" : "space-y-2",
        field.icon && "relative"
      )}
    >
      {!field.hideLabel && <Label>{field.label}</Label>}
      {field.icon && (
        <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
          {field.icon}
        </div>
      )}
      <SelectSearch
        options={searchOptions}
        value={value || ""}
        onValueChange={handleValueChange}
        placeholder={getEffectivePlaceholder(
          field,
          `Chọn ${field.label?.toLowerCase()}`
        )}
        searchPlaceholder={
          field.searchPlaceholder ||
          (field.showLabelInPlaceholder
            ? `${field.label}: Tìm kiếm...`
            : "Tìm kiếm...")
        }
        emptyMessage={field.emptyMessage || "Không tìm thấy kết quả."}
        clearable={field.clearable !== false}
        className={cn("w-full", field.icon && "pl-8")}
      />
    </div>
  );
};

const FilterCheckboxField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: boolean;
  onChange: (value: boolean | undefined) => void;
}) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id={field.key}
      checked={value === true}
      onCheckedChange={(checked) =>
        onChange(checked === true ? true : undefined)
      }
    />
    <Label htmlFor={field.key} className="text-sm">
      {field.label}
    </Label>
  </div>
);

const FilterDateField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: Date;
  onChange: (value: Date | undefined) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        field.hideLabel ? "space-y-0" : "space-y-2",
        field.icon && "relative"
      )}
    >
      {field.icon && (
        <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
          {field.icon}
        </div>
      )}
      {!field.hideLabel && <Label>{field.label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value
              ? format(value, "dd/MM/yyyy")
              : getEffectivePlaceholder(field, "Chọn ngày")}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const FilterDateRangeField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: DateRange;
  onChange: (value: DateRange | undefined) => void;
}) => {
  return (
    <div
      className={cn(
        field.hideLabel ? "space-y-0" : "space-y-2",
        field.icon && "relative"
      )}
    >
      {field.icon && (
        <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
          {field.icon}
        </div>
      )}
      {!field.hideLabel && <Label>{field.label}</Label>}
      <DateRangePicker
        date={value}
        onDateChange={(date) => {
          const { dateFrom, dateTo } = formatDateRange(
            date?.from || null,
            date?.to || null
          );
          onChange({
            from: dateFrom ? new Date(dateFrom) : undefined,
            to: dateTo ? new Date(dateTo) : undefined,
          });
        }}
        placeholder={getEffectivePlaceholder(field, "Chọn khoảng thời gian")}
        className={cn("w-full", field.icon && "pl-8")}
      />
    </div>
  );
};

const FilterNumberField = ({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: number;
  onChange: (value: number | undefined) => void;
}) => (
  <div
    className={cn(
      field.hideLabel ? "space-y-0" : "space-y-2",
      field.icon && "relative"
    )}
  >
    {field.icon && (
      <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
        {field.icon}
      </div>
    )}
    {!field.hideLabel && <Label htmlFor={field.key}>{field.label}</Label>}
    <Input
      id={field.key}
      type="number"
      placeholder={getEffectivePlaceholder(field, "Nhập số...")}
      value={value || ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : undefined)
      }
      min={field.validation?.min}
      max={field.validation?.max}
    />
  </div>
);

// Render individual filter field based on type
const renderFilterField = (
  field: FilterField,
  value: string | number | boolean | Date | DateRange | undefined,
  onChange: (
    value: string | number | boolean | Date | DateRange | undefined
  ) => void
) => {
  switch (field.type) {
    case "text":
      return (
        <FilterTextField
          field={field}
          value={value as string}
          onChange={onChange as (value: string) => void}
        />
      );
    case "select":
      return (
        <FilterSelectField
          field={field}
          value={value as string}
          onChange={onChange as (value: string) => void}
        />
      );
    case "checkbox":
      return (
        <FilterCheckboxField
          field={field}
          value={value as boolean}
          onChange={onChange as (value: boolean | undefined) => void}
        />
      );
    case "date":
      return (
        <FilterDateField
          field={field}
          value={value as Date}
          onChange={onChange as (value: Date | undefined) => void}
        />
      );
    case "dateRange":
      return (
        <FilterDateRangeField
          field={field}
          value={value as DateRange}
          onChange={onChange as (value: DateRange | undefined) => void}
        />
      );
    case "number":
      return (
        <FilterNumberField
          field={field}
          value={value as number}
          onChange={onChange as (value: number | undefined) => void}
        />
      );
    default:
      return null;
  }
};

// Active filter badge component
const ActiveFilterBadge = ({
  field,
  value,
  onRemove,
}: {
  field: FilterField;
  value: string | number | boolean | Date | DateRange;
  onRemove: () => void;
}) => {
  const getDisplayData = () => {
    switch (field.type) {
      case "select": {
        const option = field.options?.find((opt) => opt.value === value);
        return {
          label: field.label,
          value: option ? option.label : value,
        };
      }
      case "checkbox":
        return {
          label: field.label,
          value: null,
        };
      case "date":
        return {
          label: field.label,
          value: format(new Date(value as Date), "dd/MM/yyyy"),
        };
      case "dateRange": {
        const dateRange = value as DateRange;
        if (dateRange.from && dateRange.to) {
          return {
            label: field.label,
            value: `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
              dateRange.to,
              "dd/MM/yyyy"
            )}`,
          };
        } else if (dateRange.from) {
          return {
            label: field.label,
            value: format(dateRange.from, "dd/MM/yyyy"),
          };
        }
        return {
          label: field.label,
          value: "Khoảng thời gian",
        };
      }
      case "text":
      case "number":
        return {
          label: field.label,
          value: value,
        };
      default:
        return {
          label: field.label,
          value: value,
        };
    }
  };

  const displayData = getDisplayData();

  return (
    <div className="group relative inline-flex items-center">
      <Badge
        variant="secondary"
        className={cn(
          "pr-1 pl-3 py-1.5 gap-1.5 text-xs font-medium",
          "bg-primary/8 text-primary border-primary/15 border",
          "hover:bg-primary/12 hover:border-primary/25",
          "transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-primary/65 font-normal text-[11px] uppercase tracking-wider">
            {displayData.label}
          </span>
          {displayData.value && (
            <>
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="font-semibold text-primary">
                {String(displayData.value)}
              </span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-4 w-4 p-0 ml-1.5 opacity-60 hover:opacity-100",
            "hover:bg-destructive/10 hover:text-destructive",
            "transition-all duration-200 rounded-full",
            "hover:scale-110"
          )}
          onClick={onRemove}
          title={`Xóa bộ lọc ${displayData.label}`}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
};

// Inline layout component
const InlineFilterLayout = ({
  config,
  localValues,
  handleFilterChange,
  handleClearAll,
  getActiveFiltersCount,
}: {
  config: FilterConfig;
  localValues: FilterValues;
  handleFilterChange: (
    key: string,
    value: string | number | boolean | Date | DateRange | undefined
  ) => void;
  handleClearAll: () => void;
  getActiveFiltersCount: () => number;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {config.fields.map((field) => (
        <div key={field.key}>
          {renderFilterField(field, localValues[field.key], (value) =>
            handleFilterChange(field.key, value)
          )}
        </div>
      ))}
    </div>

    {/* Active filters */}
    {config.showActiveFilters && getActiveFiltersCount() > 0 && (
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 rounded-lg border border-primary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <Label className="text-sm font-semibold text-primary">
              Bộ lọc đang áp dụng
            </Label>
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
            >
              {getActiveFiltersCount()} bộ lọc
            </Badge>
          </div>
          {config.showClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className={cn(
                "text-xs font-medium text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10 transition-colors duration-200",
                "flex items-center gap-1.5"
              )}
            >
              <RotateCcw className="h-3 w-3" />
              Xóa tất cả
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {config.fields.map((field) => {
            const value = localValues[field.key];
            const hasValue =
              value !== undefined && value !== "" && value !== false;

            if (!hasValue) return null;

            return (
              <ActiveFilterBadge
                key={field.key}
                field={field}
                value={value}
                onRemove={() =>
                  handleFilterChange(
                    field.key,
                    field.type === "checkbox" ? undefined : ""
                  )
                }
              />
            );
          })}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Nhấp vào dấu × để xóa từng bộ lọc hoặc "Xóa tất cả" để xóa hết
        </div>
      </div>
    )}
  </div>
);

// Sheet layout component
const SheetFilterLayout = ({
  config,
  localValues,
  handleFilterChange,
  handleApplyFilters,
  handleClearAll,
  getActiveFiltersCount,
  trigger,
}: {
  config: FilterConfig;
  localValues: FilterValues;
  handleFilterChange: (
    key: string,
    value: string | number | boolean | Date | DateRange | undefined
  ) => void;
  handleApplyFilters: () => void;
  handleClearAll: () => void;
  getActiveFiltersCount: () => number;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {config.title || "Bộ lọc"}
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} bộ lọc
              </Badge>
            )}
          </SheetTitle>
          {config.description && (
            <SheetDescription>{config.description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="py-6 space-y-6">
          {config.fields.map((field) => (
            <div key={field.key}>
              {renderFilterField(field, localValues[field.key], (value) =>
                handleFilterChange(field.key, value)
              )}
            </div>
          ))}

          {/* Active filters display */}
          {getActiveFiltersCount() > 0 && (
            <div className="p-3 bg-gradient-to-r from-primary/5 via-primary/2 to-primary/5 rounded-md border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <Label className="text-sm font-semibold text-primary">
                  Bộ lọc đang áp dụng
                </Label>
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {getActiveFiltersCount()}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.fields.map((field) => {
                  const value = localValues[field.key];
                  const hasValue =
                    value !== undefined && value !== "" && value !== false;

                  if (!hasValue) return null;

                  return (
                    <ActiveFilterBadge
                      key={field.key}
                      field={field}
                      value={value}
                      onRemove={() =>
                        handleFilterChange(
                          field.key,
                          field.type === "checkbox" ? undefined : ""
                        )
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Nhấp vào × để xóa từng bộ lọc
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa tất cả
          </Button>
          <Button
            onClick={() => {
              handleApplyFilters();
              setOpen(false);
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Áp dụng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Popover layout component
const PopoverFilterLayout = ({
  config,
  localValues,
  handleFilterChange,
  handleApplyFilters,
  handleClearAll,
  getActiveFiltersCount,
  trigger,
}: {
  config: FilterConfig;
  localValues: FilterValues;
  handleFilterChange: (
    key: string,
    value: string | number | boolean | Date | DateRange | undefined
  ) => void;
  handleApplyFilters: () => void;
  handleClearAll: () => void;
  getActiveFiltersCount: () => number;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {config.title || "Bộ lọc"}
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </h4>
          </div>

          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.key}>
                {renderFilterField(field, localValues[field.key], (value) =>
                  handleFilterChange(field.key, value)
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1 text-muted-foreground hover:text-destructive hover:border-destructive/50 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Xóa
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleApplyFilters();
                setOpen(false);
              }}
              className="flex-1 flex items-center gap-1"
            >
              <Filter className="h-3 w-3" />
              Áp dụng
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Main FilterAction component
const FilterAction = ({
  config,
  values,
  onFiltersChange,
  className,
  buttonVariant = "outline",
  buttonSize = "sm",
}: FilterActionProps) => {
  const [localValues, setLocalValues] = useState<FilterValues>(values);
  const isMobile = useIsMobile();

  // Sync local values with prop values
  useEffect(() => {
    setLocalValues(values);
  }, [JSON.stringify(values)]);

  const handleFilterChange = useCallback(
    (
      key: string,
      value: string | number | boolean | Date | DateRange | undefined
    ) => {
      setLocalValues((prev) => ({
        ...prev,
        [key]: value === "" ? undefined : value,
      }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localValues);
  }, [localValues, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    const clearedValues: FilterValues = {};
    setLocalValues(clearedValues);
    onFiltersChange(clearedValues);
  }, [onFiltersChange]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(localValues).filter(
      (value) => value !== undefined && value !== "" && value !== false
    ).length;
  }, [localValues]);

  // Determine layout based on config and responsive behavior
  const effectiveLayout =
    config.layout === "auto"
      ? isMobile
        ? "sheet"
        : "popover"
      : config.layout || "popover";

  // Auto-apply for inline layout
  useEffect(() => {
    if (effectiveLayout === "inline") {
      onFiltersChange(localValues);
    }
  }, [localValues, effectiveLayout, onFiltersChange]);

  // Filter button trigger
  const filterButton = (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      className={cn("gap-2", className)}
    >
      <Filter className="h-4 w-4" />
      {config.compactMode ? (
        getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-1">
            {getActiveFiltersCount()}
          </Badge>
        )
      ) : (
        <>
          Lọc
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          )}
        </>
      )}
    </Button>
  );

  // Render based on layout
  switch (effectiveLayout) {
    case "inline":
      return (
        <InlineFilterLayout
          config={config}
          localValues={localValues}
          handleFilterChange={handleFilterChange}
          handleClearAll={handleClearAll}
          getActiveFiltersCount={getActiveFiltersCount}
        />
      );

    case "sheet":
      return (
        <SheetFilterLayout
          config={config}
          localValues={localValues}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          handleClearAll={handleClearAll}
          getActiveFiltersCount={getActiveFiltersCount}
          trigger={filterButton}
        />
      );

    case "popover":
    default:
      return (
        <PopoverFilterLayout
          config={config}
          localValues={localValues}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          handleClearAll={handleClearAll}
          getActiveFiltersCount={getActiveFiltersCount}
          trigger={filterButton}
        />
      );
  }
};

export default memo(FilterAction);
