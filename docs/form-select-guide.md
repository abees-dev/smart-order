# FormSelect Component

A reusable form select component built on top of SelectSearch that can be used throughout the application.

## Features

- ✅ Generic options interface with TypeScript support
- ✅ Custom option rendering
- ✅ React Hook Form integration
- ✅ Loading states
- ✅ Vietnamese i18n support
- ✅ Error handling and validation
- ✅ Required field indicator
- ✅ Search functionality
- ✅ Disabled options support

## Basic Usage

```tsx
import { FormSelect, type SelectOption } from "@/components/forms";

const options: SelectOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3", disabled: true },
];

function MyComponent() {
  const [value, setValue] = useState("");

  return (
    <FormSelect
      options={options}
      value={value}
      onValueChange={setValue}
      label="Choose an option"
      placeholder="Select..."
      required
    />
  );
}
```

## With React Hook Form

```tsx
import { FormSelectField } from "@/components/forms";
import { Controller } from "react-hook-form";

function MyForm() {
  const { control } = useForm();

  return (
    <Controller
      control={control}
      name="myField"
      render={({ field, fieldState }) => (
        <FormSelectField
          field={field}
          fieldState={fieldState}
          options={options}
          label="My Field"
          required
        />
      )}
    />
  );
}
```

## Advanced Usage with Custom Rendering

```tsx
const advancedOptions: SelectOption[] = [
  {
    value: "premium",
    label: "Premium Plan",
    description: "All features included",
    metadata: { price: 99, popular: true },
  },
  {
    value: "basic",
    label: "Basic Plan",
    description: "Essential features only",
    metadata: { price: 29, popular: false },
  },
];

<FormSelect
  options={advancedOptions}
  renderOption={(option) => (
    <div className="flex justify-between items-start w-full">
      <div>
        <div className="font-medium">{option.label}</div>
        <div className="text-sm text-muted-foreground">
          {option.description}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold">${option.metadata?.price}</div>
        {option.metadata?.popular && (
          <span className="text-xs bg-primary text-primary-foreground px-1 rounded">
            Popular
          </span>
        )}
      </div>
    </div>
  )}
/>;
```

## Props

### FormSelect Props

| Prop                | Type                                  | Default                     | Description                     |
| ------------------- | ------------------------------------- | --------------------------- | ------------------------------- |
| `options`           | `SelectOption[]`                      | **Required**                | Array of options to display     |
| `value`             | `string`                              | `undefined`                 | Currently selected value        |
| `onValueChange`     | `(value: string) => void`             | `undefined`                 | Callback when selection changes |
| `label`             | `string`                              | `undefined`                 | Field label                     |
| `placeholder`       | `string`                              | `"Chọn tùy chọn..."`        | Placeholder text                |
| `searchPlaceholder` | `string`                              | `"Tìm kiếm..."`             | Search input placeholder        |
| `emptyMessage`      | `string`                              | `"Không tìm thấy kết quả."` | Message when no options match   |
| `required`          | `boolean`                             | `false`                     | Show required indicator         |
| `disabled`          | `boolean`                             | `false`                     | Disable the select              |
| `loading`           | `boolean`                             | `false`                     | Show loading state              |
| `className`         | `string`                              | `undefined`                 | Additional CSS classes          |
| `error`             | `string`                              | `undefined`                 | Error message to display        |
| `renderOption`      | `(option: SelectOption) => ReactNode` | Default renderer            | Custom option renderer          |

### SelectOption Interface

```tsx
interface SelectOption {
  value: string; // Unique identifier
  label: string; // Display text
  disabled?: boolean; // Disable this option
  description?: string; // Additional description
  metadata?: Record<string, unknown>; // Custom data for rendering
}
```

## Examples in Codebase

- **SupplyCategorySelect**: Uses static categories from supply-category.ts
- **SupplierSelect**: Uses async data loading with suppliers service

## Migration Guide

To migrate existing select components to use FormSelect:

1. Convert your data to `SelectOption[]` format
2. Replace custom select logic with `FormSelect` component
3. Move custom rendering to `renderOption` prop
4. Update props to match FormSelect interface
