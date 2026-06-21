import { Stack, Typography } from "@zvoove/unity-ui";
import { useTranslation } from "react-i18next";
import { ErrorState } from "~/components/ErrorState";
import { useEmployees } from "~/mocked/hooks/useEmployees";
import { EmployeesTable } from "../components/EmployeesTable";
import { Skeleton } from "../components/Skeleton";

function EmployeesPage() {
  const { t } = useTranslation();
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return (
    <Stack direction="column" gap="md" width="100%">
      <div>
        <Typography variant="display" size="sm">
          {t("employees.page.title")}
        </Typography>
        <Typography variant="body">
          {t("employees.page.description")}
        </Typography>
      </div>
      <EmployeesTable employees={employees} filters={filters} />
    </Stack>
  );
}

export default EmployeesPage;
