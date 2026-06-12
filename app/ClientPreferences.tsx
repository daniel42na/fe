import { useEffect } from "react";

import { applyPersistedTheme } from "./theme/useTheme";

export function ClientPreferences({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyPersistedTheme();
  }, []);

  return children;
}
