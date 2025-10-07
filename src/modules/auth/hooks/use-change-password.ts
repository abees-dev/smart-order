import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { ChangePasswordData } from "../types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data),
    onError: (error: Error) => {
      // Error will be handled by the component
      throw error;
    },
  });
}
