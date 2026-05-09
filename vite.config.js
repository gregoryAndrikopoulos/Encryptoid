import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setupUnitTests.js"],
    globals: true,
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
    css: true,
  },
});
