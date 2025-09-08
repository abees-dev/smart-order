import { Outlet, type RouteObject } from "react-router-dom";

const authRouter: RouteObject[] = [
  {
    element: <Outlet />,
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
