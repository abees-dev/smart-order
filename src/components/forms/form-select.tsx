import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import SelectSearch, {
  type SelectSearchVirtualConfig,
} from "../ui/select-search";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface FormSelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  error?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  clearable?: boolean; // allow clearing the selection
  virtual?: SelectSearchVirtualConfig; // virtual scrolling configuration
}

export function FormSelect({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  required = false,
  disabled = false,
  loading = false,
  className,
  error,
  clearable,
  renderOption,
  virtual,
}: FormSelectProps) {
  const { t } = useTranslation();

  const handleValueChange = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue);
    },
    [onValueChange]
  );

  const defaultRenderOption = useCallback((option: SelectOption) => {
    return (
      <div>
        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex items-center gap-2 w-full">
            <span
              className={cn(
                "font-medium line-clamp-1",
                option.disabled && "text-muted-foreground"
              )}
            >
              {option.label}
            </span>
          </div>
          {option.description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {option.description}
            </div>
          )}
        </div>
      </div>
    );
  }, []);

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
            options={options.map((option) => ({
              value: option.value,
              label: option.label,
              disabled: option.disabled,
              renderOption: renderOption
                ? () => renderOption(option)
                : () => defaultRenderOption(option),
            }))}
            value={value}
            onValueChange={handleValueChange}
            placeholder={placeholder || t("Chọn tùy chọn...")}
            searchPlaceholder={searchPlaceholder || t("Tìm kiếm...")}
            emptyMessage={emptyMessage || t("Không tìm thấy kết quả.")}
            loading={loading}
            disabled={disabled}
            className={cn("w-full", error && "border-destructive")}
            clearable={clearable}
            virtual={virtual}
          />
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

// For use with React Hook Form Controller
export function FormSelectField({
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
} & Omit<FormSelectProps, "value" | "onValueChange" | "error">) {
  const handleValueChange = useCallback(
    (value: string) => {
      field.onChange(value);
      field.onBlur?.();
    },
    [field]
  );

  console.log("FormSelectField value:", field.value);

  return (
    <FormSelect
      {...props}
      value={field.value || ""}
      onValueChange={handleValueChange}
      error={fieldState.error?.message}
    />
  );
}
