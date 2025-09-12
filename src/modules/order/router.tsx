import type { RouteObject } from "react-router-dom";
import { OrdersListPage } from "./components/orders-list-page";

export const orderRouter: RouteObject[] = [
  {
    path: "orders",
    element: <OrdersListPage />,
  },
  {
    path: "orders/:id",
    element: <div>Order Detail Page - To be implemented</div>,
  },
];
