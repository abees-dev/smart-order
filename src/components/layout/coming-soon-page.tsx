import ComingSoon from "@/components/layout/coming-soon";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function ComingSoonPage() {
  const { t } = useTranslation();

  useDocumentTitle();

  // Set custom title for this page
  useEffect(() => {
    document.title = `${t("comingSoon.title")} - ${t("app.title")}`;
  }, [t]);

  return <ComingSoon />;
}
