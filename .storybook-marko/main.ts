import type { StorybookConfig } from "@storybook/marko-vite";

/*
  The Marko Storybook. `npm run build-storybook` builds it into
  storybook-static/marko/, and the Astro Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows both in one sidebar.

  Each tag keeps its stories.ts beside its index.marko (under src/marko, one folder per tag);
  package.json#files leaves them out of the package. The data the price stories
  share lives in stories-marko/, outside src/.
  @storybook/marko-vite adds @marko/vite itself.
*/
export default {
  framework: "@storybook/marko-vite",
  stories: ["../src/marko/**/stories.ts"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
} satisfies StorybookConfig;
