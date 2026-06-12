export const LANGUAGES = {
  DE: "de",
  EN: "en",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const LANGUAGE_STORAGE_KEY = "shell:language";

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const THEME_STORAGE_KEY = "shell:theme";
