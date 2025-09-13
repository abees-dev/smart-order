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
  type?: "text" | "textarea" | "number";
  required?: boolean;
  helpText?: string;
  rows?: number;
  min?: string; // for number type
  step?: string; // for number type
  value?: string | number;
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
}: FormTextFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const renderInputType = () => {
          if (type === "text") {
            return <Input placeholder={placeholder} {...field} />;
          } else if (type === "textarea") {
            return (
              <Textarea rows={rows} placeholder={placeholder} {...field} />
            );
          } else if (type === "number") {
            return (
              <Input
                type="number"
                min={min}
                step={step}
                placeholder={placeholder}
                {...field}
                value={value as number}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string to let user clear the field
                  if (value === "") {
                    field.onChange(0);
                    return;
                  }
                  const parsedValue = parseFloat(value);
                  if (!isNaN(parsedValue)) {
                    field.onChange(parsedValue);
                  }
                }}
              />
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
            {helpText && <FormDescription>{helpText}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};

export default FormTextField;
