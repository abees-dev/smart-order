import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { SupplyImport, SupplyImportFilters } from "../types";
import type { ApiResponsePagination } from "@/types/response";
import { SupplyService } from "../services/supply.service";

export function useSupplyImports(filters: SupplyImportFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["supplies-imports", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      SupplyService.getAllSupplyImports({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<SupplyImport[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    suppliesImports: data ? data.pages.flatMap((page) => page.contents) : [],
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
    refetchSuppliesImports: refetch,
    error: error?.message || null,
  };
}

export function useSupplySummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["supply-summary"],
    queryFn: () => SupplyService.getSupplySummary(),
  });

  return {
    summary: data || {
      totalImports: 0,
      pendingImports: 0,
      completedImports: 0,
      cancelledImports: 0,
      totalAmountCompleted: 0,
      totalAmountPending: 0,
    },
    loading: isLoading,
    error: error?.message || null,
  };
}

export const useSupplyImportDetail = (id?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supply-import", id],
    queryFn: () => (id ? SupplyService.getSupplyImportById(id) : null),
    enabled: !!id,
  });

  return {
    supplyImport: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetchSupplyImport: refetch,
  };
};
