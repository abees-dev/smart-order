import { useState, useEffect, useCallback } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerService } from "../services/customer.service";
import type { Customer, CustomerFilters, CustomerListState } from "../types";

export function useCustomers(filters: CustomerFilters = {}, pageSize = 10) {
  const isMobile = useIsMobile();

  const [state, setState] = useState<CustomerListState>({
    customers: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    pageSize,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadCustomers = useCallback(
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
          result = await CustomerService.getAllCustomers(
            filters,
            pageSize,
            reset ? undefined : lastDoc || undefined
          );
        } else {
          // Desktop: Use traditional pagination
          result = await CustomerService.getCustomersWithPagination(
            filters,
            pageSize,
            targetPage
          );
        }

        const customers = result.customers;
        const newHasMore = result.hasMore;
        const newLastDoc = result.lastDoc;
        const newTotal =
          "total" in result ? (result.total as number) : undefined;

        setState((prev) => ({
          ...prev,
          customers:
            isMobile && !reset ? [...prev.customers, ...customers] : customers,
          loading: false,
          total:
            newTotal !== undefined
              ? newTotal
              : reset
              ? customers.length
              : prev.total + customers.length,
          page: isMobile ? (reset ? 1 : prev.page + 1) : targetPage,
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

  const refreshCustomers = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadCustomers(true, 1);
  }, [loadCustomers]);

  const loadMore = useCallback(async () => {
    if (!state.loading && hasMore && isMobile && !loadingMore) {
      setLoadingMore(true);
      try {
        await loadCustomers(false);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [state.loading, hasMore, isMobile, loadingMore, loadCustomers]);

  const changePage = useCallback(
    async (newPage: number) => {
      if (!isMobile) {
        await loadCustomers(true, newPage);
      }
    },
    [isMobile, loadCustomers]
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
          result = await CustomerService.getAllCustomers(filters, pageSize);
        } else {
          result = await CustomerService.getCustomersWithPagination(
            filters,
            pageSize,
            1
          );
        }

        const { customers, hasMore: newHasMore, lastDoc: newLastDoc } = result;
        const total =
          "total" in result ? (result.total as number) : customers.length;

        setState({
          customers,
          loading: false,
          error: null,
          total,
          page: 1,
          pageSize,
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
  }, [JSON.stringify(filters), pageSize, isMobile]);

  return {
    ...state,
    hasMore,
    loadMore,
    refreshCustomers,
    changePage,
    isMobile,
    loadingMore,
  };
}

export function useCustomer(id: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const customerData = await CustomerService.getCustomerById(id);
      setCustomer(customerData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCustomer();
    } else {
      setCustomer(null);
    }
  }, [id, loadCustomer]);

  return {
    customer,
    loading,
    error,
    refetch: loadCustomer,
  };
}
