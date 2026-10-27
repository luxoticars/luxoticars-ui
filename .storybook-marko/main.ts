import type { StorybookConfig } from "@storybook/marko-vite";

/*
  The Marko Storybook. `npm run build-storybook` builds it into
  storybook-static/marko/, and the Astro Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows both in one sidebar.

  Stories live in stories-marko/, outside src/, for the reason the Astro
  stories live in stories/: package.json#files ships all of src/. Tags in the
  new layout (src/marko, lx- prefix) keep stories.ts beside index.marko instead;
  package.json#files leaves them out of the package.
  @storybook/marko-vite adds @marko/vite itself.
*/
export default {
  framework: "@storybook/marko-vite",
  stories: ["../stories-marko/**/*.stories.ts", "../src/marko/**/stories.ts"],
  addons: ["@storybook/addon-docs"],
} satisfies StorybookConfig;
