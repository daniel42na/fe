import { Card, Grid, Icon, Stack, Typography } from "@zvoove/unity-ui";
import { useTranslation } from "react-i18next";

import type { DashboardKpi } from "~/mocked/types/dashboard";

type Props = {
  kpis: DashboardKpi[];
};

const DashboardKpis = ({ kpis }: Props) => {
  const { t } = useTranslation();

  return (
    <Grid columns={{ minimum: 1, mobile: 2, laptop: 4 }} gap="md" width="100%">
      {kpis.map((kpi) => (
        <Grid.Item key={kpi.id}>
          <Card variant="outlined" padding="lg" height="100%">
            <Stack direction="column" gap="md">
              <Stack direction="row" justify="space-between" align="center">
                <Typography
                  variant="label"
                  size="md"
                  color="on-surface-variant"
                >
                  {t(kpi.labelKey)}
                </Typography>
                <Icon name={kpi.icon} color="primary" size="md" />
              </Stack>
              <Stack direction="row" gap="xs" align="baseline">
                <Typography variant="display" size="sm">
                  {kpi.value}
                </Typography>
                <Typography variant="label" size="sm" color={kpi.changeColor}>
                  {kpi.change}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid.Item>
      ))}
    </Grid>
  );
};

export default DashboardKpis;
