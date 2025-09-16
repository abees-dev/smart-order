import { useMutation } from "@tanstack/react-query";
import { SupplyService } from "../services/supply.service";
import type { UpdateSupplyData } from "../types";

interface UseSupplyActionProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateSupply = ({
  onSuccess,
  onError,
}: UseSupplyActionProps) => {
  const {
    mutate: createSupply,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: SupplyService.createSupply,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    createSupply,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useUpdateSupply = ({
  onSuccess,
  onError,
}: UseSupplyActionProps) => {
  const {
    mutate: updateSupply,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplyData }) =>
      SupplyService.updateSupply(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    updateSupply,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDeleteSupply = ({
  onSuccess,
  onError,
}: UseSupplyActionProps) => {
  const {
    mutate: deleteSupply,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (id: string) => SupplyService.deleteSupply(id),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    deleteSupply,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};
