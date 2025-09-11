import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SUPPLY_CATEGORIES } from "@/modules/supplies/utils/supply-categrory";
import { FormSelect, type SelectOption } from "./form-select";

interface SupplyCategorySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function SupplyCategorySelect({
  value,
  onValueChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  error,
}: SupplyCategorySelectProps) {
  const { t } = useTranslation();

  // Convert categories to SelectOption format
  const options: SelectOption[] = SUPPLY_CATEGORIES.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <FormSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      label={label}
      placeholder={placeholder || t("Chọn loại vật tư...")}
      searchPlaceholder={t("Tìm kiếm loại vật tư...")}
      emptyMessage={t("Không tìm thấy loại vật tư.")}
      required={required}
      disabled={disabled}
      className={className}
      error={error}
    />
  );
}

// For use with React Hook Form Controller
export function SupplyCategorySelectField({
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
} & Omit<SupplyCategorySelectProps, "value" | "onValueChange" | "error">) {
  const handleValueChange = useCallback(
    (value: string) => {
      field.onChange(value);
      field.onBlur?.();
    },
    [field]
  );

  return (
    <SupplyCategorySelect
      {...props}
      value={field.value || ""}
      onValueChange={handleValueChange}
      error={fieldState.error?.message}
    />
  );
}
