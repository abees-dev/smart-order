import type { RouteObject } from "react-router-dom";
import { ProductsListPage } from "./components";

export const productRouter: RouteObject[] = [
  {
    path: "products",
    element: <ProductsListPage />,
  },
];
