import { useState, useEffect, useCallback, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { SupplierService } from "../services/supplier.service";
import type {
  Supplier,
  SupplierFilters,
  SupplierListState,
  SupplierFormState,
  CreateSupplierData,
  UpdateSupplierData,
} from "../types";

export function useSuppliers(filters: SupplierFilters = {}, pageSize = 100) {
  const [state, setState] = useState<SupplierListState>({
    suppliers: [],
    loading: true, // Start with loading true
    error: null,
    total: 0,
    page: 1,
    pageSize,
  });

  const lastDocRef = useRef<DocumentSnapshot | null>(null);

  // Use JSON.stringify to create stable dependency
  const filtersString = JSON.stringify(filters);
  const pageSizeValue = pageSize;

  useEffect(() => {
    const loadSuppliers = async () => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        lastDocRef.current = null; // Reset for new filters
        const { suppliers, lastDoc: newLastDoc } =
          await SupplierService.getAllSuppliers(filters, pageSize, undefined);

        setState((prev) => ({
          ...prev,
          suppliers: suppliers,
          loading: false,
          total: suppliers.length,
          page: 1,
        }));

        lastDocRef.current = newLastDoc || null;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      }
    };

    loadSuppliers();
  }, [filtersString, pageSizeValue]);

  const refreshSuppliers = useCallback(() => {
    lastDocRef.current = null;
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    SupplierService.getAllSuppliers(filters, pageSize, undefined)
      .then(({ suppliers, lastDoc: newLastDoc }) => {
        setState((prev) => ({
          ...prev,
          suppliers: suppliers,
          loading: false,
          total: suppliers.length,
          page: 1,
        }));
        lastDocRef.current = newLastDoc || null;
      })
      .catch((error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        }));
      });
  }, [filters, pageSize]);

  return {
    suppliers: state.suppliers,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    refreshSuppliers,
  };
}

export function useSupplierForm() {
  const [state, setState] = useState<SupplierFormState>({
    loading: false,
    error: null,
  });

  const createSupplier = useCallback(async (data: CreateSupplierData) => {
    setState({ loading: true, error: null });

    try {
      const id = await SupplierService.createSupplier(data);
      setState({ loading: false, error: null });
      return id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const updateSupplier = useCallback(
    async (id: string, data: UpdateSupplierData) => {
      setState({ loading: true, error: null });

      try {
        await SupplierService.updateSupplier(id, data);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Có lỗi xảy ra";
        setState({ loading: false, error: errorMessage });
        throw error;
      }
    },
    []
  );

  const deleteSupplier = useCallback(async (id: string) => {
    setState({ loading: true, error: null });

    try {
      await SupplierService.deleteSupplier(id);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const toggleSupplierStatus = useCallback(async (id: string) => {
    setState({ loading: true, error: null });

    try {
      await SupplierService.toggleSupplierStatus(id);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
  };
}

export function useSupplierDetail(id: string | null) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupplier = useCallback(async (supplierId: string) => {
    setLoading(true);
    setError(null);

    try {
      const supplierData = await SupplierService.getSupplierById(supplierId);
      setSupplier(supplierData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        setError(null);

        try {
          const supplierData = await SupplierService.getSupplierById(id);
          setSupplier(supplierData);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        } finally {
          setLoading(false);
        }
      } else {
        setSupplier(null);
        setError(null);
      }
    };

    loadData();
  }, [id]);

  return {
    supplier,
    loading,
    error,
    refetch: () => id && loadSupplier(id),
  };
}

export function useSupplierSearch() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSuppliers = useCallback(
    async (searchTerm: string, filters: SupplierFilters = {}) => {
      if (!searchTerm.trim()) {
        setSuppliers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await SupplierService.searchSuppliers(
          searchTerm,
          filters
        );
        setSuppliers(results);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSuppliers([]);
    setError(null);
  }, []);

  return {
    suppliers,
    loading,
    error,
    searchSuppliers,
    clearSearch,
  };
}

export function useActiveSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActiveSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeSuppliers = await SupplierService.getActiveSuppliers();
      setSuppliers(activeSuppliers);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const activeSuppliers = await SupplierService.getActiveSuppliers();
        setSuppliers(activeSuppliers);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refetch: loadActiveSuppliers,
  };
}
