import { defineConfig } from "vitest/config";

// One project per Storybook: host (HTML, Skin), Astro components, Marko tags.
export default defineConfig({
  test: { projects: ["vitest.host.config.ts", "vitest.astro.config.ts", "vitest.marko.config.ts"] },
});
