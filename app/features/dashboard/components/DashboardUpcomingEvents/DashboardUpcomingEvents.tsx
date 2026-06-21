import {
  Card,
  Divider,
  Icon,
  List,
  Stack,
  Tag,
  Typography,
} from "@zvoove/unity-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { DashboardUpcomingEvent } from "~/mocked/types/dashboard";

type Props = {
  upcomingEvents: DashboardUpcomingEvent[];
};

const DashboardUpcomingEvents = ({ upcomingEvents }: Props) => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      upcomingEvents.map((event) => ({
        id: event.id,
        content: (
          <Stack
            direction="row"
            gap="sm"
            align="center"
            justify="space-between"
            width="100%"
          >
            <Stack gap="none">
              <Typography variant="body" size="md">
                {t(event.titleKey)}
              </Typography>
              <Stack direction="row" gap="xs" align="center">
                <Icon name="calendar" size="xs" color="on-surface-variant" />
                <Typography variant="body" size="sm" color="on-surface-variant">
                  {event.date}
                </Typography>
              </Stack>
            </Stack>
            <Tag
              label={t(event.tagLabelKey)}
              color={event.tagColor}
              variant="solid"
              tone="light"
              size="sm"
            />
          </Stack>
        ),
      })),
    [upcomingEvents, t],
  );

  return (
    <Card padding="none" variant="outlined">
      <Stack padding="sm" direction="row" gap="sm" align="center">
        <Icon name="calendar" size="md" weight="light" />
        <Typography variant="title" size="lg">
          {t("dashboard.page.upcomingEvents")}
        </Typography>
      </Stack>
      <Divider />
      <List items={items} />
    </Card>
  );
};

export default DashboardUpcomingEvents;
