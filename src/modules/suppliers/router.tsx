import { type RouteObject } from "react-router-dom";

import LazyLoadComponent from "@/components/lazyload";
import React from "react";

const SuppliersListPage = React.lazy(
  () => import("./components/suppliers-list-page")
);

const suppliersRouter: RouteObject[] = [
  {
    element: (
      <LazyLoadComponent>
        <SuppliersListPage />
      </LazyLoadComponent>
    ),
    path: "suppliers",
  },
];

export default suppliersRouter;
