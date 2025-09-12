import type { RouteObject } from "react-router-dom";
import { InvoicesListPage } from "./components/invoices-list-page";

export const invoiceRouter: RouteObject[] = [
  {
    path: "invoices",
    element: <InvoicesListPage />,
  },
  {
    path: "invoices/:id",
    element: <div>Invoice Detail Page - To be implemented</div>,
  },
];
