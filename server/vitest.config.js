import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["server/tests/**/*.spec.js"],
    reporters: "default",
    testTimeout: 15000,
  },
});
