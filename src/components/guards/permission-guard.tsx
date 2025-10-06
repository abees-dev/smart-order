import { useAuthStore } from "@/stores/auth.store";
import { hasAction } from "@/utils/permission";
import type { Resources, Actions } from "@/constants/permission";
import { NoPermissionFallback } from "@/components/layout";

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: Resources;
  action: Actions;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple permissions
}

interface MultiplePermissionGuardProps {
  children: React.ReactNode;
  permissions: Array<{
    resource: Resources;
    action: Actions;
  }>;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = AND operation, false = OR operation
}

/**
 * PermissionGuard component that checks if user has permission for a specific resource and action
 *
 * @param children - Content to render if permission is granted
 * @param resource - The resource to check permission for (e.g., "CUSTOMERS", "ORDERS")
 * @param action - The action to check permission for (e.g., "create", "read", "update", "delete")
 * @param fallback - Optional content to render if permission is denied (default: null)
 *
 * @example
 * ```tsx
 * <PermissionGuard resource="CUSTOMERS" action="create">
 *   <Button>Add Customer</Button>
 * </PermissionGuard>
 *
 * <PermissionGuard
 *   resource="ORDERS"
 *   action="delete"
 *   fallback={<div>You don't have permission to delete orders</div>}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  resource,
  action,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuthStore();

  // If user is not authenticated, deny access
  if (!user || !user.permissions) {
    return <>{fallback}</>;
  }

  // Check if user has the required permission
  const hasPermission = hasAction(resource, action, user.permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * MultiplePermissionGuard component that checks multiple permissions
 *
 * @param children - Content to render if permission check passes
 * @param permissions - Array of resource-action pairs to check
 * @param fallback - Optional content to render if permission is denied (default: null)
 * @param requireAll - If true, user must have ALL permissions (AND). If false, user needs ANY permission (OR). Default: true
 *
 * @example
 * ```tsx
 * // User must have BOTH create customers AND create orders permissions
 * <MultiplePermissionGuard
 *   permissions={[
 *     { resource: "CUSTOMERS", action: "create" },
 *     { resource: "ORDERS", action: "create" }
 *   ]}
 *   requireAll={true}
 * >
 *   <CreateOrderButton />
 * </MultiplePermissionGuard>
 *
 * // User needs EITHER delete customers OR delete orders permission
 * <MultiplePermissionGuard
 *   permissions={[
 *     { resource: "CUSTOMERS", action: "delete" },
 *     { resource: "ORDERS", action: "delete" }
 *   ]}
 *   requireAll={false}
 * >
 *   <BulkDeleteButton />
 * </MultiplePermissionGuard>
 * ```
 */
export function MultiplePermissionGuard({
  children,
  permissions,
  fallback = <NoPermissionFallback />,
  requireAll = true,
}: MultiplePermissionGuardProps) {
  const { user } = useAuthStore();

  // If user is not authenticated, deny access
  if (!user || !user.permissions) {
    return <>{fallback}</>;
  }

  // Check permissions based on requireAll flag
  const hasPermission = requireAll
    ? permissions.every(({ resource, action }) =>
        hasAction(resource, action, user.permissions)
      )
    : permissions.some(({ resource, action }) =>
        hasAction(resource, action, user.permissions)
      );

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check permissions programmatically
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission, checkPermission, checkMultiplePermissions } = usePermissions();
 *
 *   const canCreateCustomer = hasPermission("CUSTOMERS", "create");
 *   const canDeleteOrder = checkPermission("ORDERS", "delete");
 *
 *   const canManageCustomers = checkMultiplePermissions([
 *     { resource: "CUSTOMERS", action: "create" },
 *     { resource: "CUSTOMERS", action: "update" },
 *     { resource: "CUSTOMERS", action: "delete" }
 *   ], true); // requires ALL permissions
 *
 *   return (
 *     <div>
 *       {canCreateCustomer && <Button>Add Customer</Button>}
 *       {canDeleteOrder && <Button>Delete Order</Button>}
 *       {canManageCustomers && <Button>Manage Customers</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuthStore();

  const checkPermission = (resource: Resources, action: Actions): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return hasAction(resource, action, user.permissions);
  };

  const checkMultiplePermissions = (
    permissions: Array<{
      resource: Resources;
      action: Actions;
    }>,
    requireAll: boolean = true
  ): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    return requireAll
      ? permissions.every(({ resource, action }) =>
          hasAction(resource, action, user.permissions)
        )
      : permissions.some(({ resource, action }) =>
          hasAction(resource, action, user.permissions)
        );
  };

  // Convenience method for single permission check
  const hasPermission = checkPermission;

  return {
    hasPermission,
    checkPermission,
    checkMultiplePermissions,
    user,
    isAuthenticated: !!user,
  };
}
