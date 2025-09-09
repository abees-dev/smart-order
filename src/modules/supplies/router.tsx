import { Outlet, type RouteObject } from "react-router-dom";
import {
  SuppliesListPage,
  SupplyImportsListPage,
  SupplyImportDetailPage,
} from "./components";

const suppliesRouter: RouteObject[] = [
  {
    element: <Outlet />,
    path: "supplies",
    children: [
      {
        index: true,
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Vật tư</h1>
            <p>Chọn một mục từ menu bên trái để bắt đầu.</p>
          </div>
        ),
      },
      {
        path: "inventory",
        element: <SuppliesListPage />,
      },
      {
        path: "imports",
        element: <SupplyImportsListPage />,
      },
      {
        path: "imports/:id",
        element: <SupplyImportDetailPage />,
      },
    ],
  },
];

export default suppliesRouter;
