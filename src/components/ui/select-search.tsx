import * as React from "react";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { PopoverPortal } from "@radix-ui/react-popover";
import { normalizeText } from "@/utils";

// Utility function to normalize text for searching

export interface SelectSearchOption {
  value: string;
  label: string;
  disabled?: boolean;
  renderOption?: (option: SelectSearchOption) => React.ReactNode;
}

export interface SelectSearchProps {
  options: SelectSearchOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
  clearable?: boolean;
  loading?: boolean;
}

export function SelectSearch({
  options = [],
  value,
  defaultValue,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  onValueChange,
  disabled = false,
  className,
  size = "default",
  clearable = true,
  loading = false,
  ...props
}: SelectSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState(
    value || defaultValue || ""
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Update search value to show selected option label when not open
  React.useEffect(() => {
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    if (!open && selectedOption) {
      setSearchValue(selectedOption.label);
    } else if (!open && !selectedValue) {
      setSearchValue("");
    }
  }, [open, selectedValue, options]);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (optionValue: string) => {
    const newValue = optionValue;
    const newSelectedOption = options.find(
      (option) => option.value === newValue
    );

    setSelectedValue(newValue);
    setSearchValue(newSelectedOption?.label || "");
    setOpen(false);
    onValueChange?.(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue("");
    setSearchValue("");
    onValueChange?.("");
  };

  const handleInputFocus = () => {
    if (!open) {
      // Clear search value when opening to allow search
      if (selectedValue) {
        setSearchValue("");
      }
    }
  };

  const handleInputClick = () => {
    if (!open) {
      if (selectedValue) {
        setSearchValue("");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // When closing, restore selected option label
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );
      setSearchValue(selectedOption?.label || "");
    }
    setOpen(newOpen);
  };

  const filteredOptions = options.filter((option) => {
    const normalizedLabel = normalizeText(option.label);
    const normalizedSearch = normalizeText(searchValue);
    return normalizedLabel.includes(normalizedSearch);
  });

  const displayValue = open ? searchValue : selectedOption?.label || "";
  const displayPlaceholder = open ? searchPlaceholder : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange} {...props}>
      <div className="relative w-full">
        <PopoverTrigger
          type="button"
          className="w-full truncate bg-transparent"
        >
          <Input
            ref={inputRef}
            value={displayValue}
            placeholder={displayPlaceholder}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
                setSearchValue((prev) => prev + " ");
              }
            }}
            disabled={disabled}
            className={cn(
              "pr-8 cursor-text text-left bg-transparent",
              size === "default" && "h-9",
              size === "sm" && "h-8",
              className,
              {
                "pr-12": clearable && selectedValue && !disabled,
              }
            )}
          />
        </PopoverTrigger>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          ) : (
            <div className="flex items-center gap-1">
              {clearable && selectedValue && !disabled && (
                <XIcon
                  className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer pointer-events-auto"
                  onClick={handleClear}
                />
              )}
              <ChevronDownIcon
                className="h-4 w-4 opacity-50 cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(!open);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <PopoverPortal>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1"
          align="start"
          side="bottom"
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          <div>
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer select-none rounded-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    option.disabled && "pointer-events-none opacity-50",
                    selectedValue === option.value &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  {option.renderOption ? (
                    <div>{option.renderOption(option)}</div>
                  ) : (
                    <div>
                      <CheckIcon
                        className={cn(
                          "h-4 w-4",
                          selectedValue === option.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}

export default SelectSearch;
