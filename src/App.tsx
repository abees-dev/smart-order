import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import router from "./router";
import { queryClient } from "./config/react-query";
// import { useDocumentTitle } from "./hooks/use-document-title";

function App() {
  // useDocumentTitle();

  return (
    <QueryClientProvider client={queryClient}>
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
      {/* React Query Devtools - only shows in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
