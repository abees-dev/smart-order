import type { Order, OrderFilters } from "../types";
import { OrderService } from "../services/order.service";
import type { ApiResponsePagination } from "@/types/response";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// Hook for managing order list with filters and pagination
export function useOrders(filters: OrderFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["orders", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      OrderService.getAllOrders({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Order[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    orders: data ? data.pages.flatMap((page) => page.contents) : [],
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
    refetchOrders: refetch,
    error: error?.message || null,
  };
}

// Hook for getting a single order by ID
export function useOrderById(id: string) {
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => OrderService.getOrderById(id),
    enabled: !!id,
  });

  return {
    order,
    isLoading,
    error: error?.message || null,
    refetch,
  };
}
