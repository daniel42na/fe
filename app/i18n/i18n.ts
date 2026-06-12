import { initReactI18next } from "react-i18next";
import i18n from "i18next";

import { LANGUAGE_STORAGE_KEY, LANGUAGES } from "../constants/preferences";
import de from "./locales/de.json";
import en from "./locales/en.json";

const savedLng =
  typeof localStorage === "undefined"
    ? LANGUAGES.DE
    : (localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? LANGUAGES.DE);

void i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: savedLng,
  fallbackLng: LANGUAGES.DE,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
});

export default i18n;
