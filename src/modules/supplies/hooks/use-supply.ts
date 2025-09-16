import { SupplyService } from "../services/supply.service";
import type { Supply, SupplyFilters } from "../types";
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
