import { defineConfig } from "@storybook-astro/framework/vitest";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import type { PluginOption } from "vite";

/*
  The Astro Storybook's stories as component tests (@storybook/addon-vitest):
  each renders in headless Chromium, and a story's play function runs and its
  assertions are checked. One project of vitest.config.ts; `npm run test:stories`.
*/
const astro = defineConfig({
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook-astro",
    browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: "chromium" }] },
  },
});

/*
  defineConfig adds "cjs-esm-interop", which rewrites CommonJS in node_modules to
  load through Node's `module.createRequire`. That suits the framework's
  Node-side tests, but the addon runs in a browser, where `module` does not exist
  and the Vitest runner fails to start. Browser mode does not need it.
*/
const withoutPlugin = (plugins: PluginOption, name: string): PluginOption =>
  Array.isArray(plugins)
    ? plugins.map((plugin) => withoutPlugin(plugin, name)).filter((plugin) => plugin !== null)
    : plugins && typeof plugins === "object" && "name" in plugins && plugins.name === name
      ? null
      : plugins;

export default async (env: Parameters<typeof astro>[0]) => {
  const config = await astro(env);
  config.plugins = withoutPlugin(config.plugins, "cjs-esm-interop");
  return config;
};
