import {
  FormControl,
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
  type?: "text" | "area" | "number";
  required?: boolean;
}

const FormTextField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: FormTextFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const renderInputType = () => {
          if (type === "text") {
            return <Input placeholder={placeholder} {...field} />;
          } else if (type === "area") {
            return <Textarea placeholder={placeholder} {...field} />;
          } else {
            return <Input placeholder={placeholder} {...field} />;
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
          </FormItem>
        );
      }}
    />
  );
};

export default FormTextField;
