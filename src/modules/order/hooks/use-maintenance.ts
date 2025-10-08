import { useQuery } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";

export const useMaintenance = (orderId: string) => {
  const { data: maintenanceRecords, isLoading: isLoadingMaintenanceRecords } =
    useQuery({
      queryKey: ["maintenance-records", orderId],
      queryFn: () => OrderService.getMaintenanceByOrderId(orderId),
      enabled: !!orderId, // Disable automatic query on mount
    });
  return {
    maintenanceRecords,
    isLoadingMaintenanceRecords,
  };
};
