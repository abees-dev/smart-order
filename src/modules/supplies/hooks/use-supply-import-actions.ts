import { useMutation } from "@tanstack/react-query";
import { SupplyService } from "../services/supply.service";
import type { CreateSupplyImportData } from "../types";

interface UseCreateSupplyImportProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useCreateSupplyImport = ({
  onError,
  onSuccess,
}: UseCreateSupplyImportProps) => {
  const {
    mutate: createSupplyImport,
    isError,
    error,
    isPending: isLoading,
  } = useMutation({
    mutationFn: (data: CreateSupplyImportData) =>
      SupplyService.createSupplyImport(data),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    createSupplyImport,
    isError,
    error,
    isLoading,
  };
};

export const useAddToWarehouseSupply = ({
  onError,
  onSuccess,
}: UseCreateSupplyImportProps) => {
  const {
    mutate: addToWarehouseSupply,
    isError,
    error,
  } = useMutation({
    mutationFn: (importId: string) =>
      SupplyService.addToWarehouseSupply(importId),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    addToWarehouseSupply,
    isError,
    error,
  };
};

export const useCompleteSupplyImport = ({
  onError,
  onSuccess,
}: UseCreateSupplyImportProps) => {
  const {
    mutate: completeSupplyImport,
    isError,
    error,
  } = useMutation({
    mutationFn: (importId: string) =>
      SupplyService.completeSupplyImport(importId),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    completeSupplyImport,
    isError,
    error,
  };
};

export const useCancelSupplyImport = ({
  onError,
  onSuccess,
}: UseCreateSupplyImportProps) => {
  const {
    mutate: cancelSupplyImport,
    isError,
    error,
    isPending: isLoading,
  } = useMutation({
    mutationFn: (importId: string) =>
      SupplyService.cancelSupplyImport(importId),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    cancelSupplyImport,
    isError,
    error,
    isLoading,
  };
};

export const useUpdateSupplyImport = ({
  onError,
  onSuccess,
}: UseCreateSupplyImportProps) => {
  const {
    mutate: updateSupplyImport,
    isError,
    error,
    isPending: isLoading,
  } = useMutation({
    mutationFn: ({
      importId,
      data,
    }: {
      importId: string;
      data: CreateSupplyImportData;
    }) => SupplyService.updateSupplyImport(importId, data),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    updateSupplyImport,
    isError,
    error,
    isLoading,
  };
};
