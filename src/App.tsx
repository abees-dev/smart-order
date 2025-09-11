import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import router from "./router";
import SelectSearchExample from "./components/ui/select-search-example";
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
      {/* <SelectSearchExample /> */}
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
