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
  // Load selected supplier by ID when value changes
  useEffect(() => {
    const loadSelectedSupplier = async () => {
      if (!value) return;
      
      // Check if we already have this supplier in our list
      const existingSupplier = suppliers.find(s => s.id === value);
      if (existingSupplier) return;

      try {
        const supplier = await SupplierService.getSupplierById(value);
        if (supplier) {
          setSuppliers(prev => {
            // Add to suppliers if not already present
            const exists = prev.some(s => s.id === value);
            if (exists) return prev;
            return [supplier, ...prev];
          });
        }
      } catch (error) {
        console.error("Error loading selected supplier:", error);
      }
    };

    loadSelectedSupplier();
  }, [value]);

  // Load suppliers with direct service call
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);

        // Use improved getActiveSuppliers method - get more initially
        const allSuppliers = await SupplierService.getActiveSuppliers();
        // Show first 50 suppliers when no search term

        setSuppliers(prev => {
          // Merge with existing suppliers, avoid duplicates
          const existing = prev.filter(p => !allSuppliers.some(a => a.id === p.id));
          return [...existing, ...allSuppliers.slice(0, 50)];
        });
      } catch (error) {
        console.error("Error loading suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    // Load suppliers when dropdown is opened
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Find selected supplier
  const selectedSupplier = value ? suppliers.find((supplier) => supplier.id === value) : null;

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
              {value && selectedSupplier ? (
                <div className="flex items-center gap-2 w-[220px]">
                  <span className="font-medium truncate">
                    {selectedSupplier.name}
                  </span>
                </div>
              ) : value ? (
                <div className="flex items-center gap-2 w-[220px]">
                  <span className="font-medium truncate text-muted-foreground">
                    Đang tải...
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
    onBlur?: () => void;
  };
  fieldState: {
    error?: {
      message?: string;
    };
  };
} & Omit<SupplierSelectProps, "value" | "onValueChange" | "error">) {
  const handleValueChange = useCallback((value: string) => {
    field.onChange(value);
    field.onBlur?.();
  }, [field]);

  return (
    <SupplierSelect
      {...props}
      value={field.value || ""}
      onValueChange={handleValueChange}
      error={fieldState.error?.message}
    />
  );
}
