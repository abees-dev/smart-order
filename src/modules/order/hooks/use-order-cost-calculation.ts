import { useQuery } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";
import type { OrderCostCalculation } from "../types";

export function useOrderCostCalculation(orderId: string) {
  const {
    data: costCalculation,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderCostCalculation>({
    queryKey: ["order-cost-calculation", orderId],
    queryFn: () => OrderService.getOrderCostCalculation(orderId),
    enabled: !!orderId,
  });

  return {
    costCalculation,
    isLoading,
    error: error ? "Không thể tải thông tin tính toán chi phí" : null,
    refetch,
  };
}
