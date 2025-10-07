import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router-dom";

const LoginPage = lazy(() => import("./components/login-page"));
const ChangePasswordPage = lazy(
  () => import("./components/change-passwork-page")
);

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
      {
        element: <ChangePasswordPage />,
        path: "change-password",
      },
    ],
  },
];

export default authRouter;
