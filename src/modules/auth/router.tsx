import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router-dom";

const LoginPage = lazy(() => import("./components/login-page"));

const authRouter: RouteObject[] = [
  {
    element: <Outlet />,
    path: "/auth",
    children: [
      {
        element: <LoginPage />,
        path: "login",
      },
      {
        element: <LoginPage />,
        index: true,
      },
    ],
  },
];

export default authRouter;
