import { Button, Grid, Stack, Typography } from "@zvoove/unity-ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ErrorState } from "~/components/ErrorState";
import { useDashboard } from "~/mocked/hooks/useDashboard";
import { ROUTES } from "~/routes";
import { DashboardActivityFeed } from "../components/DashboardActivityFeed";
import { DashboardKpis } from "../components/DashboardKpis";
import { DashboardOnboardingProgress } from "../components/DashboardOnboardingProgress";
import { DashboardRecentInfo } from "../components/DashboardRecentInfo";
import { DashboardUpcomingEvents } from "../components/DashboardUpcomingEvents";
import { Skeleton } from "../components/Skeleton";

function DashboardPage() {
  const { t } = useTranslation();
  const { dashboard, isLoading, error, refetch } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  const handleBrowseEmployees = () => {
    navigate(ROUTES.employees);
  };

  return (
    <Stack direction="column" gap="lg" width="100%">
      <Stack
        direction={{ minimum: "column", tablet: "row" }}
        gap="sm"
        justify="space-between"
        width="100%"
      >
        <div className="flex w-full flex-col tablet:flex-1">
          <Typography variant="display" size="sm">
            {t("dashboard.page.title")}
          </Typography>
          <Typography variant="body">
            {t("dashboard.page.description")}
          </Typography>
        </div>
        <Stack
          direction="row"
          gap="sm"
          align={{ minimum: "stretch", tablet: "flex-end" }}
          justify={{ minimum: "flex-start", tablet: "flex-end" }}
          wrap="wrap"
          width={{ minimum: "100%", tablet: "fit-content" }}
        >
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

      <DashboardRecentInfo
        activities={dashboard?.activities ?? []}
        onboardingProgress={dashboard?.onboardingProgress ?? []}
      />

      <DashboardKpis kpis={dashboard?.kpis ?? []} />

      <Grid columns={{ minimum: 1, laptop: "2fr 1fr" }} gap="md" width="100%">
        <Grid.Item>
          <DashboardActivityFeed
            activities={dashboard?.activities ?? []}
            onRefresh={refetch}
          />
        </Grid.Item>
        <Grid.Item>
          <Stack direction="column" gap="md" height="100%">
            <DashboardUpcomingEvents
              upcomingEvents={dashboard?.upcomingEvents ?? []}
            />
            <DashboardOnboardingProgress
              onboardingProgress={dashboard?.onboardingProgress ?? []}
            />
          </Stack>
        </Grid.Item>
      </Grid>
    </Stack>
  );
}

export default DashboardPage;
