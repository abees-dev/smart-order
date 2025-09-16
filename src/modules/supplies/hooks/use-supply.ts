import { useState, useEffect, useCallback } from "react";
import type { DocumentSnapshot } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupplyService } from "../services/supply.service";
import type {
  Supply,
  SupplyFilters,
  SupplyFormState,
  CreateSupplyData,
  UpdateSupplyData,
  StockMovement,
  CreateStockMovementData,
  SupplyImport,
  CreateSupplyImportData,
  SupplyImportFilters,
} from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiResponsePagination } from "@/types/response";

export function useSupplies(filters: SupplyFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["supplies", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      SupplyService.getAllSupplies({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Supply[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    supplies: data ? data.pages.flatMap((page) => page.contents) : [],
    pagination:
      data?.pages?.[data.pages.length - 1]?.pagination ||
      ({
        page: 1,
        pageSize: 10,
        total: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
      } as const),
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    loading: isFetching,
    refetchSupplies: refetch,
    error: error?.message || null,
  };
}

export function useSupply(id?: string) {
  const [supply, setSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupply = useCallback(async (supplyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const supplyData = await SupplyService.getSupplyById(supplyId);
      setSupply(supplyData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchSupply(id);
    }
  }, [id, fetchSupply]);

  return {
    supply,
    loading,
    error,
    refetch: id ? () => fetchSupply(id) : undefined,
  };
}

export function useSupplyImports(
  initialFilters: SupplyImportFilters = {},
  pageSize = 10
) {
  const isMobile = useIsMobile();

  const [state, setState] = useState({
    imports: [] as SupplyImport[],
    loading: true,
    error: null as string | null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<SupplyImportFilters>(initialFilters);

  const loadImports = useCallback(
    async (reset = false, targetPage = 1) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        let result;

        if (isMobile) {
          // Mobile: Use infinite loading with Firestore pagination
          result = await SupplyService.getAllSupplyImports(
            filters,
            pageSize,
            reset ? undefined : lastDoc || undefined
          );
        } else {
          // Desktop: Use traditional pagination
          result = await SupplyService.getSupplyImportsWithPagination(
            filters,
            pageSize,
            targetPage
          );
        }

        const imports = result.imports;
        const newHasMore = result.hasMore;
        const newLastDoc = result.lastDoc;
        const newTotal =
          "total" in result ? (result.total as number) : undefined;

        setState((prev) => ({
          ...prev,
          imports: isMobile && !reset ? [...prev.imports, ...imports] : imports,
          loading: false,
          total:
            newTotal !== undefined
              ? newTotal
              : reset
              ? imports.length
              : prev.total + imports.length,
          page: isMobile ? (reset ? 1 : prev.page + 1) : targetPage,
          hasMore: newHasMore,
        }));

        setHasMore(newHasMore);
        setLastDoc(newLastDoc || null);

        return { success: true };
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }));

        return { success: false, error };
      }
    },
    [filters, pageSize, lastDoc, isMobile]
  );

  const refreshImports = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadImports(true, 1);
  }, [loadImports]);

  const loadMore = useCallback(async () => {
    if (!state.loading && hasMore && isMobile && !loadingMore) {
      setLoadingMore(true);
      try {
        await loadImports(false);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [state.loading, hasMore, isMobile, loadingMore, loadImports]);

  const changePage = useCallback(
    async (newPage: number) => {
      if (!isMobile) {
        await loadImports(true, newPage);
      }
    },
    [isMobile, loadImports]
  );

  const updateFilters = useCallback((newFilters: SupplyImportFilters) => {
    setFilters(newFilters);
    setLastDoc(null);
    setHasMore(true);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLastDoc(null);
      setHasMore(true);

      try {
        let result;

        if (isMobile) {
          result = await SupplyService.getAllSupplyImports(filters, pageSize);
        } else {
          result = await SupplyService.getSupplyImportsWithPagination(
            filters,
            pageSize,
            1
          );
        }

        const { imports, hasMore: newHasMore, lastDoc: newLastDoc } = result;
        const total =
          "total" in result ? (result.total as number) : imports.length;

        setState({
          imports,
          loading: false,
          error: null,
          total,
          page: 1,
          pageSize,
          hasMore: newHasMore,
        });

        setHasMore(newHasMore);
        setLastDoc(newLastDoc || null);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }));
      }
    };

    loadData();
  }, [filters, pageSize, isMobile]);

  return {
    imports: state.imports,
    loading: state.loading,
    error: state.error,
    hasMore,
    filters,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    loadingMore,
    isMobile,
    updateFilters,
    refreshImports,
    loadMore,
    changePage,
  };
}

export function useSupplyImportActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createImport = useCallback(async (data: CreateSupplyImportData) => {
    setLoading(true);
    setError(null);

    try {
      const id = await SupplyService.createSupplyImport(data);
      setLoading(false);
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  const completeImport = useCallback(async (importId: string) => {
    setLoading(true);
    setError(null);

    try {
      await SupplyService.completeSupplyImport(importId);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  const updateImport = useCallback(
    async (importId: string, data: CreateSupplyImportData) => {
      setLoading(true);
      setError(null);

      try {
        await SupplyService.updateSupplyImport(importId, data);
        setLoading(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Đã có lỗi xảy ra";
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const cancelImport = useCallback(async (importId: string) => {
    setLoading(true);
    setError(null);

    try {
      await SupplyService.cancelSupplyImport(importId);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return {
    loading,
    error,
    createImport,
    updateImport,
    completeImport,
    cancelImport,
  };
}

export function useSupplyImportById(importId: string) {
  const [importRecord, setImportRecord] = useState<SupplyImport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImportRecord = useCallback(async () => {
    if (!importId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const record = await SupplyService.getSupplyImportById(importId);
      setImportRecord(record);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không tìm thấy phiếu nhập hàng";
      setError(errorMessage);
      setImportRecord(null);
    } finally {
      setLoading(false);
    }
  }, [importId]);

  useEffect(() => {
    fetchImportRecord();
  }, [fetchImportRecord]);

  const refetch = useCallback(() => {
    fetchImportRecord();
  }, [fetchImportRecord]);

  return {
    importRecord,
    loading,
    error,
    refetch,
  };
}
