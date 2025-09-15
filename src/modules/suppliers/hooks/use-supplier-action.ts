import { useMutation } from "@tanstack/react-query";
import { SupplierService } from "../services/supplier.service";
import type { CreateSupplierFormData } from "../validation";

interface UseSupplierActionProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateSupplier = ({
  onSuccess,
  onError,
}: UseSupplierActionProps) => {
  const {
    mutate: createSupplier,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: SupplierService.createSupplier,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    createSupplier,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useUpdateSupplier = ({
  onSuccess,
  onError,
}: UseSupplierActionProps) => {
  const {
    mutate: updateSupplier,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateSupplierFormData }) =>
      SupplierService.updateSupplier(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    updateSupplier,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDeleteSupplier = ({
  onSuccess,
  onError,
}: UseSupplierActionProps) => {
  const {
    mutate: deleteSupplier,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (id: string) => SupplierService.deleteSupplier(id),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    deleteSupplier,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};
