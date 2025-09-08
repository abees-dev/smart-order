import DashboardLayout from "@/layout/dashboard-layout";
import type { RouteObject } from "react-router-dom";

const authRouter: RouteObject[] = [
  {
    element: <DashboardLayout />,
    path: "/auth",
    children: [
      {
        element: <div>Auth</div>,
        index: true,
      },
    ],
  },
];

export default authRouter;
