import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AutoUpdater } from "@/components/electron/auto-updater";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Globe, Download, Info } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("navigation.settings")}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and system settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language Settings
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the application interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Interface Language</p>
                  <p className="text-sm text-muted-foreground">
                    Select the language for menus, buttons, and messages
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Auto-updater Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Application Updates
            </CardTitle>
            <CardDescription>
              Keep your app up-to-date with the latest features and security
              improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutoUpdater />
          </CardContent>
        </Card>

        <Separator />

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              System Information
            </CardTitle>
            <CardDescription>Application and system details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Application Name</span>
                <span className="text-sm text-muted-foreground">
                  Smart Order
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <Badge variant="outline">
                  {window.electronAPI ? "Desktop App" : "Web App"}
                </Badge>
              </div>
              {window.electronAPI && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Platform</span>
                  <Badge variant="secondary">
                    {window.electronAPI.platform === "darwin"
                      ? "macOS"
                      : window.electronAPI.platform === "win32"
                      ? "Windows"
                      : window.electronAPI.platform}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
