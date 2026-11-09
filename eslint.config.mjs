import next from "eslint-config-next";

export default [
  ...next,
  { ignores: [".next/**", "node_modules/**", "e2e/**"] },
  // localStorage/location okumaları hydration güvenliği için effect içinde yapılır.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
];
