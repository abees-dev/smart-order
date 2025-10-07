import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "auth.usernameRequired")
    .min(3, "auth.usernameMinLength"),
  password: z
    .string()
    .min(1, "auth.passwordRequired")
    .min(6, "auth.passwordMinLength"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, "auth.usernameRequired")
    .min(3, "auth.usernameMinLength"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "auth.currentPasswordRequired")
      .min(6, "auth.passwordMinLength"),
    newPassword: z
      .string()
      .min(1, "auth.newPasswordRequired")
      .min(6, "auth.passwordMinLength")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "auth.passwordComplexityRequired"
      ),
    confirmPassword: z.string().min(1, "auth.confirmPasswordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "auth.passwordsDoNotMatch",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "auth.newPasswordMustBeDifferent",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
