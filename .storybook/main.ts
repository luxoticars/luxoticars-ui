import type { StorybookConfig } from "@storybook-astro/framework";
import tailwindcss from "@tailwindcss/vite";

/*
  Stories live in `stories/` rather than beside their components because
  `package.json#files` ships all of `src/`, and co-located stories would land
  in every consumer's node_modules.
*/
const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  /*
    The Marko Storybook (.storybook-marko/), composed into this one so both
    renderers share one sidebar. In development it is its own dev server
    (`npm run storybook:marko`, port 6007). In the static build it is built
    into storybook-static/marko/, so a relative URL works both at the custom
    domain root and under a fork's /luxoticars-ui/ path.
  */
  refs: (_config, { configType }) => ({
    marko: {
      title: "Marko",
      url: configType === "DEVELOPMENT" ? "http://localhost:6007" : "./marko",
    },
  }),
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
