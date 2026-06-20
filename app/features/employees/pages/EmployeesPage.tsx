import { useEmployees } from "~/mocked/hooks/useEmployees";
import Skeleton from "../components/Skeleton";
import Error from "~/components/Error/Error";

function EmployeesPage() {
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  if (isLoading) return <Skeleton />;
  if (error) return <Error onRetry={refetch} error={error} />;

  return <div>EmployeesPage</div>;
};

export default EmployeesPage;
