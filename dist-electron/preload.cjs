"use strict";
const require$$1 = require("electron");
const electronAPI = {
  getAppVersion: () => require$$1.ipcRenderer.invoke("app-version"),
  checkForUpdates: () => require$$1.ipcRenderer.invoke("check-for-updates"),
  onUpdateAvailable: (callback) => require$$1.ipcRenderer.on("update-available", callback),
  onUpdateDownloaded: (callback) => require$$1.ipcRenderer.on("update-downloaded", callback),
  platform: process.platform
};
require$$1.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };
  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(
      `${dependency}-version`,
      process.versions[dependency] || "unknown"
    );
  }
});
