/* eslint-disable @typescript-eslint/no-explicit-any */
import FilterAction, { type FilterValues } from "@/components/FilterAction";
import { Badge } from "@/components/ui";
import { Search } from "lucide-react";
import { useCallback } from "react";
import { debounce } from "lodash";
import type { DateRange } from "react-day-picker";
import type { DebtFilters } from "../../types";

const typeOptions = [
  {
    value: "sales",
    label: "Bán hàng",
    render: () => (
      <Badge variant="outline" color="info">
        Bán hàng
      </Badge>
    ),
  },
  {
    value: "purchase",
    label: "Mua hàng",
    render: () => (
      <Badge variant="outline" color="warning">
        Mua hàng
      </Badge>
    ),
  },
];

const DebtFilter = ({
  onFiltersChange,
  filters,
}: {
  onFiltersChange: (filters: DebtFilters) => void;
  filters: DebtFilters;
}) => {
  const debounceFiltersChange = useCallback(
    debounce((filters: DebtFilters) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onFiltersChange && onFiltersChange(filters);
    }, 500),
    []
  );

  const handleFilterChange = useCallback((filter: FilterValues) => {
    const newFilter = { ...filter };
    const dateRange = filter.dateRange as DateRange;
    if (dateRange) {
      newFilter.dueDateFrom = dateRange.from ? dateRange.from : undefined;
      newFilter.dueDateTo = dateRange.to ? dateRange.to : undefined;
      delete newFilter.dateRange;
    }
    debounceFiltersChange(newFilter);
  }, []);

  const convertFilterValues = (filter: DebtFilters) => {
    if (!filter) return {};
    const newFilter: any = { ...filter };
    const dueDateFrom = filter.dueDateFrom;
    const dueDateTo = filter.dueDateTo;
    if (dueDateFrom || dueDateTo) {
      newFilter.dateRange = {
        from: dueDateFrom ? new Date(dueDateFrom) : undefined,
        to: dueDateTo ? new Date(dueDateTo) : undefined,
      };
      delete newFilter.dueDateFrom;
      delete newFilter.dueDateTo;
    }
    return newFilter;
  };

  return (
    <FilterAction
      config={{
        fields: [
          {
            key: "search",
            type: "text",
            placeholder: "Tìm kiếm công nợ",
            hideLabel: true,
            icon: <Search className="h-4 w-4" />,
            defaultValue: filters.search || "",
          },
          {
            key: "type",
            type: "select",
            label: "Loại",
            placeholder: "Chọn loại",
            hideLabel: true,
            options: typeOptions,
            defaultValue: filters.type || "",
          },
          // {
          //   key: "dateRange",
          //   type: "dateRange",
          //   label: "Ngày đến hạn",
          //   placeholder: "Chọn khoảng thời gian",
          //   hideLabel: true,
          //   defaultValue: filters.dueDateFrom
          //     ? {
          //         from: new Date(filters.dueDateFrom),
          //         to: filters.dueDateTo
          //           ? new Date(filters.dueDateTo)
          //           : undefined,
          //       }
          //     : undefined,
          // },
        ],
        compactMode: true,
        layout: "inline",
      }}
      values={convertFilterValues(filters) || {}}
      onFiltersChange={handleFilterChange}
    />
  );
};

export default DebtFilter;
