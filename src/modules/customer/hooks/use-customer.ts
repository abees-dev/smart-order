import { useState, useEffect, useCallback } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { CustomerService } from "../services/customer.service";
import type {
  Customer,
  CustomerFilters,
  CustomerListState,
  CustomerFormState,
  CreateCustomerData,
  UpdateCustomerData,
} from "../types";

export function useCustomers(filters: CustomerFilters = {}, pageSize = 10) {
  const [state, setState] = useState<CustomerListState>({
    customers: [],
    loading: true, // Start with loading true
    error: null,
    total: 0,
    page: 1,
    pageSize,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadCustomers = useCallback(
    async (reset = false) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const {
          customers,
          hasMore: newHasMore,
          lastDoc: newLastDoc,
        } = await CustomerService.getAllCustomers(
          filters,
          pageSize,
          reset ? undefined : lastDoc || undefined
        );

        setState((prev) => ({
          ...prev,
          customers: reset ? customers : [...prev.customers, ...customers],
          loading: false,
          total: reset ? customers.length : prev.total + customers.length,
          page: reset ? 1 : prev.page + 1,
        }));

        setHasMore(newHasMore);
        setLastDoc(newLastDoc || null);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }));
      }
    },
    // Removed lastDoc from dependencies to avoid infinite loop
    [filters, pageSize]
  );

  const refreshCustomers = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    loadCustomers(true);
  }, [loadCustomers]);

  const loadMore = useCallback(() => {
    if (!state.loading && hasMore) {
      loadCustomers(false);
    }
  }, [state.loading, hasMore, loadCustomers]);

  // Use useEffect with proper dependencies to avoid infinite loop
  useEffect(() => {
    const loadData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLastDoc(null);
      setHasMore(true);

      try {
        const {
          customers,
          hasMore: newHasMore,
          lastDoc: newLastDoc,
        } = await CustomerService.getAllCustomers(filters, pageSize);

        setState({
          customers,
          loading: false,
          error: null,
          total: customers.length,
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
  }, [JSON.stringify(filters), pageSize]);

  return {
    ...state,
    hasMore,
    loadMore,
    refreshCustomers,
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

export function useCustomerActions() {
  const [state, setState] = useState<CustomerFormState>({
    loading: false,
    error: null,
  });

  const createCustomer = useCallback(async (data: CreateCustomerData) => {
    setState({ loading: true, error: null });

    try {
      const newCustomer = await CustomerService.createCustomer(data);
      setState({ loading: false, error: null });
      return newCustomer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, data: UpdateCustomerData) => {
      setState({ loading: true, error: null });

      try {
        const updatedCustomer = await CustomerService.updateCustomer(id, data);
        setState({ loading: false, error: null });
        return updatedCustomer;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Đã xảy ra lỗi";
        setState({ loading: false, error: errorMessage });
        throw error;
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    setState({ loading: true, error: null });

    try {
      await CustomerService.deleteCustomer(id);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const toggleCustomerStatus = useCallback(async (id: string) => {
    setState({ loading: true, error: null });

    try {
      const updatedCustomer = await CustomerService.toggleCustomerStatus(id);
      setState({ loading: false, error: null });
      return updatedCustomer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  };
}

export function useCustomerSearch() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await CustomerService.searchCustomers(searchTerm);
      setCustomers(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setCustomers([]);
    setError(null);
  }, []);

  return {
    customers,
    loading,
    error,
    searchCustomers,
    clearSearch,
  };
}
