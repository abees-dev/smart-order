import { PermissionGuard } from "@/components/guards";
import NoPermissionPage from "@/components/layout/no-permission-page";
import LazyLoadComponent from "@/components/lazyload";
import { Actions, Resources } from "@/constants";
import React from "react";
import type { RouteObject } from "react-router-dom";

const ProductsListPage = React.lazy(
  () => import("./components/products-list-page")
);

export const productRouter: RouteObject[] = [
  {
    path: "products",
    element: (
      <LazyLoadComponent>
        <PermissionGuard
          resource={Resources.PRODUCTS}
          action={Actions.READ}
          fallback={<NoPermissionPage />}
        >
          <ProductsListPage />
        </PermissionGuard>
      </LazyLoadComponent>
    ),
  },
];
