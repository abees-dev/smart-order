import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import router from "./router";
import { useDocumentTitle } from "./hooks/use-document-title";

function App() {
  useDocumentTitle();
  console.log("VITE_MODE:", import.meta.env.MODE);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <div>test app</div>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
