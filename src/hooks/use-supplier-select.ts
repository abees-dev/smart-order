import { useState, useCallback, useEffect, useMemo } from "react";
import { useSuppliers } from "@/modules/suppliers";
import { SupplierService } from "@/modules/suppliers/services/supplier.service";
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

/**
 * Hook to get suppliers by their IDs
 * Useful for displaying supplier names in lists where you only have IDs
 */
export function useSuppliersByIds(supplierIds: (string | undefined)[]) {
  const [suppliers, setSuppliers] = useState<Record<string, Supplier>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get unique, non-undefined IDs
  const uniqueIds = useMemo(() => {
    const ids = supplierIds.filter((id): id is string => !!id);
    return Array.from(new Set(ids));
  }, [supplierIds]);

  const fetchSuppliers = useCallback(async () => {
    if (uniqueIds.length === 0) {
      setSuppliers({});
      return;
    }

    // Check if we already have all the suppliers
    const missingIds = uniqueIds.filter((id) => !suppliers[id]);
    if (missingIds.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedSuppliers = await SupplierService.getSuppliersByIds(
        missingIds
      );

      setSuppliers((prev) => {
        const newSuppliers = { ...prev };
        fetchedSuppliers.forEach((supplier) => {
          newSuppliers[supplier.id] = supplier;
        });
        return newSuppliers;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin nhà cung cấp"
      );
    } finally {
      setLoading(false);
    }
  }, [uniqueIds, suppliers]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Helper function to get supplier name by ID
  const getSupplierName = useCallback(
    (supplierId?: string) => {
      if (!supplierId) return "—";
      return suppliers[supplierId]?.name || "—";
    },
    [suppliers]
  );

  return {
    suppliers,
    loading,
    error,
    getSupplierName,
  };
}
