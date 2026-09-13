import type { Preview } from "@storybook-astro/framework";
import ThemeFrame from "./ThemeFrame.astro";
import "./preview.css";

/**
 * Tokens resolve off `data-theme`, so the theme toolbar wraps every story in
 * ThemeFrame.astro rather than mutating `document`. A decorator that touches
 * the DOM (document.createElement, document.documentElement.dataset...)
 * throws when @storybook-astro/framework composes decorators for the static
 * build, which runs in Node — that silently dropped every Astro story from
 * the published output. ThemeFrame is pure Astro, so it composes correctly
 * in both dev and the static build.
 */
const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Luxoticars theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  decorators: [
    (_Story, context) => ({
      component: ThemeFrame,
      props: { theme: context.globals.theme },
    }),
  ],
};

export default preview;
