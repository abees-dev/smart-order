import type { RouteObject } from "react-router-dom";
import { OrdersListPage } from "./components/orders-list-page";
import { OrderDetailPage } from "./components/order-detail-page";
import { PermissionGuard } from "@/components/guards";
import { NoPermissionPage } from "@/components/layout";

export const orderRouter: RouteObject[] = [
  {
    path: "orders",
    element: (
      <PermissionGuard
        resource="ORDERS"
        action="read"
        fallback={<NoPermissionPage />}
      >
        <OrdersListPage />
      </PermissionGuard>
    ),
  },
  {
    path: "orders/:id",
    element: <OrderDetailPage />,
  },
];
