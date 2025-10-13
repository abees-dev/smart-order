import type { ChangeEvent, ReactNode } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "../ui";
import type { Control } from "react-hook-form";

interface FormTextFieldProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any, any, any> | undefined;
  label?: string;
  placeholder?: string;
  type?: "text" | "textarea" | "number" | "password" | "email";
  required?: boolean;
  helpText?: string;
  rows?: number;
  min?: string; // for number type
  step?: string; // for number type
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
  endAdornment?: ReactNode;
}

const FormTextField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  helpText,
  rows = 3,
  min = "0",
  step = "1",
  value,
  onChange,
  autoComplete,
  disabled = false,
  endAdornment,
}: FormTextFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const renderInputType = () => {
          if (type === "textarea") {
            return (
              <Textarea
                rows={rows}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e);
                }}
              />
            );
          } else if (type === "number") {
            return (
              <Input
                type="number"
                min={min}
                step={step}
                placeholder={placeholder || "0"}
                autoComplete={autoComplete}
                disabled={disabled}
                {...field}
                value={(value as number) || field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string to let user clear the field
                  if (value === "") {
                    onChange?.(e);
                    field.onChange("");
                    return;
                  }
                  const parsedValue = parseFloat(value);

                  if (!isNaN(parsedValue)) {
                    field.onChange(parsedValue);
                  }

                  onChange?.(e);
                }}
                autoFocus={false}
              />
            );
          } else {
            // For text, password, email, etc.
            return (
              <div className="relative">
                <Input
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  disabled={disabled}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange?.(e);
                  }}
                />
                {endAdornment}
              </div>
            );
          }
        };
        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>{renderInputType()}</FormControl>
            <FormMessage />
            {helpText && !fieldState.error && (
              <FormDescription>{helpText}</FormDescription>
            )}
          </FormItem>
        );
      }}
    />
  );
};

export default FormTextField;
