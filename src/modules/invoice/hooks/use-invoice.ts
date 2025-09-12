import { useState, useCallback, useEffect } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { InvoiceService } from "../services/invoice.service";
import type {
  Invoice,
  InvoiceFilters,
  InvoiceListState,
  InvoiceFormState,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceStatus,
} from "../types";

// Hook for managing invoice list with filters and pagination
export function useInvoices(filters: InvoiceFilters = {}, pageSize = 20) {
  const [state, setState] = useState<InvoiceListState>({
    invoices: [],
    loading: true,
    error: null,
    hasMore: false,
    total: 0,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();

  const fetchInvoices = useCallback(
    async (reset = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const docToUse = reset ? undefined : lastDoc;
        const {
          invoices: newInvoices,
          hasMore,
          lastDoc: newLastDoc,
        } = await InvoiceService.getAllInvoices(filters, pageSize, docToUse);

        setState((prev) => ({
          ...prev,
          invoices: reset ? newInvoices : [...prev.invoices, ...newInvoices],
          hasMore,
          total: reset ? newInvoices.length : prev.total + newInvoices.length,
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
    [filters, pageSize, lastDoc]
  );

  const refreshInvoices = useCallback(() => {
    setLastDoc(undefined);
    fetchInvoices(true);
  }, [fetchInvoices]);

  const loadMoreInvoices = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchInvoices(false);
    }
  }, [fetchInvoices, state.hasMore, state.loading]);

  useEffect(() => {
    refreshInvoices();
  }, [filters]);

  return {
    ...state,
    refreshInvoices,
    loadMoreInvoices,
  };
}

// Hook for getting a single invoice
export function useInvoice(invoiceId?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);

    try {
      const invoiceData = await InvoiceService.getInvoiceById(invoiceId);
      setInvoice(invoiceData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  };
}

// Hook for invoice actions (create, update, delete, change status)
export function useInvoiceActions() {
  const [state, setState] = useState<InvoiceFormState>({
    loading: false,
    error: null,
  });

  const createInvoice = useCallback(
    async (data: CreateInvoiceData): Promise<string> => {
      setState({ loading: true, error: null });

      try {
        const invoiceId = await InvoiceService.createInvoice(data);
        setState({ loading: false, error: null });
        return invoiceId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tạo hóa đơn";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateInvoice = useCallback(
    async (invoiceId: string, data: UpdateInvoiceData): Promise<void> => {
      setState({ loading: true, error: null });

      try {
        await InvoiceService.updateInvoice(invoiceId, data);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể cập nhật hóa đơn";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const deleteInvoice = useCallback(
    async (invoiceId: string): Promise<void> => {
      setState({ loading: true, error: null });

      try {
        await InvoiceService.deleteInvoice(invoiceId);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể xóa hóa đơn";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const changeInvoiceStatus = useCallback(
    async (invoiceId: string, newStatus: InvoiceStatus): Promise<void> => {
      setState({ loading: true, error: null });

      try {
        await InvoiceService.changeInvoiceStatus(invoiceId, newStatus);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể thay đổi trạng thái hóa đơn";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const checkInvoiceNumberExists = useCallback(
    async (invoiceNumber: string): Promise<boolean> => {
      try {
        return await InvoiceService.checkInvoiceNumberExists(invoiceNumber);
      } catch (error) {
        console.error("Error checking invoice number:", error);
        return false;
      }
    },
    []
  );

  return {
    ...state,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    changeInvoiceStatus,
    checkInvoiceNumberExists,
  };
}

// Hook for invoice statistics
export function useInvoiceStats() {
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<InvoiceStatus, number>;
    totalRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await InvoiceService.getInvoiceStats();
      setStats(statsData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể tải thống kê"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
