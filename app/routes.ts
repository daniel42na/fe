import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("employees", "routes/employees.tsx"),
  ]),
] satisfies RouteConfig;
