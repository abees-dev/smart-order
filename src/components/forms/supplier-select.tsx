import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SupplierService } from "@/modules/suppliers/services/supplier.service";
import { cn } from "@/lib/utils";
import SelectSearch from "../ui/select-search";
import { useQuery } from "@tanstack/react-query";

interface SupplierSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowCreate?: boolean;
  onCreateNew?: () => void;
  error?: string;
}

export function SupplierSelect({
  value,
  onValueChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  error,
}: SupplierSelectProps) {
  const { t } = useTranslation();
  // Load selected supplier by ID when value changes
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers-selection"],
    queryFn: SupplierService.getAllSuppliersSelection,
  });

  const handleValueChange = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue);
    },
    [onValueChange]
  );

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label} {required && <span className="text-destructive">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <div>
          <SelectSearch
            options={(suppliers || []).map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
              disabled: !supplier.isActive,
              renderOption: () => {
                return (
                  <div>
                    <div
                      className={cn(
                        !supplier.isActive && "text-muted-foreground",
                        "line-clamp-3 text-sm"
                      )}
                    >
                      {supplier.name}
                    </div>
                  </div>
                );
              },
            }))}
            value={value}
            onValueChange={handleValueChange}
            placeholder={placeholder || t("Chọn nhà cung cấp...")}
            searchPlaceholder={t("Tìm kiếm nhà cung cấp...")}
            emptyMessage={t("Không tìm thấy nhà cung cấp.")}
            loading={isLoading}
            disabled={disabled}
            className={cn("w-full", error && "border-destructive")}
          />
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

// For use with React Hook Form Controller
export function SupplierSelectField({
  field,
  fieldState,
  ...props
}: {
  field: {
    value: string | undefined;
    onChange: (value: string) => void;
    onBlur?: () => void;
  };
  fieldState: {
    error?: {
      message?: string;
    };
  };
} & Omit<SupplierSelectProps, "value" | "onValueChange" | "error">) {
  const handleValueChange = useCallback(
    (value: string) => {
      field.onChange(value);
      field.onBlur?.();
    },
    [field]
  );

  return (
    <SupplierSelect
      {...props}
      value={field.value || ""}
      onValueChange={handleValueChange}
      error={fieldState.error?.message}
    />
  );
}
