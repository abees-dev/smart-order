import { useMutation } from "@tanstack/react-query";
import { CustomerService } from "../services/customer.service";
import type { UpdateCustomerData } from "../types";
interface UseCreateCustomerProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateCustomer = ({
  onSuccess,
  onError,
}: UseCreateCustomerProps) => {
  const {
    mutate: createCustomer,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: CustomerService.createCustomer,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    createCustomer,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useUpdateCustomer = ({
  onSuccess,
  onError,
}: UseCreateCustomerProps) => {
  const {
    mutate: updateCustomer,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      CustomerService.updateCustomer(id, data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    updateCustomer,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};

export const useDeleteCustomer = ({
  onSuccess,
  onError,
}: UseCreateCustomerProps) => {
  const {
    mutate: deleteCustomer,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: (id: string) => CustomerService.deleteCustomer(id),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return {
    deleteCustomer,
    isError,
    error: error?.message || null,
    loading: isPending,
  };
};
