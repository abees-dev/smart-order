import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function ComingSoon() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(ROUTES.DASHBOARD.ROOT);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("comingSoon.title")}
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            {t("comingSoon.description")}
          </p>
        </div>

        <Button onClick={handleGoBack} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>
      </div>
    </div>
  );
}
