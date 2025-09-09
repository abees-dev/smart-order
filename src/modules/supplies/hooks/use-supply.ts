import { useState, useEffect, useCallback } from "react";
import type { DocumentSnapshot } from "firebase/firestore";
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

export function useSupplies(initialFilters: SupplyFilters = {}) {
  const [state, setState] = useState<SupplyListState>({
    supplies: [],
    loading: false,
    error: null,
    hasMore: false,
    total: 0,
  });
  const [filters, setFilters] = useState<SupplyFilters>(initialFilters);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();

  const fetchSupplies = useCallback(
    async (reset = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const docToUse = reset ? undefined : lastDoc;
        const {
          supplies,
          hasMore,
          lastDoc: newLastDoc,
        } = await SupplyService.getAllSupplies(filters, 10, docToUse);

        setState((prev) => ({
          ...prev,
          supplies: reset ? supplies : [...prev.supplies, ...supplies],
          hasMore,
          total: reset ? supplies.length : prev.total + supplies.length,
          loading: false,
        }));

        setLastDoc(newLastDoc);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
          loading: false,
        }));
      }
    },
    [filters, lastDoc]
  );

  const refreshSupplies = useCallback(() => {
    setLastDoc(undefined);
    fetchSupplies(true);
  }, [fetchSupplies]);

  const loadMoreSupplies = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchSupplies(false);
    }
  }, [fetchSupplies, state.hasMore, state.loading]);

  const updateFilters = useCallback((newFilters: SupplyFilters) => {
    setFilters(newFilters);
    setLastDoc(undefined);
  }, []);

  useEffect(() => {
    refreshSupplies();
  }, [filters]);

  return {
    ...state,
    filters,
    updateFilters,
    refreshSupplies,
    loadMoreSupplies,
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
