export {
  CustomersListPage,
  CustomerFormDialog,
  CustomerDetailDialog,
  DeleteCustomerDialog,
} from "./components";

export { useCustomers } from "./hooks/use-customer";

export { CustomerService } from "./services/customer.service";

export type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "./types";

export {
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
  type CreateCustomerFormData,
  type UpdateCustomerFormData,
  type CustomerFiltersData,
} from "./validation";

export { default as customerRouter } from "./router";
