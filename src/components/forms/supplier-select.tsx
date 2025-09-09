import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SupplierService } from "@/modules/suppliers/services/supplier.service";
import type { Supplier } from "@/modules/suppliers";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  // Load suppliers with direct service call
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);

        // Use improved getActiveSuppliers method - get more initially
        const allSuppliers = await SupplierService.getActiveSuppliers();
        // Show first 50 suppliers when no search term

        setSuppliers(allSuppliers.slice(0, 50));
      } catch (error) {
        console.error("Error loading suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    // Only load when dropdown is open or there's a search term
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Find selected supplier
  const selectedSupplier = suppliers.find((supplier) => supplier.id === value);

  // Reset search when dropdown closes and focus input when opened
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleValueChange = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue);
      setIsOpen(false);
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
        <Select
          value={value || ""}
          onValueChange={handleValueChange}
          disabled={disabled}
          open={isOpen}
          onOpenChange={handleOpenChange}
        >
          <SelectTrigger
            className={cn(error && "border-destructive", "w-full")}
          >
            <SelectValue placeholder={placeholder || t("Chọn nhà cung cấp")}>
              {selectedSupplier ? (
                <div className="flex items-center gap-2 w-[220px]">
                  <span className="font-medium truncate">
                    {selectedSupplier.name}
                  </span>
                </div>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
          >
            {/* Loading state */}
            {loading && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {t("Đang tải...")}
              </div>
            )}

            {/* No results */}
            {!loading && suppliers.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Không có nhà cung cấp nào"
              </div>
            )}

            {/* Supplier options */}
            {!loading &&
              suppliers.map((supplier) => {
                return (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2 w-full">
                        <span className={cn("font-medium")}>
                          {supplier.name}
                        </span>
                        {supplier.email && (
                          <span className="text-xs text-muted-foreground">
                            {supplier.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{supplier.phone}</span>
                        {supplier.city && supplier.country && (
                          <>
                            <span>•</span>
                            <span>
                              {supplier.city}, {supplier.country}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
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
  };
  fieldState: {
    error?: {
      message?: string;
    };
  };
} & Omit<SupplierSelectProps, "value" | "onValueChange" | "error">) {
  return (
    <SupplierSelect
      {...props}
      value={field.value || ""}
      onValueChange={field.onChange}
      error={fieldState.error?.message}
    />
  );
}
