import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import App from "./App.tsx";

// Dev utilities
if (import.meta.env.DEV) {
  import("./seeds/customer-seed").then(({ seedCustomers }) => {
    // Make seed function available in dev console
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).seedCustomers = seedCustomers;
    console.log(
      "🌱 Dev utilities loaded. Run seedCustomers() in console to import customer data."
    );
  });
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
