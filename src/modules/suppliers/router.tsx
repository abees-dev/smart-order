import { type RouteObject } from "react-router-dom";

import LazyLoadComponent from "@/components/lazyload";
import React from "react";
import { PermissionGuard } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { NoPermissionPage } from "@/components/layout";

const SuppliersListPage = React.lazy(
  () => import("./components/suppliers-list-page")
);

const suppliersRouter: RouteObject[] = [
  {
    element: (
      <LazyLoadComponent>
        <PermissionGuard
          resource={Resources.SUPPLIERS}
          action={Actions.READ}
          fallback={<NoPermissionPage />}
        >
          <SuppliersListPage />
        </PermissionGuard>
      </LazyLoadComponent>
    ),
    path: "suppliers",
  },
];

export default suppliersRouter;
