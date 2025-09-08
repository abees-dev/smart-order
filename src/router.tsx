import { createBrowserRouter } from "react-router-dom";
import authRouter from "./modules/auth/router";

const router = createBrowserRouter([
  {
    element: <div>Test</div>,
    path: "/",
  },
  ...authRouter,
]);

export default router;
