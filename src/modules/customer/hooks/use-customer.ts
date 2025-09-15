import { CustomerService } from "../services/customer.service";
import type { Customer, CustomerFilters } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiResponsePagination } from "@/types/response";

export function useCustomers(filters: CustomerFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["customers", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      CustomerService.getAllCustomers({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Customer[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    customers: data ? data.pages.flatMap((page) => page.contents) : [],
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
    refetchCustomers: refetch,
    error: error?.message || null,
  };
}
