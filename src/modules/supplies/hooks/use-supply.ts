import { useState, useEffect, useCallback } from "react";
import type { DocumentSnapshot } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupplyService } from "../services/supply.service";
import type {
  Supply,
  SupplyFilters,
  SupplyListState,
  SupplyFormState,
  CreateSupplyData,
  UpdateSupplyData,
  StockMovement,
  CreateStockMovementData,
  SupplyImport,
  CreateSupplyImportData,
  SupplyImportFilters,
} from "../types";

export function useSupplies(initialFilters: SupplyFilters = {}, pageSize = 10) {
  const isMobile = useIsMobile();

  const [state, setState] = useState<SupplyListState>({
    supplies: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadSupplies = useCallback(
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
          result = await SupplyService.getAllSupplies(
            initialFilters,
            pageSize,
            reset ? undefined : lastDoc || undefined
          );
        } else {
          // Desktop: Use traditional pagination
          result = await SupplyService.getSuppliesWithPagination(
            initialFilters,
            pageSize,
            targetPage
          );
        }

        const supplies = result.supplies;
        const newHasMore = result.hasMore;
        const newLastDoc = result.lastDoc;
        const newTotal =
          "total" in result ? (result.total as number) : undefined;

        setState((prev) => ({
          ...prev,
          supplies:
            isMobile && !reset ? [...prev.supplies, ...supplies] : supplies,
          loading: false,
          total:
            newTotal !== undefined
              ? newTotal
              : reset
              ? supplies.length
              : prev.total + supplies.length,
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
    [initialFilters, pageSize, lastDoc, isMobile]
  );

  const refreshSupplies = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadSupplies(true, 1);
  }, [loadSupplies]);

  const loadMore = useCallback(async () => {
    if (!state.loading && hasMore && isMobile && !loadingMore) {
      setLoadingMore(true);
      try {
        await loadSupplies(false);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [state.loading, hasMore, isMobile, loadingMore, loadSupplies]);

  const changePage = useCallback(
    async (newPage: number) => {
      if (!isMobile) {
        await loadSupplies(true, newPage);
      }
    },
    [isMobile, loadSupplies]
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLastDoc(null);
      setHasMore(true);

      try {
        let result;

        if (isMobile) {
          result = await SupplyService.getAllSupplies(initialFilters, pageSize);
        } else {
          result = await SupplyService.getSuppliesWithPagination(
            initialFilters,
            pageSize,
            1
          );
        }

        const { supplies, hasMore: newHasMore, lastDoc: newLastDoc } = result;
        const total =
          "total" in result ? (result.total as number) : supplies.length;

        setState({
          supplies,
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
  }, [JSON.stringify(initialFilters), pageSize, isMobile]);

  return {
    ...state,
    hasMore,
    loadMore,
    refreshSupplies,
    changePage,
    isMobile,
    loadingMore,
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

export function useSupplyActions() {
  const [state, setState] = useState<SupplyFormState>({
    loading: false,
    error: null,
  });

  const createSupply = useCallback(async (data: CreateSupplyData) => {
    setState({ loading: true, error: null });

    try {
      const id = await SupplyService.createSupply(data);
      setState({ loading: false, error: null });
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const updateSupply = useCallback(
    async (id: string, data: UpdateSupplyData) => {
      setState({ loading: true, error: null });

      try {
        await SupplyService.updateSupply(id, data);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Đã có lỗi xảy ra";
        setState({ loading: false, error: errorMessage });
        throw error;
      }
    },
    []
  );

  const deleteSupply = useCallback(async (id: string) => {
    setState({ loading: true, error: null });

    try {
      await SupplyService.deleteSupply(id);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    createSupply,
    updateSupply,
    deleteSupply,
  };
}

export function useSupplySearch() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const categoriesData = await SupplyService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    categories,
    loading,
    error,
    refetch: fetchOptions,
  };
}

export function useStockMovements(supplyId?: string) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();

  const fetchMovements = useCallback(
    async (reset = false) => {
      if (!supplyId) return;

      setLoading(true);
      setError(null);

      try {
        const docToUse = reset ? undefined : lastDoc;
        const {
          movements: newMovements,
          hasMore: newHasMore,
          lastDoc: newLastDoc,
        } = await SupplyService.getStockMovements(supplyId, 10, docToUse);

        setMovements((prev) =>
          reset ? newMovements : [...prev, ...newMovements]
        );
        setHasMore(newHasMore);
        setLastDoc(newLastDoc);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
    [supplyId, lastDoc]
  );

  const refreshMovements = useCallback(() => {
    setLastDoc(undefined);
    fetchMovements(true);
  }, [fetchMovements]);

  const loadMoreMovements = useCallback(() => {
    if (hasMore && !loading) {
      fetchMovements(false);
    }
  }, [fetchMovements, hasMore, loading]);

  useEffect(() => {
    if (supplyId) {
      refreshMovements();
    }
  }, [supplyId]);

  return {
    movements,
    loading,
    error,
    hasMore,
    refreshMovements,
    loadMoreMovements,
  };
}

export function useStockActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStockMovement = useCallback(
    async (data: CreateStockMovementData) => {
      setLoading(true);
      setError(null);

      try {
        const id = await SupplyService.addStockMovement(data);
        setLoading(false);
        return id;
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

  return {
    loading,
    error,
    addStockMovement,
  };
}

export function useSupplyImports(initialFilters: SupplyImportFilters = {}) {
  const [imports, setImports] = useState<SupplyImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<SupplyImportFilters>(initialFilters);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();

  const fetchImports = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);

      try {
        const docToUse = reset ? undefined : lastDoc;
        const {
          imports: newImports,
          hasMore: newHasMore,
          lastDoc: newLastDoc,
        } = await SupplyService.getAllSupplyImports(filters, 10, docToUse);

        setImports((prev) => (reset ? newImports : [...prev, ...newImports]));
        setHasMore(newHasMore);
        setLastDoc(newLastDoc);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
    [filters, lastDoc]
  );

  const refreshImports = useCallback(() => {
    setLastDoc(undefined);
    fetchImports(true);
  }, [fetchImports]);

  const loadMoreImports = useCallback(() => {
    if (hasMore && !loading) {
      fetchImports(false);
    }
  }, [fetchImports, hasMore, loading]);

  const updateFilters = useCallback((newFilters: SupplyImportFilters) => {
    setFilters(newFilters);
    setLastDoc(undefined);
  }, []);

  useEffect(() => {
    refreshImports();
  }, [filters]);

  return {
    imports,
    loading,
    error,
    hasMore,
    filters,
    updateFilters,
    refreshImports,
    loadMoreImports,
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
