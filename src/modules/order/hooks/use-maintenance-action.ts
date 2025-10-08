import { useMutation } from "@tanstack/react-query";
import { OrderService } from "../services/order.service";

export const useChangeStatusMaintenance = () => {
  const mutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) =>
      OrderService.updateMaintenanceStatus(data),
  });
  return mutation;
};

export const useCancelMaintenance = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) =>
      OrderService.updateMaintenanceStatus({ id, status: "cancelled" }),
  });
  return mutation;
};
