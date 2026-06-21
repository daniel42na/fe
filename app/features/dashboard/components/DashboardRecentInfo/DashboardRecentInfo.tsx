import { InfoBox } from "@zvoove/unity-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  DashboardActivity,
  DashboardOnboardingStep,
} from "~/mocked/types/dashboard";

type Props = {
  activities: DashboardActivity[];
  onboardingProgress: DashboardOnboardingStep[];
};

const DashboardRecentInfo = ({ activities, onboardingProgress }: Props) => {
  const { t } = useTranslation();

  const message = useMemo(() => {
    const applications = activities.filter(
      (activity) => activity.actionKey === "dashboard.activity.newApplication",
    ).length;
    const onboarding = onboardingProgress.length;

    return `${applications} ${t("dashboard.page.infoBoxApplications")}. ${onboarding} ${t("dashboard.page.infoBoxOnboarding")}.`;
  }, [activities, onboardingProgress, t]);

  return <InfoBox variant="subtle" icon="info" message={message} />;
};

export default DashboardRecentInfo;
