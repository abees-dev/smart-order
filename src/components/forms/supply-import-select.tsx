import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSelectField, type SelectOption } from "./form-select";
import { SupplyService } from "@/modules/supplies/services/supply.service";
import type { SupplyImport } from "@/modules/supplies/types";

interface SupplyImportSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSupplyImportSelect?: (supplyImport: SupplyImport | null) => void;
  supplyId?: string; // Filter imports by specific supply
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function SupplyImportSelect({
  value,
  onValueChange,
  onSupplyImportSelect,
  supplyId,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  error,
}: SupplyImportSelectProps) {
  const [supplyImports, setSupplyImports] = useState<SupplyImport[]>([]);

  const { data: supplyImportsData, isLoading } = useQuery({
    queryKey: ["supply-imports", { status: "completed", supplyId }],
    queryFn: () => SupplyService.getSupplyImportSelection(supplyId),
  });

  console.log("supplyImportsData", supplyImportsData);

  useEffect(() => {
    if (supplyImportsData && !isLoading) {
      setSupplyImports(supplyImportsData || []);
    }
  }, [supplyImportsData, isLoading]);

  const handleValueChange = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue);

      // Find and return the selected supply import object
      const selectedSupplyImport =
        supplyImports.find((si) => si.id === selectedValue) || null;
      onSupplyImportSelect?.(selectedSupplyImport);
    },
    [supplyImports, onValueChange, onSupplyImportSelect]
  );

  // Convert supply imports to options
  const options: SelectOption[] = supplyImports.map((supplyImport) => ({
    value: supplyImport.id,
    label: `${supplyImport.invoiceNumber} - ${
      supplyImport.supplier?.name || "Không có nhà cung cấp"
    }`,
    description: `Ngày nhập: ${new Date(
      supplyImport.importDate
    ).toLocaleDateString("vi-VN")} - Tổng: ${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(supplyImport.totalAmount)}`,
  }));

  return (
    <FormSelectField
      field={{
        value: value || "",
        onChange: handleValueChange,
      }}
      fieldState={{
        error: error ? { message: error } : undefined,
      }}
      label={label || "Chọn phiếu nhập"}
      placeholder={placeholder || "Tìm kiếm phiếu nhập..."}
      searchPlaceholder="Tìm kiếm theo số hóa đơn..."
      emptyMessage="Không tìm thấy phiếu nhập nào"
      options={options}
      required={required}
      disabled={disabled || isLoading}
      loading={isLoading}
      className={className}
      clearable
    />
  );
}

export default SupplyImportSelect;
