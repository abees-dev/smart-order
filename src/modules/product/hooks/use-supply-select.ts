import { SupplyService } from "@/modules/supplies/services/supply.service";
import type { Supply } from "@/modules/supplies/types";
import { useQuery } from "@tanstack/react-query";

export interface UseSupplySelectReturn {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  refreshSupplies: () => void;
}

export function useSupplySelect(): UseSupplySelectReturn {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["supplies-selection"],
    queryFn: () => SupplyService.getSuppliesSelection(),
  });

  return {
    supplies: data || [],
    loading: isLoading,
    error: isError ? "Có lỗi xảy ra" : null,
    refreshSupplies: refetch,
  };
}
