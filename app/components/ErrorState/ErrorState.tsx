import { Button, Icon, Stack, Typography } from "@zvoove/unity-ui";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  error?: Error;
  onRetry: () => void;
};

const ErrorState = ({ onRetry, error }: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const messageKey = error?.message || "error.unknown";

  return (
    <Stack direction="column" align="center" justify="center" height="100%">
      <Typography>{t([messageKey, "error.unknown"])}</Typography>
      <Button variant="filled" color="primary" onClick={onRetry}>
        <Icon name="refresh" />
        <Typography color="on-primary">{t("error.retry")}</Typography>
      </Button>
    </Stack>
  );
};

export default ErrorState;
