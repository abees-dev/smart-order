import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface NoPermissionProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
}

export default function NoPermission({
  title,
  description,
  showBackButton = true,
  backTo = ROUTES.DASHBOARD.ROOT,
  className = "",
}: NoPermissionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(backTo);
  };

  return (
    <div
      className={`min-h-1/2 flex items-center justify-center p-6 pt-10 ${className}`}
    >
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title || t("noPermission.title")}
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            {description || t("noPermission.description")}
          </p>
        </div>

        {showBackButton && (
          <Button onClick={handleGoBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version of NoPermission for use as fallback in permission guards
 */
export function NoPermissionFallback({
  message,
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center justify-center p-4 text-center ${className}`}
    >
      <div className="space-y-2">
        <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message || t("noPermission.fallback")}
        </p>
      </div>
    </div>
  );
}

/**
 * Inline version for use within existing layouts
 */
export function NoPermissionInline({
  message,
  size = "default",
}: {
  message?: string;
  size?: "sm" | "default" | "lg";
}) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "gap-2 text-sm",
    default: "gap-3 text-base",
    lg: "gap-4 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`flex items-center justify-center text-red-600 dark:text-red-400 ${sizeClasses[size]}`}
    >
      <ShieldX className={iconSizes[size]} />
      <span>{message || t("noPermission.inline")}</span>
    </div>
  );
}
