import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OrderService } from "@/modules/order/services/order.service";
import { cn } from "@/lib/utils";
import SelectSearch from "../ui/select-search";
import { useQuery } from "@tanstack/react-query";

interface OrderSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function OrderSelect({
  value,
  onValueChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  error,
}: OrderSelectProps) {
  const { t } = useTranslation();

  // Load orders for selection
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["orders-for-selection"],
    queryFn: () => OrderService.getOrdersSelection(["order"]), // Get recent orders
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
            options={(ordersResponse?.orders || []).map((order) => ({
              value: order.id,
              label: order.orderNumber,
              disabled: order.status === "cancelled",
              renderOption: () => {
                return (
                  <div>
                    <div className="text-sm font-medium">
                      {order.orderNumber}
                    </div>
                    {order.customerName && (
                      <div className="text-xs text-muted-foreground">
                        {order.customerName}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Trạng thái:{" "}
                      {order.status === "draft"
                        ? "Nháp"
                        : order.status === "confirmed"
                        ? "Đã xác nhận"
                        : order.status === "exported"
                        ? "Đã xuất kho"
                        : order.status === "completed"
                        ? "Hoàn thành"
                        : "Đã hủy"}
                    </div>
                  </div>
                );
              },
            }))}
            value={value}
            onValueChange={handleValueChange}
            placeholder={placeholder || t("Chọn đơn hàng...")}
            searchPlaceholder={t("Tìm kiếm đơn hàng...")}
            emptyMessage={t("Không tìm thấy đơn hàng.")}
            loading={isLoading}
            disabled={disabled}
            className={cn("w-full", error && "border-destructive")}
            clearable={true}
          />
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

// For use with React Hook Form Controller
export function OrderSelectField({
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
} & Omit<OrderSelectProps, "value" | "onValueChange" | "error">) {
  const handleValueChange = useCallback(
    (value: string) => {
      field.onChange(value);
      field.onBlur?.();
    },
    [field]
  );

  return (
    <OrderSelect
      {...props}
      value={field.value || ""}
      onValueChange={handleValueChange}
      error={fieldState.error?.message}
    />
  );
}
