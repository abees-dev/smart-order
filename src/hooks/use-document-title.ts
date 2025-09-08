import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentTitle() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document language
    document.documentElement.lang = i18n.language;

    // Update document title
    document.title = t("app.title");
  }, [i18n.language, t]);
}
