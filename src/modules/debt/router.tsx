import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

const DebtsListPage = lazy(() => import("./components/debts-list-page"));

const debtRoutes: RouteObject[] = [
  {
    path: "debts",
    children: [
      {
        index: true,
        element: <DebtsListPage />,
      },
      // TODO: Add other debt routes like detail, create, etc.
    ],
  },
];

export default debtRoutes;
