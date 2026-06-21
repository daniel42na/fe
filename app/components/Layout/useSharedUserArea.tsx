import type { SideNavigationProps } from "@zvoove/unity-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { changeLanguage, LANGUAGES } from "../../i18n/changeLanguage";
import { useTheme } from "../../theme/useTheme";

const userAvatar = {
  type: "image" as const,
  image: "https://api.dicebear.com/10.x/micah/svg?seed=br54vrdn",
};

export function useSharedUserArea(): SideNavigationProps<"a">["userArea"] {
  const { t, i18n: i18nInstance } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const activeLang = i18nInstance.language;

  return useMemo(
    () => ({
      name: t("user.guest"),
      subtitle: t("user.subtitle"),
      menuItems: [
        {
          id: "language",
          label: t("nav.language"),
          icon: "translate",
          subMenuItems: [
            {
              id: "de",
              label: t("language.de"),
              onClick: () => changeLanguage(LANGUAGES.DE),
              icon: activeLang === LANGUAGES.DE ? "check" : "flag-de",
            },
            {
              id: "en",
              label: t("language.en"),
              onClick: () => changeLanguage(LANGUAGES.EN),
              icon: activeLang === LANGUAGES.EN ? "check" : "flag-gb",
            },
          ],
        },
        {
          id: "appearance",
          label: isDark ? t("nav.lightMode") : t("nav.darkMode"),
          icon: isDark ? "light-mode" : "dark-mode",
          keepOpen: true,
          onClick: toggleTheme,
        },
      ],
      avatar: userAvatar,
    }),
    [activeLang, isDark, t, toggleTheme],
  );
}
