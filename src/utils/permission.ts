import type { Permission } from "@/modules/auth";

export const hasResource = (resource: string, permission: Permission) => {
  return (
    permission && Object.prototype.hasOwnProperty.call(permission, resource)
  );
};

export const hasAction = (
  resource: string,
  action: string,
  permission: Permission
) => {
  return (
    hasResource(resource, permission) &&
    (permission as Record<string, string[]>)[resource]?.includes(action)
  );
};
