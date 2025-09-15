import { useState, useEffect, useCallback } from "react";
import { SupplierService } from "../services/supplier.service";
import type { Supplier, SupplierFilters } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiResponsePagination } from "@/types/response";

export function useSuppliers(filters: SupplierFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["suppliers", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      SupplierService.getAllSuppliers({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Supplier[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    suppliers: data ? data.pages.flatMap((page) => page.contents) : [],
    pagination: data?.pages?.[data.pages.length - 1]?.pagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    loading: isFetching,
    refetchSuppliers: refetch,
    error: error?.message || null,
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
