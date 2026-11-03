import type { StorybookConfig } from "@storybook-astro/framework";
import tailwindcss from "@tailwindcss/vite";
import { ASTRO_STORY_GLOBS } from "../.storybook/story-globs";

/*
  The Astro Storybook: every Astro component story (Components/*).
  `npm run build-storybook` builds it into storybook-static/astro/, and the
  host Storybook (.storybook/main.ts) composes it through `refs` as "Astro".
  In development it is its own dev server (`npm run storybook:astro`, port 6008).

  It has no `refs` of its own; only the host composes. Which story files it
  picks up is decided by the globs in .storybook/story-globs.ts.
*/
const config: StorybookConfig = {
  stories: ASTRO_STORY_GLOBS,
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      // The published Storybook is a static GitHub Pages artifact.
      renderMode: "static",
    },
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
