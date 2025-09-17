import LazyLoadComponent from "@/components/lazyload";
import React from "react";
import { type RouteObject } from "react-router-dom";

const CustomersListPage = React.lazy(
  () => import("./components/customers-list-page")
);

const customerRouter: RouteObject[] = [
  {
    element: (
      <LazyLoadComponent>
        <CustomersListPage />
      </LazyLoadComponent>
    ),
    path: "customers",
  },
];

export default customerRouter;
