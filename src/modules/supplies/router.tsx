import { Navigate, Outlet, type RouteObject } from "react-router-dom";

import React from "react";
import LazyLoadComponent from "@/components/lazyload";
import { Actions, Resources, ROUTES } from "@/constants";
import { PermissionGuard } from "@/components/guards";
import { NoPermissionPage } from "@/components/layout";

const SuppliesListPage = React.lazy(
  () => import("./components/supplies-list-page")
);
const SupplyImportsListPage = React.lazy(
  () => import("./components/supply-imports-list-page")
);
const SupplyImportDetailPage = React.lazy(
  () => import("./components/supply-import-detail-page")
);

const suppliesRouter: RouteObject[] = [
  {
    element: <Outlet />,
    path: "supplies",
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD.SUPPLIES.INVENTORY} replace />,
      },
      {
        path: "inventory",
        element: (
          <LazyLoadComponent>
            <PermissionGuard
              resource={Resources.SUPPLIES}
              action={Actions.READ}
              fallback={<NoPermissionPage />}
            >
              <SuppliesListPage />
            </PermissionGuard>
          </LazyLoadComponent>
        ),
      },
      {
        path: "imports",
        element: (
          <LazyLoadComponent>
            <PermissionGuard
              resource={Resources.SUPPLIES_IMPORT}
              action={Actions.READ}
              fallback={<NoPermissionPage />}
            >
              <SupplyImportsListPage />
            </PermissionGuard>
          </LazyLoadComponent>
        ),
      },
      {
        path: "imports/:id",
        element: (
          <LazyLoadComponent>
            <PermissionGuard
              resource={Resources.SUPPLIES_IMPORT}
              action={Actions.DETAIL}
              fallback={<NoPermissionPage />}
            >
              <SupplyImportDetailPage />
            </PermissionGuard>
          </LazyLoadComponent>
        ),
      },
    ],
  },
];

export default suppliesRouter;
