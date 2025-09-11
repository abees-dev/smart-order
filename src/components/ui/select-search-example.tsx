import React from "react";
import { SelectSearch } from "@/components/ui/select-search";
import type { SelectSearchOption } from "@/components/ui/select-search";

// Example usage of SelectSearch component
export function SelectSearchExample() {
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  // Sample data
  const options: SelectSearchOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "date", label: "Date" },
    { value: "elderberry", label: "Elderberry" },
    { value: "fig", label: "Fig" },
    { value: "grape", label: "Grape" },
    { value: "honeydew", label: "Honeydew" },
    { value: "kiwi", label: "Kiwi", disabled: true },
    { value: "lemon", label: "Lemon" },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Inline Search Select:</label>
        <SelectSearch
          options={options}
          value={selectedValue}
          onValueChange={setSelectedValue}
          placeholder="Type to search or click to browse..."
          searchPlaceholder="Search fruits..."
          emptyMessage="No fruits found."
          clearable
        />
        <p className="text-xs text-muted-foreground">
          Click on the input to open dropdown, or start typing to search
        </p>
      </div>

      {selectedValue && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          Selected:{" "}
          <strong>
            {options.find((opt) => opt.value === selectedValue)?.label}
          </strong>
        </div>
      )}

      {/* Different sizes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Small size:</label>
        <SelectSearch
          options={options.slice(0, 5)}
          placeholder="Type to search..."
          searchPlaceholder="Search..."
          size="sm"
        />
      </div>

      {/* Loading state */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Loading state:</label>
        <SelectSearch options={[]} placeholder="Loading..." loading disabled />
      </div>

      {/* Non-clearable */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Non-clearable:</label>
        <SelectSearch
          options={options.slice(0, 4)}
          placeholder="Cannot clear selection..."
          clearable={false}
        />
      </div>
    </div>
  );
}

export default SelectSearchExample;
