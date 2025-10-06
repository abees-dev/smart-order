import { PermissionGuard } from "@/components/guards";
import { NoPermissionPage } from "@/components/layout";
import { Actions, Resources } from "@/constants";
import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
// import { InputInvoiceListPage } from "./components/input-invoice-list-page";
// import { OutputInvoiceListPage } from "./components/output-invoice-list-page";

const InputInvoiceListPage = React.lazy(
  () => import("./components/input-invoice-list-page")
);
const OutputInvoiceListPage = React.lazy(
  () => import("./components/output-invoice-list-page")
);

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
        element: (
          <PermissionGuard
            resource={Resources.INVOICES}
            action={Actions.READ}
            fallback={<NoPermissionPage />}
          >
            <InputInvoiceListPage />
          </PermissionGuard>
        ),
      },
      {
        path: "output",
        element: (
          <PermissionGuard
            resource={Resources.INVOICES}
            action={Actions.READ}
            fallback={<NoPermissionPage />}
          >
            <OutputInvoiceListPage />,
          </PermissionGuard>
        ),
      },
    ],
  },
];
