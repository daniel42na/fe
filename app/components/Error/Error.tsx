import { Button, Icon, Stack, Typography } from '@zvoove/unity-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  error: Error;
  onRetry: () => void;
};

const Error = ({ onRetry, error }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack direction="column" align="center" justify="center" height="100%">
      <Typography>{t(error?.message || "error.unknown")}</Typography>
      <Button variant="filled" color="primary" onClick={onRetry}>
        <Icon name="refresh" />
        <Typography color="on-primary">{t("error.retry")}</Typography>
      </Button>
    </Stack>
  );
};

export default Error;
