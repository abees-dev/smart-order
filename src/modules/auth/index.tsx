// Main auth module exports - components only for Fast Refresh
export { LoginPage, ChangePasswordPage } from "./components";

// Export hooks and utilities
export { useAuthActions } from "./hooks/use-auth-actions";
export { useChangePassword } from "./hooks/use-change-password";

// Export types
export type * from "./types";
