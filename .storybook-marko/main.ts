import type { StorybookConfig } from "@storybook/marko-vite";

/*
  The Marko Storybook. `npm run build-storybook` builds it into
  storybook-static/marko/, and the Astro Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows both in one sidebar.

  Stories live in stories-marko/, outside src/, for the reason the Astro
  stories live in stories/: package.json#files ships all of src/.
  @storybook/marko-vite adds @marko/vite itself.
*/
export default {
  framework: "@storybook/marko-vite",
  stories: ["../stories-marko/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
} satisfies StorybookConfig;
