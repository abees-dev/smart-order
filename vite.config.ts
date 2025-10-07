import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].module.js",
        chunkFileNames: "assets/[name].[hash].module.js",
      },
    },
    sourcemap: false,
  },
  server: {
    port: 4000,
    // https: {
    //   key: "./localhost-key.pem",
    //   cert: "./localhost.pem",
    // },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
