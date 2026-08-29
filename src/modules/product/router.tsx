import { PermissionGuard } from "@/components/guards";
import NoPermissionPage from "@/components/layout/no-permission-page";
import LazyLoadComponent from "@/components/lazyload";
import { Actions, Resources } from "@/constants";
import React from "react";
import { Outlet, type RouteObject } from "react-router-dom";

const ProductsListPage = React.lazy(
  () => import("./components/products-list-page")
);
const ProductDetailPage = React.lazy(
  () => import("./components/product-detail-page")
);

export const productRouter: RouteObject[] = [
  {
    path: "products",
    element: <Outlet />,
    children: [
      {
        index: true,
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
      {
        path: ":id",
        element: (
          <LazyLoadComponent>
            <PermissionGuard
              resource={Resources.PRODUCTS}
              action={Actions.DETAIL}
              fallback={<NoPermissionPage />}
            >
              <ProductDetailPage />
            </PermissionGuard>
          </LazyLoadComponent>
        ),
      },
    ],
  },
];

