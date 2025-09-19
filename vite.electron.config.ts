import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  mode: "production",
  build: {
    ssr: true,
    minify: false,
    outDir: "dist-electron",
    rollupOptions: {
      external: ["electron"],
      input: {
        main: resolve(__dirname, "src/electron/main.ts"),
        preload: resolve(__dirname, "src/electron/preload.ts"),
      },
      output: {
        format: "cjs",
        entryFileNames: "[name].cjs",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
