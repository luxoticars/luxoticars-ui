import type { StorybookConfig } from "@storybook/html-vite";
import { astroStories } from "./astro-stories.ts";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/html-vite", options: {} },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), astroStories()];
    return config;
  },
};

export default config;
