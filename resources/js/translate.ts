import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

if (!i18n.isInitialized) {
  i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
      supportedLngs: ["en", "pl", "ru", "fr",'zh', 'ja', 'es','ar', 'de','it','he'],
      fallbackLng: "en",
      lng: localStorage.getItem("lang") || "pl",

      backend: {
        loadPath: "/locales/{{lng}}/translation.json"
      },

      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;