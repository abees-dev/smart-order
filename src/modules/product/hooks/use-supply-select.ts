import { useState, useEffect, useCallback } from "react";
import { SupplyService } from "@/modules/supplies/services/supply.service";
import type { Supply, SupplyFilters } from "@/modules/supplies/types";

export interface UseSupplySelectReturn {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  refreshSupplies: () => void;
}

export function useSupplySelect(): UseSupplySelectReturn {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: SupplyFilters = {
        isActive: true,
      };

      const result = await SupplyService.getAllSupplies(filters, 100);
      setSupplies(result.supplies);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSupplies = useCallback(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  return {
    supplies,
    loading,
    error,
    refreshSupplies,
  };
}
