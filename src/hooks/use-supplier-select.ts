import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(
    () => options,
    [
      options.pageSize,
      options.activeOnly,
      options.initialFilters?.search,
      options.initialFilters?.city,
      options.initialFilters?.country,
      options.initialFilters?.isActive,
    ]
  );

  const {
    initialFilters = {},
    pageSize = 50, // Higher limit for select dropdown
    activeOnly = true,
  } = memoizedOptions;

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

  // Memoize initialFilters to ensure stable reference
  const memoizedInitialFilters = useMemo(
    () => initialFilters,
    [
      initialFilters.search,
      initialFilters.city,
      initialFilters.country,
      initialFilters.isActive,
    ]
  );

  // Build filters - memoize to prevent unnecessary re-renders
  const filters: SupplierFilters = useMemo(
    () => ({
      ...memoizedInitialFilters,
      search: searchTerm || undefined,
      ...(activeOnly && { isActive: true }),
    }),
    [memoizedInitialFilters, searchTerm, activeOnly]
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
  const fetchedIdsRef = useRef<Set<string>>(new Set());
  const isFetchingRef = useRef(false);

  // Use a ref to store the previous supplier IDs key to detect changes
  const prevIdsKeyRef = useRef<string>("");

  // Create a stable key from supplier IDs
  const currentIdsKey = useMemo(() => {
    const ids = supplierIds.filter((id): id is string => !!id);
    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds.sort().join(",");
  }, [supplierIds]);

  const fetchSuppliers = useCallback(async (idsToFetch: string[]) => {
    if (idsToFetch.length === 0 || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const fetchedSuppliers = await SupplierService.getSuppliersByIds(
        idsToFetch
      );

      setSuppliers((prev) => {
        const newSuppliers = { ...prev };
        fetchedSuppliers.forEach((supplier) => {
          newSuppliers[supplier.id] = supplier;
          fetchedIdsRef.current.add(supplier.id);
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
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only proceed if the IDs have actually changed
    if (prevIdsKeyRef.current === currentIdsKey) {
      return;
    }

    prevIdsKeyRef.current = currentIdsKey;

    // Parse the current IDs
    const currentIds = currentIdsKey
      ? currentIdsKey.split(",").filter(Boolean)
      : [];

    if (currentIds.length === 0) {
      setSuppliers({});
      fetchedIdsRef.current.clear();
      return;
    }

    // Only fetch IDs we haven't fetched before
    const missingIds = currentIds.filter(
      (id) => !fetchedIdsRef.current.has(id)
    );
    if (missingIds.length > 0) {
      fetchSuppliers(missingIds);
    }
  });

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
