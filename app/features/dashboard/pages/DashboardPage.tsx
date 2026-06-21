import { ErrorState } from "~/components/ErrorState";
import { useDashboard } from "~/mocked/hooks/useDashboard";
import { Skeleton } from "../components/Skeleton";

function DashboardPage() {
  const { dashboard, isLoading, error, refetch } = useDashboard();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return <div>DashboardPage</div>;
}

export default DashboardPage;
