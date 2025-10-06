export const Resources = {
  CUSTOMERS: "CUSTOMERS",
  SUPPLIERS: "SUPPLIERS",
  ORDERS: "ORDERS",
  PRODUCTS: "PRODUCTS",
  REPORTS: "REPORTS",
  SUPPLIES: "SUPPLIES",
  INVOICES: "INVOICES",
  COST_INCURRED: "COST_INCURRED",
} as const;

export const Actions = {
  CREATE: "create",
  DETAIL: "detail",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  COST: "cost",
} as const;

export type Resources = (typeof Resources)[keyof typeof Resources];
export type Actions = (typeof Actions)[keyof typeof Actions];
