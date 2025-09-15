import { useState, useCallback, useEffect } from "react";
import { SupplyService } from "@/modules/supplies/services/supply.service";
import type { Supply } from "@/modules/supplies/types";
import { FormSelectField, type SelectOption } from "./form-select";

interface SupplySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSupplySelect?: (supply: Supply | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function SupplySelect({
  value,
  onValueChange,
  onSupplySelect,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  error,
}: SupplySelectProps) {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(false);

  // Load selected supply by ID when value changes
  useEffect(() => {
    const loadSelectedSupply = async () => {
      if (!value) return;

      // Check if we already have this supply in our list
      const existingSupply = supplies.find((s) => s.id === value);
      if (existingSupply) return;

      try {
        const supply = await SupplyService.getSupplyById(value);
        if (supply) {
          setSupplies((prev) => {
            const exists = prev.some((s) => s.id === supply.id);
            return exists ? prev : [...prev, supply];
          });
        }
      } catch (error) {
        console.error("Error loading selected supply:", error);
      }
    };

    loadSelectedSupply();
  }, [value, supplies]);

  const loadSupplies = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);

      const filters = {
        isActive: true,
        ...(searchTerm && { search: searchTerm }),
      };

      // Load all supplies without pagination for selection
      const result = await SupplyService.getAllSupplies(filters, 1000);
      setSupplies(result.supplies);
    } catch (error) {
      console.error("Error loading supplies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  const handleValueChange = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue);

      // Find and return the selected supply object
      const selectedSupply =
        supplies.find((s) => s.id === selectedValue) || null;
      onSupplySelect?.(selectedSupply);
    },
    [onValueChange, onSupplySelect, supplies]
  );

  const selectedSupply = supplies.find((s) => s.id === value);

  const options: SelectOption[] = supplies.map((supply) => ({
    value: supply.id,
    label: supply.name,
    disabled: !supply.isActive,
    description: `${supply.sku} - ${
      supply.unit
    } - Giá: ${supply.purchasePrice.toLocaleString("vi-VN")}đ - Tồn: ${
      supply.currentStock
    }`,
    metadata: {
      supply,
      sku: supply.sku,
      unit: supply.unit,
      purchasePrice: supply.purchasePrice,
      currentStock: supply.currentStock,
      minStock: supply.minStock,
    },
  }));

  const renderOption = useCallback((option: SelectOption) => {
    const supply = option.metadata?.supply as Supply;
    if (!supply) return null;

    return (
      <div className="flex flex-col w-full flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium line-clamp-1">{supply.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
          <span>
            {supply.unit} - Giá: {supply.purchasePrice.toLocaleString("vi-VN")}đ
          </span>
          <span
            className={
              supply.currentStock <= supply.minStock
                ? "text-orange-600"
                : "text-green-600"
            }
          >
            Tồn: {supply.currentStock}
          </span>
        </div>
        {supply.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {supply.description}
          </div>
        )}
      </div>
    );
  }, []);

  return (
    <div className={className}>
      <FormSelectField
        field={{
          value: value || "",
          onChange: handleValueChange,
        }}
        fieldState={{
          error: error ? { message: error } : undefined,
        }}
        options={options}
        label={label}
        placeholder={placeholder || "Chọn vật tư..."}
        searchPlaceholder="Tìm kiếm vật tư..."
        emptyMessage="Không tìm thấy vật tư nào."
        required={required}
        disabled={disabled}
        loading={loading}
        clearable
        renderOption={renderOption}
      />
      {selectedSupply && (
        <div className="text-sm mt-1 p-2 bg-muted/50 rounded">
          <div className="flex items-center justify-between">
            <span>
              Tồn kho: {selectedSupply.currentStock} {selectedSupply.unit}
            </span>
            {selectedSupply.currentStock <= selectedSupply.minStock && (
              <span className="text-orange-600 font-medium">Sắp hết hàng</span>
            )}
          </div>
          {selectedSupply.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {selectedSupply.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// For use with React Hook Form Controller
export function SupplySelectField({
  field,
  fieldState,
  onSupplySelect,
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
  onSupplySelect?: (supply: Supply | null) => void;
} & Omit<
  SupplySelectProps,
  "value" | "onValueChange" | "error" | "onSupplySelect"
>) {
  return (
    <SupplySelect
      {...props}
      value={field.value || ""}
      onValueChange={(value) => {
        field.onChange(value);
        field.onBlur?.();
      }}
      onSupplySelect={onSupplySelect}
      error={fieldState.error?.message}
    />
  );
}
