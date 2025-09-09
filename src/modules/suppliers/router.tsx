import { type RouteObject } from "react-router-dom";
import { SuppliersListPage } from "./components";

const suppliersRouter: RouteObject[] = [
  {
    element: <SuppliersListPage />,
    path: "suppliers",
  },
];

export default suppliersRouter;
