# FilterAction Component

A dynamic, configurable filter component that supports multiple layouts and field types. Designed to be reusable across different pages and contexts in the smart-order application.

## Features

- **Multiple Layouts**: Inline, Sheet, Popover, and Auto (responsive)
- **Multiple Field Types**: Text, Select, Checkbox, Date, Number
- **Responsive Design**: Automatically adapts layout based on screen size
- **Active Filter Display**: Shows applied filters with removal options
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Mobile-First**: Optimized for mobile and desktop experiences

## Installation & Usage

```tsx
import FilterAction, {
  FilterConfig,
  FilterValues,
} from "@/components/FilterAction";
```

## Basic Example

```tsx
const filterConfig: FilterConfig = {
  fields: [
    {
      key: "search",
      type: "text",
      label: "Search",
      placeholder: "Search products...",
    },
    {
      key: "category",
      type: "select",
      label: "Category",
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
      ],
    },
    {
      key: "isActive",
      type: "checkbox",
      label: "Active only",
    },
  ],
  layout: "auto",
  title: "Product Filters",
};

function MyComponent() {
  const [filters, setFilters] = useState<FilterValues>({});

  return (
    <FilterAction
      config={filterConfig}
      values={filters}
      onFiltersChange={setFilters}
    />
  );
}
```

## Configuration Options

### FilterConfig

| Property             | Type                                         | Description                                 |
| -------------------- | -------------------------------------------- | ------------------------------------------- |
| `fields`             | `FilterField[]`                              | Array of filter field configurations        |
| `layout?`            | `"inline" \| "sheet" \| "popover" \| "auto"` | Layout mode                                 |
| `title?`             | `string`                                     | Title for sheet/popover layouts             |
| `description?`       | `string`                                     | Description for sheet layout                |
| `showActiveCount?`   | `boolean`                                    | Show count of active filters                |
| `showClearAll?`      | `boolean`                                    | Show clear all button                       |
| `compactMode?`       | `boolean`                                    | Use compact button display                  |
| `showActiveFilters?` | `boolean`                                    | Show active filters section (default: true) |

### FilterField

| Property                  | Type                                    | Description                                               |
| ------------------------- | --------------------------------------- | --------------------------------------------------------- |
| `key`                     | `string`                                | Unique identifier for the field                           |
| `type`                    | `FilterFieldType`                       | Field type (text, select, checkbox, etc.)                 |
| `label`                   | `string`                                | Display label                                             |
| `placeholder?`            | `string`                                | Placeholder text                                          |
| `searchPlaceholder?`      | `string`                                | Search placeholder for select fields                      |
| `emptyMessage?`           | `string`                                | Empty message for select fields                           |
| `clearable?`              | `boolean`                               | Whether select field is clearable                         |
| `showLabelInPlaceholder?` | `boolean`                               | Include label in placeholder (e.g., "Label: placeholder") |
| `hideLabel?`              | `boolean`                               | Hide the field label (useful for compact layouts)         |
| `options?`                | `Array<{value: string, label: string}>` | Options for select fields                                 |
| `defaultValue?`           | `any`                                   | Default value                                             |
| `validation?`             | `object`                                | Validation rules                                          |

## Field Types

### Text Field

```tsx
{
  key: "search",
  type: "text",
  label: "Search",
  placeholder: "Enter search term..."
}
```

**Enhanced with Label in Placeholder:**

```tsx
{
  key: "search",
  type: "text",
  label: "Search",
  placeholder: "product name, SKU, or keyword...",
  showLabelInPlaceholder: true // Shows: "Search: product name, SKU, or keyword..."
}
```

### Select Field

```tsx
{
  key: "category",
  type: "select",
  label: "Category",
  searchPlaceholder: "Search categories...",
  emptyMessage: "No categories found.",
  clearable: true,
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2", disabled: true }
  ]
}
```

**Select Field Features:**

- **Searchable**: Users can type to filter options
- **Clearable**: Include clear button to reset selection
- **Custom Messages**: Customize search placeholder and empty state
- **Disabled Options**: Mark options as disabled
- **Virtual Scrolling**: Handles large option lists efficiently
- **Label in Placeholder**: Use `showLabelInPlaceholder: true` to include field label

### Checkbox Field

```tsx
{
  key: "isActive",
  type: "checkbox",
  label: "Show active items only"
}
```

### Date Field

```tsx
{
  key: "createdDate",
  type: "date",
  label: "Created Date",
  placeholder: "Select date"
}
```

### Date Range Field

```tsx
{
  key: "dateRange",
  type: "dateRange",
  label: "Date Range",
  placeholder: "Select date range"
}
```

**Date Range Field Features:**

- **Dual Calendar View**: Shows two months for easy range selection
- **Apply/Cancel Actions**: User can review selection before applying
- **Vietnamese Locale**: Formatted dates in Vietnamese style (dd/MM/yyyy)
- **Flexible Selection**: Supports single date or full range
- **Clear Display**: Shows selected range in readable format

### Number Field

```tsx
{
  key: "minPrice",
  type: "number",
  label: "Minimum Price",
  validation: { min: 0, max: 10000 }
}
```

## Enhanced Labels & Placeholders

### Label Control Features

FilterAction provides flexible label control options to create the perfect user experience for your forms.

#### showLabelInPlaceholder Feature

The `showLabelInPlaceholder` option allows you to include the field label in the placeholder text, making it clearer for users to understand what each field is for.

#### hideLabel Feature

The `hideLabel` option allows you to hide the field label completely, creating compact and clean interfaces perfect for toolbars, search bars, or minimal forms.

**Basic Usage:**

```tsx
{
  key: "productName",
  type: "text",
  label: "Product Name",
  placeholder: "iPhone, Samsung Galaxy, etc...",
  showLabelInPlaceholder: true
}
// Results in placeholder: "Product Name: iPhone, Samsung Galaxy, etc..."
```

**Benefits:**

- **Clearer Context**: Users immediately understand what to enter
- **Better UX**: Especially useful in complex forms with many fields
- **Accessibility**: Helps screen readers provide better context
- **Consistency**: Maintains visual hierarchy while providing guidance

**Examples with Different Field Types:**

```tsx
// Text field with label in placeholder
{
  key: "customerSearch",
  type: "text",
  label: "Customer",
  placeholder: "name, email, or phone number...",
  showLabelInPlaceholder: true
  // Shows: "Customer: name, email, or phone number..."
}

// Select field with label in placeholder
{
  key: "orderStatus",
  type: "select",
  label: "Order Status",
  placeholder: "any status",
  searchPlaceholder: "status name...",
  showLabelInPlaceholder: true,
  // Shows: "Order Status: any status"
  // Search shows: "Order Status: status name..."
  options: [...]
}

// Number field with label in placeholder
{
  key: "minAmount",
  type: "number",
  label: "Minimum Amount",
  placeholder: "1000",
  showLabelInPlaceholder: true
  // Shows: "Minimum Amount: 1000"
}

// Date range with label in placeholder
{
  key: "salesPeriod",
  type: "dateRange",
  label: "Sales Period",
  placeholder: "last 30 days, this month, etc...",
  showLabelInPlaceholder: true
  // Shows: "Sales Period: last 30 days, this month, etc..."
}
```

### Hide Label Examples

**Compact Search Bar:**

```tsx
{
  key: "quickSearch",
  type: "text",
  label: "Search", // Still needed for accessibility
  placeholder: "🔍 Search products, orders, customers...",
  hideLabel: true // Creates clean, compact appearance
}
```

**Toolbar Filters:**

```tsx
{
  key: "status",
  type: "select",
  label: "Status Filter",
  placeholder: "📊 All Statuses",
  hideLabel: true,
  options: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" }
  ]
}
```

**Quick Actions:**

```tsx
{
  key: "dateRange",
  type: "dateRange",
  label: "Filter by Date",
  placeholder: "📅 Select date range",
  hideLabel: true
}
```

### Combining Label Features

**Maximum Clarity (Label + Label in Placeholder):**

```tsx
{
  key: "customerSearch",
  type: "text",
  label: "Customer Search",
  placeholder: "name, email, phone...",
  showLabelInPlaceholder: true,
  hideLabel: false // Default, shows both label and enhanced placeholder
  // Result: Label "Customer Search" + Placeholder "Customer Search: name, email, phone..."
}
```

**Compact with Context (Hidden Label + Label in Placeholder):**

```tsx
{
  key: "productFilter",
  type: "text",
  label: "Product Filter",
  placeholder: "SKU, name, category...",
  showLabelInPlaceholder: true,
  hideLabel: true
  // Result: No visible label + Placeholder "Product Filter: SKU, name, category..."
}
```

**Minimal Design (Hidden Label Only):**

```tsx
{
  key: "search",
  type: "text",
  label: "Search",
  placeholder: "🔍 Type to search...",
  hideLabel: true
  // Result: No visible label + Simple placeholder "🔍 Type to search..."
}
```

**Best Practices:**

**For showLabelInPlaceholder:**

- Use for complex forms where field purpose might be unclear
- Keep placeholder text concise when using labels
- Consider screen space - labels add extra text length
- Test with your actual content to ensure readability

**For hideLabel:**

- Perfect for toolbars, headers, and minimal interfaces
- Use descriptive placeholders since label is hidden
- Consider adding icons or emojis to placeholders for visual context
- Ensure accessibility - screen readers still use the label
- Great for quick search boxes and filter dropdowns

## Layout Types

### Inline Layout

Displays all filters directly in the UI. Best for desktop with few filters.

```tsx
{
  layout: "inline",
  showClearAll: true
}
```

### Sheet Layout

Opens filters in a slide-out panel. Great for mobile or many filters.

```tsx
{
  layout: "sheet",
  title: "Filter Options",
  description: "Use filters to narrow down results."
}
```

### Popover Layout

Shows filters in a compact popup. Good for desktop with moderate filters.

```tsx
{
  layout: "popover",
  title: "Filters"
}
```

### Auto Layout (Recommended)

Automatically chooses sheet for mobile, popover for desktop.

```tsx
{
  layout: "auto"; // Responsive layout selection
}
```

## Props

### FilterActionProps

| Prop              | Type                                | Default     | Description                  |
| ----------------- | ----------------------------------- | ----------- | ---------------------------- |
| `config`          | `FilterConfig`                      | -           | Filter configuration object  |
| `values`          | `FilterValues`                      | -           | Current filter values        |
| `onFiltersChange` | `(values: FilterValues) => void`    | -           | Callback when filters change |
| `className?`      | `string`                            | -           | Additional CSS classes       |
| `buttonVariant?`  | `"default" \| "outline" \| "ghost"` | `"outline"` | Button style variant         |
| `buttonSize?`     | `"sm" \| "default" \| "lg"`         | `"sm"`      | Button size                  |

## Integration with Existing Pages

### Using with PageHeader

```tsx
import { PageHeader } from "@/components/PageHeader";
import FilterAction from "@/components/FilterAction";

const filterActions = (
  <FilterAction
    config={filterConfig}
    values={filters}
    onFiltersChange={handleFiltersChange}
  />
);

return (
  <PageHeader
    title="Products"
    description="Manage your products"
    shouldCreateAction={true}
    onCreateAction={handleCreate}
    createActionLabel="Add Product"
    filterActions={filterActions}
  />
);
```

### Using with API Hooks

```tsx
function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({});

  const { products, loading, refetch } = useProducts(filters);

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters as ProductFilters);
    // API hook will automatically refetch with new filters
  };

  return (
    <div>
      <FilterAction
        config={productFilterConfig}
        values={filters}
        onFiltersChange={handleFiltersChange}
      />
      {/* Your table/list component */}
    </div>
  );
}
```

### Working with Date Range Values

```tsx
import type { DateRange } from "react-day-picker";

function TransactionPage() {
  const [filters, setFilters] = useState<FilterValues>({});

  const handleFiltersChange = (newFilters: FilterValues) => {
    // Handle date range values
    if (newFilters.dateRange) {
      const dateRange = newFilters.dateRange as DateRange;

      // Convert to API format if needed
      const apiFilters = {
        ...newFilters,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      // Use with your API
      fetchTransactions(apiFilters);
    }

    setFilters(newFilters);
  };

  return (
    <FilterAction
      config={transactionFilterConfig}
      values={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```

## Styling & Customization

The component uses your existing shadcn/ui components and follows your design system. You can customize:

- Button variants and sizes
- Layout behavior
- Field validation
- Custom field types (extend the component)

## Examples

See `FilterAction.example.tsx` for comprehensive examples including:

- Product filters with all field types (including date range)
- Order filters with inline layout and date range selection
- Customer filters with popover layout
- Supply filters with sheet layout
- Date range filter examples with transaction filtering
- Integration with list pages

## Best Practices

1. **Use Auto Layout** for responsive behavior
2. **Limit inline filters** to 4-5 fields max
3. **Group related filters** logically
4. **Provide clear labels** and placeholders
5. **Test on mobile devices** for usability

## TypeScript Support

All interfaces are exported for type safety:

```tsx
import {
  FilterConfig,
  FilterField,
  FilterValues,
  FilterFieldType,
  FilterLayout,
} from "@/components/FilterAction";
```
