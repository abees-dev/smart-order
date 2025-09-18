import { useMutation } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";
import type {
  CreateOrderData,
  OrderStatus,
  SupplyShortage,
  InsufficientStockResponse,
} from "../types";

interface UseOrderActionsProps {
  onSuccess?: (data?: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseChangeOrderStatusProps extends UseOrderActionsProps {
  onStockShortage?: (shortages: SupplyShortage[], orderNumber: string) => void;
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
  onStockShortage,
}: UseChangeOrderStatusProps) => {
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
    onSuccess: (response, variables) => {
      if (response.statusCode === 200) {
        // Success - status changed successfully
        if (onSuccess) onSuccess(variables.status);
      } else if (response.statusCode === 400) {
        // Error due to insufficient stock - response body has stockShortages
        const errorResponse = response as InsufficientStockResponse;
        if (
          errorResponse.stockShortages &&
          errorResponse.stockShortages.length > 0 &&
          onStockShortage
        ) {
          onStockShortage(
            errorResponse.stockShortages,
            errorResponse.orderNumber
          );
        }
      }
    },
    onError: (error) => {
      // Handle network errors or other actual errors
      if (onError) onError(error as Error);
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

export const useCheckStockAvailability = ({
  onError,
  onSuccess,
}: UseOrderActionsProps) => {
  const {
    mutate: checkStockAvailability,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (orderId: string) =>
      OrderService.checkStockAvailability(orderId),
    onSuccess: (response) => {
      if (onSuccess) onSuccess(response);
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    checkStockAvailability,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};
