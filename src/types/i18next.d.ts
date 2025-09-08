import "react-i18next";
import type common from "../locales/en/common.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof common;
    };
  }
}
