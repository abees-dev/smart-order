// Navigation routes constants
export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },

  // Dashboard routes
  DASHBOARD: {
    ROOT: "/dashboard",

    // Main sections
    CUSTOMERS: "/dashboard/customers",
    SUPPLIERS: "/dashboard/suppliers",
    ORDERS: "/dashboard/orders",
    PRODUCTS: "/dashboard/products",
    REPORTS: "/dashboard/reports",
    SETTINGS: "/dashboard/settings",

    // Supplies section (nested)
    SUPPLIES: {
      ROOT: "/dashboard/supplies",
      INVENTORY: "/dashboard/supplies/inventory",
      INVOICES: "/dashboard/supplies/invoices",
    },
  },

  // Root
  HOME: "/",
} as const;

// Helper function to check if current path matches route
export const isActiveRoute = (
  currentPath: string,
  routePath: string
): boolean => {
  // Exact match for root dashboard
  if (routePath === ROUTES.DASHBOARD.ROOT) {
    return currentPath === routePath;
  }

  // For nested routes, check if current path starts with route path
  return currentPath.startsWith(routePath);
};

// Helper function to check if supplies section is active
export const isSuppliesActive = (currentPath: string): boolean => {
  return currentPath.startsWith(ROUTES.DASHBOARD.SUPPLIES.ROOT);
};
