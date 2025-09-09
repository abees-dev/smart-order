# Supplier Selection Components

## Overview

This project includes reusable supplier selection components that integrate with the suppliers module and provide a rich user interface for selecting suppliers in forms.

## Components

### 1. `SupplierSelect`

A standalone supplier selection component that can be used anywhere in the application.

**Features:**

- Search functionality with real-time filtering
- Display supplier information (name, email, phone, location)
- Support for creating new suppliers
- Loading states and error handling
- Fully customizable appearance

**Props:**

```typescript
interface SupplierSelectProps {
  value?: string; // Selected supplier ID
  onValueChange?: (value: string) => void; // Callback when selection changes
  label?: string; // Field label
  placeholder?: string; // Placeholder text
  required?: boolean; // Whether field is required
  disabled?: boolean; // Whether field is disabled
  className?: string; // Additional CSS classes
  allowCreate?: boolean; // Show "create new" button
  onCreateNew?: () => void; // Callback for create new button
  error?: string; // Error message to display
}
```

**Usage:**

```tsx
import { SupplierSelect } from "@/components/forms";

function MyComponent() {
  const [supplierId, setSupplierId] = useState("");

  return (
    <SupplierSelect
      label="Nhà cung cấp"
      placeholder="Chọn nhà cung cấp"
      value={supplierId}
      onValueChange={setSupplierId}
      required
      allowCreate
      onCreateNew={() => {
        // Open supplier creation dialog
      }}
    />
  );
}
```

### 2. `SupplierSelectField`

A wrapper component designed for use with React Hook Form.

**Usage:**

```tsx
import { useForm } from "react-hook-form";
import { SupplierSelectField } from "@/components/forms";

function MyForm() {
  const form = useForm({
    defaultValues: {
      supplierId: "",
    },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="supplierId"
        render={({ field, fieldState }) => (
          <SupplierSelectField
            field={field}
            fieldState={fieldState}
            label="Supplier"
            placeholder="Select a supplier"
            required
            allowCreate
            onCreateNew={() => {
              // Handle supplier creation
            }}
          />
        )}
      />
    </Form>
  );
}
```

### 3. `useSupplierSelect` Hook

A custom hook that provides supplier selection logic for advanced use cases.

**Returns:**

```typescript
interface UseSupplierSelectReturn {
  suppliers: Supplier[]; // List of suppliers
  loading: boolean; // Loading state
  error: string | null; // Error state
  searchTerm: string; // Current search term
  setSearchTerm: (term: string) => void; // Update search term
  selectedSupplier: Supplier | undefined; // Selected supplier object
  selectSupplier: (supplierId: string) => void; // Select a supplier
  clearSelection: () => void; // Clear selection
  refreshSuppliers: () => void; // Refresh supplier list
}
```

**Usage:**

```tsx
import { useSupplierSelect } from "@/hooks/use-supplier-select";

function CustomSupplierComponent() {
  const {
    suppliers,
    loading,
    searchTerm,
    setSearchTerm,
    selectedSupplier,
    selectSupplier,
  } = useSupplierSelect();

  // Custom implementation using the hook
}
```

## Integration Examples

### 1. Supply Form Integration

The supplier select component has been integrated into the supply form:

```tsx
// In supply-form-dialog.tsx
<FormField
  control={form.control}
  name="supplierId"
  render={({ field, fieldState }) => (
    <SupplierSelectField
      field={field}
      fieldState={fieldState}
      label="Nhà cung cấp"
      placeholder="Chọn nhà cung cấp"
      allowCreate
      onCreateNew={() => {
        // Open supplier creation dialog
      }}
    />
  )}
/>
```

### 2. Filter Components

Can be used in filter sheets for filtering by supplier:

```tsx
<SupplierSelect
  label="Filter by Supplier"
  placeholder="All suppliers"
  value={filters.supplierId}
  onValueChange={(value) => setFilters({ ...filters, supplierId: value })}
/>
```

## Data Structure Changes

The following data structures have been updated to use `supplierId` instead of `supplier` string:

### Supply Interface

```typescript
export interface Supply {
  // ... other fields
  supplierId?: string; // Changed from supplier?: string
}

export interface CreateSupplyData {
  // ... other fields
  supplierId?: string; // Changed from supplier?: string
}

export interface SupplyFilters {
  // ... other fields
  supplierId?: string; // Changed from supplier?: string
}
```

### Supply Import Interface

```typescript
export interface SupplyImport {
  // ... other fields
  supplierId: string; // Changed from supplier: string
}
```

## Migration Notes

If you have existing data with `supplier` as a string field, you'll need to:

1. **Database Migration**: Update existing documents to use `supplierId` field pointing to actual supplier document IDs
2. **Query Updates**: Update any queries that filter by the `supplier` field to use `supplierId`
3. **Form Updates**: Update forms to use the new `supplierId` field name

## Benefits

1. **Data Integrity**: Links to actual supplier documents instead of free-text strings
2. **Consistency**: Standardized supplier selection across the application
3. **User Experience**: Rich supplier information display and search
4. **Reusability**: Single component can be used in multiple forms
5. **Maintainability**: Centralized supplier selection logic

## Future Enhancements

- Add supplier avatar/logo display
- Support for multi-select (selecting multiple suppliers)
- Supplier categories/grouping
- Recent suppliers list
- Keyboard navigation improvements
- Better mobile responsive design
