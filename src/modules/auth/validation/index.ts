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
