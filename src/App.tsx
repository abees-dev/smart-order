import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import router from "./router";
import { queryClient } from "./config/react-query";
import { uptimeServer } from "./utils/uptime";
import { AuthInitializer } from "./components/auth-initializer";
// import { useDocumentTitle } from "./hooks/use-document-title";

function App() {
  // useDocumentTitle();

  useEffect(() => {
    const interval = setInterval(() => {
      uptimeServer()
        .then((res) => {
          console.log("Pinging server to keep it awake...");
          console.log(res);
        })
        .catch((error) => {
          console.error("Error pinging server:", error);
        });
    }, 5 * 60 * 1000); // Ping every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton={false} />
      {/* React Query Devtools - only shows in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
