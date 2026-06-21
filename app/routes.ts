import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export const ROUTES = {
  home: "/",
  employees: "/employees",
} as const;

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route(ROUTES.employees, "routes/employees.tsx"),
  ]),
] satisfies RouteConfig;
