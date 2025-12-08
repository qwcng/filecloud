import React from "react";
import { createRoot } from "react-dom/client";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18n from "i18next";

// --- Konfiguracja i18next w tym samym pliku dla testu ---
i18n
  .use(HttpApi)                  // 🔥 musisz włączyć backend
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "pl"],
    fallbackLng: "en",
    lng: "en",
    


    backend: {
      loadPath: "/locales/{{lng}}/translation.json"
    },

    interpolation: {
      escapeValue: false
    }
  });

export default function TestPage(){
  const { t, i18n } = useTranslation();

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      
      <h3>📂 {t("sidebarmyFiles")}</h3>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => i18n.changeLanguage("en")}>English</button>
        <button onClick={() => i18n.changeLanguage("pl")} style={{ marginLeft: 10 }}>Polski</button>
      </div>
    </div>
  );
};

