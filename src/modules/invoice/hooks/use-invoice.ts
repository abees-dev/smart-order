import { InvoiceService } from "../services/invoice.service";
import type { InvoiceFilters, InputInvoice, OutputInvoice } from "../types";
import type { ApiResponsePagination } from "@/types/response";
import { useInfiniteQuery } from "@tanstack/react-query";

// Hook for output invoices only
export function useOutputInvoices(filters: Omit<InvoiceFilters, "type"> = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["outputInvoices", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      InvoiceService.getOutputInvoices({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<OutputInvoice[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastPage: any = data?.pages?.[data.pages.length - 1];

  return {
    outputInvoices: data ? data.pages.flatMap((page) => page.contents) : [],
    pagination:
      (lastPage?.pagination as ApiResponsePagination<
        OutputInvoice[]
      >["pagination"]) ||
      ({
        page: 1,
        pageSize: 10,
        total: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
      } as const),
    summary: (lastPage?.summary as {
      totalAmount: number;
      vatAmount: number;
      totalCount: number;
    }) || {
      totalAmount: 0,
      vatAmount: 0,
      totalCount: 0,
    },
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    loading: isFetching,
    refetchOutputInvoices: refetch,
    error: error?.message || null,
  };
}

export function useInputInvoices(filters: Omit<InvoiceFilters, "type"> = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["inputInvoices", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      InvoiceService.getInputInvoices({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<InputInvoice[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastPage: any = data?.pages?.[data.pages.length - 1];

  return {
    inputInvoices: data ? data.pages.flatMap((page) => page.contents) : [],
    pagination:
      (lastPage?.pagination as ApiResponsePagination<
        InputInvoice[]
      >["pagination"]) ||
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
    refetchInputInvoices: refetch,
    error: error?.message || null,
  };
}
