import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSelectField, type SelectOption } from "./form-select";
import { SupplyService } from "@/modules/supplies/services/supply.service";
import type { SupplyImport } from "@/modules/supplies/types";

interface SupplyImportSelectProps {
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
  supplyId?: string; // Filter imports by specific supply
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function SupplyImportSelect({
  supplyId,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  field,
  fieldState,
}: SupplyImportSelectProps) {
  const [supplyImports, setSupplyImports] = useState<SupplyImport[]>([]);

  const { data: supplyImportsData, isLoading } = useQuery({
    queryKey: ["supply-imports", { status: "completed", supplyId }],
    queryFn: () => SupplyService.getSupplyImportSelection(supplyId),
  });

  useEffect(() => {
    if (supplyImportsData && !isLoading) {
      setSupplyImports(supplyImportsData || []);
    }
  }, [supplyImportsData, isLoading]);

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
      field={field}
      fieldState={fieldState}
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
