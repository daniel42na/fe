import i18n from "i18next";

import {
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  type Language,
} from "../constants/preferences";

export function changeLanguage(language: Language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  void i18n.changeLanguage(language);
}

export { LANGUAGES };
