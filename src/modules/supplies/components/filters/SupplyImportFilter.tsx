import FilterAction, { type FilterValues } from "@/components/FilterAction";
import { Badge } from "@/components/ui";
import { Search } from "lucide-react";
import type { SupplyImportFilters } from "../../types";
import { useCallback } from "react";
import { debounce } from "lodash";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { SupplierService } from "@/modules/suppliers";

const statusOptions = [
  {
    value: "pending",
    label: "Đang chờ",
    render: () => (
      <Badge variant="outline" color="warning">
        Đang chờ
      </Badge>
    ),
  },
  {
    value: "warehouse",
    label: "Đã nhập kho",
    render: () => (
      <Badge variant="outline" color="info">
        Đã nhập kho
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

const SupplyImportFilter = ({
  onFiltersChange,
}: {
  onFiltersChange: (filters: SupplyImportFilters) => void;
}) => {
  const debounceFiltersChange = useCallback(
    debounce((filters: SupplyImportFilters) => {
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
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-selection"],
    queryFn: SupplierService.getAllSuppliersSelection,
  });

  return (
    <FilterAction
      config={{
        fields: [
          {
            key: "search",
            type: "text",
            placeholder: "Tìm kiếm phiếu nhập",
            hideLabel: true,
            icon: <Search className="h-4 w-4" />,
          },
          {
            key: "supplierId",
            type: "select",
            label: "Nhà cung cấp",
            placeholder: "Chọn nhà cung cấp",
            hideLabel: true,

            options:
              suppliers?.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
                render: () => <div className="text-sm">{supplier.name}</div>,
              })) || [],
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

export default SupplyImportFilter;
