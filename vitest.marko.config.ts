import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/*
  The Marko Storybook's stories as component tests (@storybook/addon-vitest):
  each renders in headless Chromium, and a story's play function runs and its
  assertions are checked. One project of vitest.config.ts; `npm run test:stories`.
*/
export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook-marko" })],
  test: {
    name: "storybook-marko",
    browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: "chromium" }] },
  },
});
