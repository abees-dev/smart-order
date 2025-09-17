import { Outlet, type RouteObject } from "react-router-dom";

import React from "react";
import LazyLoadComponent from "@/components/lazyload";

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
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Vật tư</h1>
            <p>Chọn một mục từ menu bên trái để bắt đầu.</p>
          </div>
        ),
      },
      {
        path: "inventory",
        element: (
          <LazyLoadComponent>
            <SuppliesListPage />
          </LazyLoadComponent>
        ),
      },
      {
        path: "imports",
        element: (
          <LazyLoadComponent>
            <SupplyImportsListPage />
          </LazyLoadComponent>
        ),
      },
      {
        path: "imports/:id",
        element: (
          <LazyLoadComponent>
            <SupplyImportDetailPage />
          </LazyLoadComponent>
        ),
      },
    ],
  },
];

export default suppliesRouter;
