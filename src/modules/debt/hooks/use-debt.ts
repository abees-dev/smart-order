import { toast } from "sonner";
import type { CreateDebtFormData, DebtPaymentFormData } from "../validation";
import { DebtService } from "../services";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Debt, DebtFilters } from "../types";
import type { ApiResponsePagination } from "@/types/response";

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CreateDebtFormData) => DebtService.createDebt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("Tạo công nợ thành công");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Tạo công nợ thất bại, vui lòng thử lại"
      );
    },
  });

  return mutation;
};

export const useCreateDebtPayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      debtId,
      data,
    }: {
      debtId: string;
      data: DebtPaymentFormData;
    }) => DebtService.createDebtPayment(debtId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("Tạo phiếu thu công nợ thành công");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Tạo phiếu thu công nợ thất bại, vui lòng thử lại"
      );
    },
  });

  return mutation;
};

export function useDebts(filters: DebtFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["debts", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      DebtService.getAllDebts({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Debt[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    debts: data ? data.pages.flatMap((page) => page.contents) : [],
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
    refetchDebts: refetch,
    error: error?.message || null,
  };
}
