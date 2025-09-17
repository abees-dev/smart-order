import { useMutation } from "@tanstack/react-query";
import { ProductService } from "../services/product.service";
import type { UpdateProductData } from "../types";

interface UseProductActionsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateProduct = ({
  onError,
  onSuccess,
}: UseProductActionsProps) => {
  const {
    mutate: createProduct,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ProductService.createProduct,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    createProduct,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useUpdateProduct = ({
  onSuccess,
  onError,
}: UseProductActionsProps) => {
  const {
    mutate: updateProduct,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      ProductService.updateProduct(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    updateProduct,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDeleteProduct = ({
  onSuccess,
  onError,
}: UseProductActionsProps) => {
  const {
    mutate: deleteProduct,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    deleteProduct,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDuplicateProduct = ({
  onSuccess,
  onError,
}: UseProductActionsProps) => {
  const {
    mutate: duplicateProduct,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (id: string) => ProductService.duplicateProduct(id),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    duplicateProduct,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};
