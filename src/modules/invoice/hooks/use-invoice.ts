import { useState, useEffect, useCallback, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { InvoiceService } from "../services/invoice.service";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  InvoiceFilters,
  InvoiceListState,
  InputInvoice,
  OutputInvoice,
  InvoiceStats,
  TaxSummary,
} from "../types";

// Hook for managing invoice list state
export function useInvoices(filters: InvoiceFilters = {}, pageSize = 10) {
  const [state, setState] = useState<InvoiceListState>({
    invoices: [],
    loading: true,
    error: null,
    hasMore: false,
    total: 0,
    page: 1,
    pageSize,
  });

  const loadInvoices = useCallback(
    async (reset = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await InvoiceService.getAllInvoices(filters, pageSize);

        setState((prev) => ({
          ...prev,
          invoices: reset
            ? result.invoices
            : [...prev.invoices, ...result.invoices],
          hasMore: result.hasMore,
          total: result.total,
          loading: false,
          page: reset ? 1 : prev.page + 1,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    },
    [filters, pageSize]
  );

  const refreshInvoices = useCallback(() => {
    loadInvoices(true);
  }, [loadInvoices]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadInvoices(false);
    }
  }, [state.loading, state.hasMore, loadInvoices]);

  useEffect(() => {
    refreshInvoices();
  }, [refreshInvoices]);

  return {
    state,
    refreshInvoices,
    loadMore,
    hasMore: state.hasMore,
  };
}

// Hook for input invoices with pagination (similar to products pattern)
export function useInputInvoicesWithPagination(
  filters: Omit<InvoiceFilters, "type"> = {},
  pageSize = 10
) {
  const isMobile = useIsMobile();
  const [state, setState] = useState({
    inputInvoices: [] as InputInvoice[],
    loading: true,
    error: null as string | null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
    loadingMore: false,
  });

  const [currentFilters, setCurrentFilters] = useState(filters);

  const loadInputInvoices = useCallback(
    async (page = 1, reset = false) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: reset,
          loadingMore: !reset,
          error: null,
        }));

        const result = await InvoiceService.getInputInvoicesWithPagination(
          currentFilters,
          page,
          pageSize
        );

        setState((prev) => ({
          ...prev,
          inputInvoices: reset
            ? result.inputInvoices
            : [...prev.inputInvoices, ...result.inputInvoices],
          total: result.total,
          page: result.page,
          hasMore: result.hasMore,
          loading: false,
          loadingMore: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    },
    [currentFilters, pageSize]
  );

  const refreshInputInvoices = useCallback(() => {
    loadInputInvoices(1, true);
  }, [loadInputInvoices]);

  const loadMore = useCallback(() => {
    if (!state.loading && !state.loadingMore && state.hasMore) {
      loadInputInvoices(state.page + 1, false);
    }
  }, [
    state.loading,
    state.loadingMore,
    state.hasMore,
    state.page,
    loadInputInvoices,
  ]);

  const changePage = useCallback(
    (newPage: number) => {
      loadInputInvoices(newPage, true);
    },
    [loadInputInvoices]
  );

  const updateFilters = useCallback(
    (newFilters: Omit<InvoiceFilters, "type">) => {
      setCurrentFilters(newFilters);
    },
    []
  );

  useEffect(() => {
    refreshInputInvoices();
  }, [refreshInputInvoices]);

  useEffect(() => {
    refreshInputInvoices();
  }, [currentFilters]);

  return {
    inputInvoices: state.inputInvoices,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    refreshInputInvoices,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    changePage,
    isMobile,
    loadingMore: state.loadingMore,
    filters: currentFilters,
    updateFilters,
  };
}

// Hook for output invoices with pagination (similar to products pattern)
export function useOutputInvoicesWithPagination(
  filters: Omit<InvoiceFilters, "type"> = {},
  pageSize = 10
) {
  const isMobile = useIsMobile();
  const [state, setState] = useState({
    outputInvoices: [] as OutputInvoice[],
    loading: true,
    error: null as string | null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
    loadingMore: false,
  });

  const [currentFilters, setCurrentFilters] = useState(filters);

  const loadOutputInvoices = useCallback(
    async (page = 1, reset = false) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: reset,
          loadingMore: !reset,
          error: null,
        }));

        const result = await InvoiceService.getOutputInvoicesWithPagination(
          currentFilters,
          page,
          pageSize
        );

        setState((prev) => ({
          ...prev,
          outputInvoices: reset
            ? result.outputInvoices
            : [...prev.outputInvoices, ...result.outputInvoices],
          total: result.total,
          page: result.page,
          hasMore: result.hasMore,
          loading: false,
          loadingMore: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    },
    [currentFilters, pageSize]
  );

  const refreshOutputInvoices = useCallback(() => {
    loadOutputInvoices(1, true);
  }, [loadOutputInvoices]);

  const loadMore = useCallback(() => {
    if (!state.loading && !state.loadingMore && state.hasMore) {
      loadOutputInvoices(state.page + 1, false);
    }
  }, [
    state.loading,
    state.loadingMore,
    state.hasMore,
    state.page,
    loadOutputInvoices,
  ]);

  const changePage = useCallback(
    (newPage: number) => {
      loadOutputInvoices(newPage, true);
    },
    [loadOutputInvoices]
  );

  const updateFilters = useCallback(
    (newFilters: Omit<InvoiceFilters, "type">) => {
      setCurrentFilters(newFilters);
    },
    []
  );

  useEffect(() => {
    refreshOutputInvoices();
  }, [refreshOutputInvoices]);

  useEffect(() => {
    refreshOutputInvoices();
  }, [currentFilters]);

  return {
    outputInvoices: state.outputInvoices,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    refreshOutputInvoices,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    changePage,
    isMobile,
    loadingMore: state.loadingMore,
    filters: currentFilters,
    updateFilters,
  };
}

// Hook for input invoices only
export function useInputInvoices(
  filters: Omit<InvoiceFilters, "type"> = {},
  pageSize = 10
) {
  const [state, setState] = useState<{
    invoices: InputInvoice[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;
  }>({
    invoices: [],
    loading: true,
    error: null,
    hasMore: false,
    total: 0,
  });

  const lastDocRef = useRef<DocumentSnapshot | undefined>(undefined);

  const loadInvoices = useCallback(
    async (reset = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await InvoiceService.getInputInvoices(
          filters,
          pageSize,
          reset ? undefined : lastDocRef.current
        );

        setState((prev) => ({
          ...prev,
          invoices: reset
            ? result.invoices
            : [...prev.invoices, ...result.invoices],
          hasMore: result.hasMore,
          total: reset
            ? result.invoices.length
            : prev.total + result.invoices.length,
          loading: false,
        }));

        lastDocRef.current = result.lastDoc;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    },
    [filters, pageSize]
  );

  const refreshInvoices = useCallback(() => {
    lastDocRef.current = undefined;
    loadInvoices(true);
  }, [loadInvoices]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadInvoices(false);
    }
  }, [state.loading, state.hasMore, loadInvoices]);

  useEffect(() => {
    refreshInvoices();
  }, [refreshInvoices]);

  return {
    state,
    refreshInvoices,
    loadMore,
    hasMore: state.hasMore,
  };
}

// Hook for output invoices only
export function useOutputInvoices(
  filters: Omit<InvoiceFilters, "type"> = {},
  pageSize = 10
) {
  const [state, setState] = useState<{
    invoices: OutputInvoice[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;
  }>({
    invoices: [],
    loading: true,
    error: null,
    hasMore: false,
    total: 0,
  });

  const lastDocRef = useRef<DocumentSnapshot | undefined>(undefined);

  const loadInvoices = useCallback(
    async (reset = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await InvoiceService.getOutputInvoices(
          filters,
          pageSize,
          reset ? undefined : lastDocRef.current
        );

        setState((prev) => ({
          ...prev,
          invoices: reset
            ? result.invoices
            : [...prev.invoices, ...result.invoices],
          hasMore: result.hasMore,
          total: reset
            ? result.invoices.length
            : prev.total + result.invoices.length,
          loading: false,
        }));

        lastDocRef.current = result.lastDoc;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    },
    [filters, pageSize]
  );

  const refreshInvoices = useCallback(() => {
    lastDocRef.current = undefined;
    loadInvoices(true);
  }, [loadInvoices]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadInvoices(false);
    }
  }, [state.loading, state.hasMore, loadInvoices]);

  useEffect(() => {
    refreshInvoices();
  }, [refreshInvoices]);

  return {
    state,
    refreshInvoices,
    loadMore,
    hasMore: state.hasMore,
  };
}

// Hook for single invoice detail
export function useInvoiceDetail(id: string, type: "input" | "output") {
  const [state, setState] = useState<{
    invoice: InputInvoice | OutputInvoice | null;
    loading: boolean;
    error: string | null;
  }>({
    invoice: null,
    loading: true,
    error: null,
  });

  const loadInvoice = useCallback(async () => {
    if (!id) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const invoice = await InvoiceService.getInvoiceById(id, type);

      setState({
        invoice,
        loading: false,
        error: invoice ? null : "Không tìm thấy hoá đơn",
      });
    } catch (error) {
      setState({
        invoice: null,
        loading: false,
        error: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  }, [id, type]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return {
    state,
    refreshInvoice: loadInvoice,
  };
}

// Hook for invoice statistics
export function useInvoiceStats(dateFrom?: Date, dateTo?: Date) {
  const [state, setState] = useState<{
    stats: InvoiceStats | null;
    loading: boolean;
    error: string | null;
  }>({
    stats: null,
    loading: true,
    error: null,
  });

  const loadStats = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const stats = await InvoiceService.getInvoiceStats(dateFrom, dateTo);

      setState({
        stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        stats: null,
        loading: false,
        error: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    state,
    refreshStats: loadStats,
  };
}

// Hook for tax summary
export function useTaxSummary(year: number, month?: number) {
  const [state, setState] = useState<{
    summary: TaxSummary[];
    loading: boolean;
    error: string | null;
  }>({
    summary: [],
    loading: true,
    error: null,
  });

  const loadSummary = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const summary = await InvoiceService.getTaxSummary(year, month);

      setState({
        summary,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        summary: [],
        loading: false,
        error: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  }, [year, month]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    state,
    refreshSummary: loadSummary,
  };
}
