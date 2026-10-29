import { defineConfig } from "vitest/config";

// One project per Storybook: the two renderers need different plugins.
export default defineConfig({
  test: { projects: ["vitest.astro.config.ts", "vitest.marko.config.ts"] },
});
