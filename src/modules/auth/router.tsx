import { Outlet, type RouteObject } from "react-router-dom";
import { LoginPage } from "./components";

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
