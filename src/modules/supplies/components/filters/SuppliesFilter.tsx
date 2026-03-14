import FilterAction, { type FilterValues } from '@/components/FilterAction';
import { Search } from 'lucide-react';
import type { SupplyImportFilters } from '../../types';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import type { DateRange } from 'react-day-picker';

const SuppliesFilter = ({
  onFiltersChange,
  filterValues,
}: {
  onFiltersChange: (filters: SupplyImportFilters) => void;
  filterValues?: SupplyImportFilters;
}) => {
  const debounceFiltersChange = useCallback(
    debounce((filters: SupplyImportFilters) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onFiltersChange && onFiltersChange(filters);
    }, 500),
    [],
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

  const convertFilterValues = (filter: SupplyImportFilters) => {
    if (!filter) return {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newFilter: any = { ...filter };
    const dateFrom = filter.dateFrom;
    const dateTo = filter.dateTo;
    if (dateFrom || dateTo) {
      newFilter.dateRange = {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      };
      delete newFilter.dateFrom;
      delete newFilter.dateTo;
    }
    return newFilter;
  };

  return (
    <FilterAction
      config={{
        fields: [
          {
            key: 'search',
            type: 'text',
            placeholder: 'Tìm kiếm vật tư',
            hideLabel: true,
            icon: <Search className="h-4 w-4" />,
          },
          {
            key: 'outOfStock',
            type: 'select',
            placeholder: 'Tình trạng',
            hideLabel: true,
            options: [
              { label: 'Tất cả', value: 'all' },
              { label: 'Còn hàng', value: 'inStock' },
              { label: 'Hết hàng', value: 'outOfStock' },
            ],
          },
        ],
        compactMode: true,
        layout: 'inline',
      }}
      values={convertFilterValues(filterValues || {})}
      onFiltersChange={handleFilterChange}
    />
  );
};

export default SuppliesFilter;
