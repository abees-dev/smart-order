import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { InputInvoiceListPage } from "./components/input-invoice-list-page";
import { OutputInvoiceListPage } from "./components/output-invoice-list-page";

export const invoiceRouter: RouteObject[] = [
  {
    path: "invoices",
    children: [
      {
        index: true,
        element: <Navigate to="input" replace />,
      },
      {
        path: "input",
        element: <InputInvoiceListPage />,
      },
      {
        path: "output",
        element: <OutputInvoiceListPage />,
      },
    ],
  },
];
