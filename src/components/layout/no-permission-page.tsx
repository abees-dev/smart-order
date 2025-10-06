import NoPermission from "@/components/layout/no-permission";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function NoPermissionPage() {
  const { t } = useTranslation();

  useDocumentTitle();

  // Set custom title for this page
  useEffect(() => {
    document.title = `${t("noPermission.title")} - ${t("app.title")}`;
  }, [t]);

  return <NoPermission showBackButton={false} />;
}
