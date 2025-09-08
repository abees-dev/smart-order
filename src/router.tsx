import { createBrowserRouter } from "react-router-dom";
import authRouter from "./modules/auth/router";

const router = createBrowserRouter([...authRouter]);

export default router;
