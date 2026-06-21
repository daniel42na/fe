import {
  Avatar,
  Button,
  Card,
  Divider,
  Icon,
  List,
  Stack,
  Typography,
} from "@zvoove/unity-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { DashboardActivity } from "~/mocked/types/dashboard";

type Props = {
  activities: DashboardActivity[];
  onRefresh: () => void;
};

const DashboardActivityFeed = ({ activities, onRefresh }: Props) => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      activities.map((activity) => ({
        id: activity.id,
        content: (
          <Stack direction="row" gap="sm" align="center">
            <Avatar size="sm" type="initials" name={activity.name} />
            <Stack gap="none">
              <Typography variant="body" size="md">
                {activity.name} {t(activity.actionKey)}
              </Typography>
              <Typography variant="body" size="sm" color="on-surface-variant">
                {t(activity.timeKey)}
              </Typography>
            </Stack>
          </Stack>
        ),
      })),
    [activities, t],
  );

  return (
    <Card padding="none" variant="outlined" height="100%">
      <div className="flex h-full min-h-0 flex-col">
        <Stack
          padding="sm"
          direction="row"
          gap="sm"
          align="center"
          justify="space-between"
          width="100%"
        >
          <Stack direction="row" gap="sm" align="center">
            <Icon name="remark" size="md" weight="light" />
            <Typography variant="title" size="lg">
              {t("dashboard.page.activities")}
            </Typography>
          </Stack>
          <Button variant="linkPrimary" icon="refresh" onClick={onRefresh}>
            {t("dashboard.page.refresh")}
          </Button>
        </Stack>
        <Divider />
        <List items={items} height="100%" spread="top" />
      </div>
    </Card>
  );
};

export default DashboardActivityFeed;
