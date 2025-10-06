import FilterAction, { type FilterValues } from "@/components/FilterAction";
import { Badge } from "@/components/ui";
import { Search } from "lucide-react";
import { useCallback } from "react";
import { debounce } from "lodash";
import type { DateRange } from "react-day-picker";
import type { OrderFilters } from "../../types";

const statusOptions = [
  {
    value: "draft",
    label: "Nháp",
    render: () => (
      <Badge variant="outline" color="neutral">
        Nháp
      </Badge>
    ),
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
    render: () => (
      <Badge variant="outline" color="warning">
        Đã xác nhận
      </Badge>
    ),
  },
  {
    value: "exported",
    label: "Đã xuất kho",
    render: () => (
      <Badge variant="outline" color="info">
        Đã xuất kho
      </Badge>
    ),
  },
  {
    value: "completed",
    label: "Đã hoàn thành",
    render: () => (
      <Badge variant="outline" color="success">
        Đã hoàn thành
      </Badge>
    ),
  },
  {
    value: "cancelled",
    label: "Đã hủy",
    render: () => (
      <Badge variant="outline" color="error">
        Đã hủy
      </Badge>
    ),
  },
];

const OrderFilter = ({
  onFiltersChange,
}: {
  onFiltersChange: (filters: OrderFilters) => void;
}) => {
  const debounceFiltersChange = useCallback(
    debounce((filters: OrderFilters) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onFiltersChange && onFiltersChange(filters);
    }, 500),
    []
  );

  const handleFilterChange = useCallback((filter: FilterValues) => {
    const newFilter = { ...filter };
    const dateRange = filter.dateRange as DateRange;
    if (dateRange) {
      newFilter.dateFrom = dateRange.from
        ? dateRange.from.toISOString()
        : undefined;
      newFilter.dateTo = dateRange.to ? dateRange.to.toISOString() : undefined;
      delete newFilter.dateRange;
    }
    debounceFiltersChange(newFilter);
  }, []);

  return (
    <FilterAction
      config={{
        fields: [
          {
            key: "search",
            type: "text",
            placeholder: "Tìm kiếm đơn hàng",
            hideLabel: true,
            icon: <Search className="h-4 w-4" />,
          },
          {
            key: "status",
            type: "select",
            label: "Trạng thái",
            placeholder: "Chọn trạng thái",
            hideLabel: true,
            options: statusOptions,
          },
          {
            key: "dateRange",
            type: "dateRange",
            label: "Khoảng thời gian",
            placeholder: "Chọn khoảng thời gian",
            hideLabel: true,
          },
        ],
        compactMode: true,
        layout: "inline",
      }}
      values={{}}
      onFiltersChange={handleFilterChange}
    />
  );
};

export default OrderFilter;
