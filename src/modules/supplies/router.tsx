import { Outlet, type RouteObject } from "react-router-dom";
import { SuppliesListPage, SupplyImportsListPage } from "./components";

const suppliesRouter: RouteObject[] = [
  {
    element: <Outlet />,
    path: "supplies",
    children: [
      {
        index: true,
        element: <SuppliesListPage />,
      },
      {
        path: "imports",
        element: <SupplyImportsListPage />,
      },
    ],
  },
];

export default suppliesRouter;
