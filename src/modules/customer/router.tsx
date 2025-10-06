import { PermissionGuard } from "@/components/guards";
import NoPermissionPage from "@/components/layout/no-permission-page";
import LazyLoadComponent from "@/components/lazyload";
import { Actions, Resources } from "@/constants";
import React from "react";
import { type RouteObject } from "react-router-dom";

const CustomersListPage = React.lazy(
  () => import("./components/customers-list-page")
);

const customerRouter: RouteObject[] = [
  {
    element: (
      <LazyLoadComponent>
        <PermissionGuard
          resource={Resources.CUSTOMERS}
          action={Actions.READ}
          fallback={<NoPermissionPage />}
        >
          <CustomersListPage />
        </PermissionGuard>
      </LazyLoadComponent>
    ),
    path: "customers",
  },
];

export default customerRouter;
