import { createBrowserRouter } from "react-router-dom";
import authRouter from "./modules/auth/router";
import DashboardLayout from "./layout/dashboard-layout";

const router = createBrowserRouter([
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
    ],
  },
  {
    path: "/",
    element: (
      <div>
        Home -{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </div>
    ),
  },
]);

export default router;
