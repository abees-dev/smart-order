export { default as debtRoutes } from "./router";

// Export components
export { default as DebtsFormDialog } from "./components/debts-form-dialog";

// Export types
export type { Debt, DebtFilters } from "./types";

// Export validation schemas and types
export {
  createDebtSchema,
  updateDebtSchema,
  debtFiltersSchema,
  type CreateDebtFormData,
  type UpdateDebtFormData,
  type DebtFiltersData,
} from "./validation";
