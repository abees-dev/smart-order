import { app } from "electron";
import { join } from "path";

export const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

export const getPreloadPath = () => {
  return isDev
    ? join(__dirname, "preload.cjs")
    : join(
        process.resourcesPath,
        "app.asar.unpacked",
        "dist-electron",
        "preload.cjs"
      );
};

export const getRendererPath = () => {
  if (isDev) {
    return "http://localhost:4000";
  }

  // In packaged app, the dist folder is in the asar archive
  // __dirname will be something like /path/to/app.asar/dist-electron
  // We need to go to /path/to/app.asar/dist/index.html
  return `file://${join(__dirname, "..", "dist", "index.html")}`;
};
