import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

export const AutoUpdater: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "available" | "downloading" | "ready"
  >("idle");

  useEffect(() => {
    // Check if we're running in Electron
    const checkElectron = async () => {
      // Check if we're in Electron environment
      if (window.electronAPI || (window as any).require) {
        setIsElectron(true);
        try {
          if (window.electronAPI) {
            const version = await window.electronAPI.getAppVersion();
            setCurrentVersion(version);
          } else {
            // Fallback for when preload script isn't available
            setCurrentVersion("0.0.2");
          }
        } catch (error) {
          console.error("Failed to get app version:", error);
          setCurrentVersion("0.0.2");
        }
      }
    };

    checkElectron();
  }, []);

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Listen for update events
    const handleUpdateAvailable = (info: unknown) => {
      const updateInfo = info as UpdateInfo;
      setUpdateAvailable(true);
      setUpdateInfo(updateInfo);
      setUpdateStatus("available");
      setIsChecking(false);
    };

    const handleUpdateDownloaded = () => {
      setUpdateStatus("ready");
      setIsChecking(false);
    };

    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);

    return () => {
      // Note: In a real implementation, you'd want to remove these listeners
      // but the current electronAPI interface doesn't provide a way to do that
    };
  }, [isElectron]);

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) {
      console.log("Auto-updater not available - preload script not loaded");
      return;
    }

    setIsChecking(true);
    setUpdateStatus("checking");

    try {
      await window.electronAPI.checkForUpdates();
      // If no update is available, we'll reset the status after a delay
      setTimeout(() => {
        if (updateStatus === "checking") {
          setUpdateStatus("idle");
          setIsChecking(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to check for updates:", error);
      setIsChecking(false);
      setUpdateStatus("idle");
    }
  };

  // Don't render anything if not in Electron
  if (!isElectron) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          App Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Current version: <span className="font-medium">{currentVersion}</span>
        </div>

        {updateStatus === "idle" && (
          <Button
            onClick={handleCheckForUpdates}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for Updates
              </>
            )}
          </Button>
        )}

        {updateStatus === "checking" && (
          <Alert>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <AlertDescription>Checking for updates...</AlertDescription>
          </Alert>
        )}

        {updateStatus === "available" && updateInfo && (
          <Alert>
            <Download className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">
                  Update Available: v{updateInfo.version}
                </div>
                <div className="text-sm">
                  The update will be downloaded automatically.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {updateStatus === "downloading" && (
          <Alert>
            <Download className="w-4 h-4" />
            <AlertDescription>Downloading update...</AlertDescription>
          </Alert>
        )}

        {updateStatus === "ready" && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Update Ready</div>
                <div className="text-sm">
                  The app will restart automatically to apply the update.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Auto-updates are enabled
          </div>
          <div className="mt-1">
            Platform: {window.electronAPI?.platform || "unknown"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
