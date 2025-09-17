import { useMutation } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";
import type { CreateOrderData, OrderStatus } from "../types";

interface UseOrderActionsProps {
  onSuccess?: (data?: unknown) => void;
  onError?: (error: Error) => void;
}
export const useCreateOrder = ({
  onError,
  onSuccess,
}: UseOrderActionsProps) => {
  const {
    mutate: createOrder,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (data: CreateOrderData) => OrderService.createOrder(data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    createOrder,
    isError,
    error,
    isPending,
  };
};

export const useChangeOrderStatus = ({
  onError,
  onSuccess,
}: UseOrderActionsProps) => {
  const {
    mutate: changeOrderStatus,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => OrderService.changeOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      if (onSuccess) onSuccess(variables.status);
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    changeOrderStatus,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDeleteOrder = ({
  onSuccess,
  onError,
}: UseOrderActionsProps) => {
  const {
    mutateAsync: deleteOrder,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (orderId: string) => OrderService.deleteOrder(orderId),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    deleteOrder,
    isError,
    error,
    isPending,
  };
};
export const useUpdateOrder = ({
  onSuccess,
  onError,
}: UseOrderActionsProps) => {
  const {
    mutate: updateOrder,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateOrderData>;
    }) => OrderService.updateOrder(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    updateOrder,
    isError,
    error,
    isPending,
  };
};
