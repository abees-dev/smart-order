import type { RouteObject } from "react-router-dom";
import { OrdersListPage } from "./components/orders-list-page";
import { OrderDetailPage } from "./components/order-detail-page";

export const orderRouter: RouteObject[] = [
  {
    path: "orders",
    element: <OrdersListPage />,
  },
  {
    path: "orders/:id",
    element: <OrderDetailPage />,
  },
];
