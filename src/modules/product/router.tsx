import LazyLoadComponent from "@/components/lazyload";
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
        <ProductsListPage />
      </LazyLoadComponent>
    ),
  },
];
