import type { RouteObject } from "react-router-dom";
import { ReportsModule } from "./index";
import { PermissionGuard } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import { NoPermissionPage } from "@/components/layout";

export const reportsRouter: RouteObject = {
  path: "reports",
  element: (
    <PermissionGuard
      resource={Resources.REPORTS}
      action={Actions.READ}
      fallback={<NoPermissionPage />}
    >
      <ReportsModule />
    </PermissionGuard>
  ),
};

export default reportsRouter;
