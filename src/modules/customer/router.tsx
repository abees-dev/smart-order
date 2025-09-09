import { type RouteObject } from "react-router-dom";
import { CustomersListPage } from "./components";

const customerRouter: RouteObject[] = [
  {
    element: <CustomersListPage />,
    path: "customers",
  },
];

export default customerRouter;
