import {
  Card,
  Divider,
  Icon,
  ProgressIndicator,
  Stack,
  Typography,
} from "@zvoove/unity-ui";
import { useTranslation } from "react-i18next";

import type { DashboardOnboardingStep } from "~/mocked/types/dashboard";

type Props = {
  onboardingProgress: DashboardOnboardingStep[];
};

const DashboardOnboardingProgress = ({ onboardingProgress }: Props) => {
  const { t } = useTranslation();

  return (
    <Card padding="none" variant="outlined">
      <Stack padding="sm" direction="row" gap="sm" align="center">
        <Icon name="clock-countdown" size="md" weight="light" />
        <Typography variant="title" size="lg">
          {t("dashboard.page.onboardingProgress")}
        </Typography>
      </Stack>
      <Divider />
      <Stack padding="md" direction="column" gap="lg" width="100%">
        {onboardingProgress.map((step) => (
          <Stack key={step.labelKey} direction="column" gap="xs" width="100%">
            <Stack
              direction="row"
              justify="space-between"
              align="center"
              width="100%"
            >
              <Typography variant="body" size="md">
                {t(step.labelKey)}
              </Typography>
              <Typography variant="body" size="md">
                {step.value}%
              </Typography>
            </Stack>
            <ProgressIndicator value={step.value} variant="linear" />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
};

export default DashboardOnboardingProgress;
