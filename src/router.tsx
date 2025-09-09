import { createBrowserRouter, Link } from "react-router-dom";
import authRouter from "./modules/auth/router";
import { customerRouter } from "./modules/customer";
import { suppliesRouter } from "./modules/supplies";
import { suppliersRouter } from "./modules/suppliers";
import DashboardLayout from "./layout/dashboard-layout";

const router = createBrowserRouter(
  [
    ...authRouter,
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p>Welcome to Smart Order Dashboard!</p>
            </div>
          ),
        },
        ...customerRouter,
        ...suppliersRouter,
        ...suppliesRouter,
      ],
    },
    {
      path: "/",
      element: (
        <div>
          Home - <Link to="/auth/login">Go to Login</Link>
        </div>
      ),
    },
  ],
  {
    basename:
      import.meta.env.VITE_BASE_URL ||
      (import.meta.env.MODE === "miniapp" ? "/zapps/1309730958729066148" : "/"),
  }
);

export default router;
