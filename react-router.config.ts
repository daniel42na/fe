import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Client-only SPA — no server-side rendering
  ssr: false,
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
