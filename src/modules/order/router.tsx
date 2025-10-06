import type { RouteObject } from "react-router-dom";
import { OrdersListPage } from "./components/orders-list-page";
import { OrderDetailPage } from "./components/order-detail-page";
import { PermissionGuard } from "@/components/guards";
import { NoPermissionPage } from "@/components/layout";
import { Actions, Resources } from "@/constants";

export const orderRouter: RouteObject[] = [
  {
    path: "orders",
    element: (
      <PermissionGuard
        resource={Resources.ORDERS}
        action={Actions.READ}
        fallback={<NoPermissionPage />}
      >
        <OrdersListPage />
      </PermissionGuard>
    ),
  },
  {
    path: "orders/:id",
    element: (
      <PermissionGuard
        resource={Resources.ORDERS}
        action={Actions.DETAIL}
        fallback={<NoPermissionPage />}
      >
        <OrderDetailPage />
      </PermissionGuard>
    ),
  },
];
