import { useQuery } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";

export const useOrderSelectionMenu = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders-selection"],
    queryFn: () => OrderService.getOrdersSelection(),
  });

  return {
    data: data || {
      customers: [],
      products: [],
      supplies: [],
    },
    loading: isLoading,
    error: isError ? "Có lỗi xảy ra" : null,
    refreshOrders: refetch,
  };
};
