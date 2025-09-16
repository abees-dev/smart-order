import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { OrderService } from "../services/order.service";
import type {
  CreateCostIncurredData,
  UpdateCostIncurredData,
  CostIncurredFilters,
} from "../types";
import { useMemo } from "react";

// Hook for getting cost incurred records for a specific order
export function useCostIncurredByOrder(
  orderId: string,
  filters: CostIncurredFilters = {}
) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["costIncurred", "byOrder", orderId, { ...filters }],
    queryFn: ({ pageParam = filters.page || 1 }) =>
      OrderService.getCostIncurredByOrderId(orderId, {
        ...filters,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: filters.page || 1,
    enabled: !!orderId,
  });

  const costIncurredRecords = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) ?? [];
  }, [data]);

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  return {
    costIncurredRecords,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
    error,
  };
}

// Hook for getting all cost incurred records
export function useCostIncurred(filters: CostIncurredFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["costIncurred", "all", { ...filters }],
    queryFn: ({ pageParam = filters.page || 1 }) =>
      OrderService.getAllCostIncurred({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: filters.page || 1,
  });

  const costIncurredRecords = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) ?? [];
  }, [data]);

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  return {
    costIncurredRecords,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
    error,
  };
}

// Hook for getting a single cost incurred record by ID
export function useCostIncurredById(id: string) {
  return useQuery({
    queryKey: ["costIncurred", id],
    queryFn: () => OrderService.getCostIncurredById(id),
    enabled: !!id,
  });
}

// Hook for creating cost incurred records
export function useCreateCostIncurred() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCostIncurredData) =>
      OrderService.createCostIncurred(data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["costIncurred", "byOrder", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["costIncurred", "all"],
      });
    },
  });
}

// Hook for updating cost incurred records
export function useUpdateCostIncurred() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostIncurredData }) =>
      OrderService.updateCostIncurred(id, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["costIncurred"],
      });
    },
  });
}

// Hook for deleting cost incurred records
export function useDeleteCostIncurred() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrderService.deleteCostIncurred(id),
    onSuccess: () => {
      // Invalidate all cost incurred queries
      queryClient.invalidateQueries({
        queryKey: ["costIncurred"],
      });
    },
  });
}
