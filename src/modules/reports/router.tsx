import type { RouteObject } from "react-router-dom";
import { ReportsModule } from "./index";

export const reportsRouter: RouteObject = {
  path: "reports",
  element: <ReportsModule />,
};

export default reportsRouter;
