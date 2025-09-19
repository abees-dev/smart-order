const { spawn } = require("child_process");
const { join } = require("path");
const waitOn = require("wait-on");

const isWindows = process.platform === "win32";
const electronPath = join(__dirname, "../node_modules/.bin/electron");
const electronCmd = isWindows ? electronPath + ".cmd" : electronPath;

async function startElectronDev() {
  try {
    // Wait for Vite dev server to be ready
    console.log("Waiting for Vite dev server...");
    await waitOn({
      resources: ["tcp:4000"],
      timeout: 30000,
    });

    console.log("Starting Electron...");

    // Start Electron
    const electronProcess = spawn(electronCmd, ["."], {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "development",
      },
    });

    electronProcess.on("close", () => {
      process.exit();
    });

    // Handle process termination
    process.on("SIGINT", () => {
      electronProcess.kill("SIGINT");
    });

    process.on("SIGTERM", () => {
      electronProcess.kill("SIGTERM");
    });
  } catch (error) {
    console.error("Error starting Electron:", error);
    process.exit(1);
  }
}

startElectronDev();
