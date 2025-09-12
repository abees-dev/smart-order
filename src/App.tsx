import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "sonner";
import router from "./router";
// import { useDocumentTitle } from "./hooks/use-document-title";

function App() {
  // useDocumentTitle();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton={false} />
    </Suspense>
  );
}

export default App;
