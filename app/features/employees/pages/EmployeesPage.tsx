import { useEmployees } from "~/mocked/hooks/useEmployees";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "~/components/ErrorState";

function EmployeesPage() {
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return <div>EmployeesPage</div>;
}

export default EmployeesPage;
