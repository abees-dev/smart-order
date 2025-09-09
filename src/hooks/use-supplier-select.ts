import { useState, useCallback, useEffect, useMemo } from "react";
import { useSuppliers } from "@/modules/suppliers";
import type { Supplier, SupplierFilters } from "@/modules/suppliers";

export interface UseSupplierSelectOptions {
  initialFilters?: SupplierFilters;
  pageSize?: number;
  activeOnly?: boolean;
}

export interface UseSupplierSelectReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSupplier: Supplier | undefined;
  selectSupplier: (supplierId: string) => void;
  clearSelection: () => void;
  refreshSuppliers: () => void;
}

export function useSupplierSelect(
  selectedSupplierId?: string,
  options: UseSupplierSelectOptions = {}
): UseSupplierSelectReturn {
  const {
    initialFilters = {},
    pageSize = 50, // Higher limit for select dropdown
    activeOnly = true,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(selectedSupplierId);

  // Update selectedId when selectedSupplierId prop changes
  useEffect(() => {
    setSelectedId(selectedSupplierId);
  }, [selectedSupplierId]);

  // Memoize setSearchTerm to prevent infinite loops
  const memoizedSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Build filters - memoize to prevent unnecessary re-renders
  const filters: SupplierFilters = useMemo(
    () => ({
      ...initialFilters,
      search: searchTerm || undefined,
      ...(activeOnly && { isActive: true }),
    }),
    [initialFilters, searchTerm, activeOnly]
  );

  // Fetch suppliers
  const { suppliers, loading, error, refreshSuppliers } = useSuppliers(
    filters,
    pageSize
  );

  // Find selected supplier
  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === selectedId
  );

  const selectSupplier = useCallback((supplierId: string) => {
    setSelectedId(supplierId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(undefined);
  }, []);

  return {
    suppliers,
    loading,
    error,
    searchTerm,
    setSearchTerm: memoizedSetSearchTerm,
    selectedSupplier,
    selectSupplier,
    clearSelection,
    refreshSuppliers,
  };
}
