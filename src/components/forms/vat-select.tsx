import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VAT_RATE_OPTIONS } from "@/constants/vat";
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
} from "react-hook-form";

interface VatSelectFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  fieldState?: { error?: FieldError };
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const VatSelectField = ({
  field,
  fieldState,
  label = "Thuế VAT (%)",
  placeholder = "Chọn VAT",
  required = false,
  className,
}: VatSelectFieldProps) => {
  return (
    <FormItem className={className}>
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <Select
        onValueChange={(value) => {
          field.onChange(parseInt(value));
        }}
        value={field.value?.toString()}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {VAT_RATE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState?.error && (
        <FormMessage>{fieldState.error.message}</FormMessage>
      )}
    </FormItem>
  );
};

export default VatSelectField;
