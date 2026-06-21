import {
  Avatar,
  Button,
  Card,
  Divider,
  Grid,
  Icon,
  InfoBox,
  List,
  ProgressIndicator,
  Stack,
  Tag,
  Typography,
} from "@zvoove/unity-ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ErrorState } from "~/components/ErrorState";
import { useDashboard } from "~/mocked/hooks/useDashboard";
import { ROUTES } from "~/routes";
import { Skeleton } from "../components/Skeleton";

function DashboardPage() {
  const { t } = useTranslation();
  const { dashboard, isLoading, error, refetch } = useDashboard();
  const navigate = useNavigate();

  const infoBoxMessage = useMemo(() => {
    const applications =
      dashboard?.activities.filter(
        (activity) =>
          activity.actionKey === "dashboard.activity.newApplication",
      ).length ?? 0;
    const onboarding = dashboard?.onboardingProgress.length ?? 0;

    return `${applications} ${t("dashboard.page.infoBoxApplications")}. ${onboarding} ${t("dashboard.page.infoBoxOnboarding")}.`;
  }, [t, dashboard?.activities, dashboard?.onboardingProgress]);

  const activityItems = useMemo(
    () =>
      (dashboard?.activities ?? []).map((activity) => ({
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
    [dashboard?.activities, t],
  );

  const upcomingEventItems = useMemo(
    () =>
      (dashboard?.upcomingEvents ?? []).map((event) => ({
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
    [dashboard?.upcomingEvents, t],
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  const handleBrowseEmployees = () => {
    navigate(ROUTES.employees);
  };

  const kpis = dashboard?.kpis ?? [];
  const onboardingProgress = dashboard?.onboardingProgress ?? [];

  return (
    <Stack direction="column" gap="lg" width="100%">
      <Stack direction="row" gap="sm" justify="space-between">
        <div>
          <Typography variant="display" size="sm">
            {t("dashboard.page.title")}
          </Typography>
          <Typography variant="body">
            {t("dashboard.page.description")}
          </Typography>
        </div>
        <Stack direction="row" gap="sm" align="flex-end">
          <Button
            onClick={handleBrowseEmployees}
            variant="outlined"
            size="md"
            icon="add"
          >
            {t("dashboard.page.action.employees.add")}
          </Button>
          <Button
            onClick={handleBrowseEmployees}
            variant="filled"
            size="md"
            icon="users"
          >
            {t("dashboard.page.action.employees.browse")}
          </Button>
        </Stack>
      </Stack>

      <InfoBox variant="subtle" icon="info" message={infoBoxMessage} />

      <Grid
        columns={{ minimum: 1, mobile: 2, laptop: 4 }}
        gap="md"
        width="100%"
      >
        {Array.isArray(kpis) &&
          kpis.map((kpi) => (
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
                    <Typography
                      variant="label"
                      size="sm"
                      color={kpi.changeColor}
                    >
                      {kpi.change}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Item>
          ))}
      </Grid>
      <Grid columns={{ minimum: 1, laptop: "2fr 1fr" }} gap="md" width="100%">
        <Grid.Item>
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
                <Button variant="linkPrimary" icon="refresh" onClick={refetch}>
                  {t("dashboard.page.refresh")}
                </Button>
              </Stack>
              <Divider />
              <List items={activityItems} height="100%" spread="top" />
            </div>
          </Card>
        </Grid.Item>
        <Grid.Item>
          <Stack direction="column" gap="md" height="100%">
            <Card padding="none" variant="outlined">
              <Stack padding="sm" direction="row" gap="sm" align="center">
                <Icon name="calendar" size="md" weight="light" />
                <Typography variant="title" size="lg">
                  {t("dashboard.page.upcomingEvents")}
                </Typography>
              </Stack>
              <Divider />
              <List items={upcomingEventItems} />
            </Card>
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
                  <Stack
                    key={step.labelKey}
                    direction="column"
                    gap="xs"
                    width="100%"
                  >
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
          </Stack>
        </Grid.Item>
      </Grid>
    </Stack>
  );
}

export default DashboardPage;
