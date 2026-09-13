import type { Preview } from "@storybook-astro/framework";
import ThemeFrame from "./ThemeFrame.astro";
import "./preview.css";

/**
 * True for the component factory an `.astro` import produces. Stories built on
 * the plain HTML API (`src/html/`) have no `component`, or a component that is
 * not an Astro factory, and must not be routed through the Astro pipeline.
 */
const isAstroComponent = (component: unknown): boolean =>
  typeof component === "function" &&
  (component as { isAstroComponentFactory?: boolean }).isAstroComponentFactory === true;

/**
 * Tokens resolve off `data-theme`, so the theme toolbar wraps every Astro story
 * in ThemeFrame.astro rather than mutating `document`. A decorator that touches
 * the DOM (document.createElement, document.documentElement.dataset...)
 * throws when @storybook-astro/framework composes decorators for the static
 * build, which runs in Node — that silently dropped every Astro story from
 * the published output. ThemeFrame is pure Astro, so it composes correctly
 * in both dev and the static build.
 *
 * The wrapper is applied to Astro stories only. Wrapping a non-Astro story in
 * an Astro component composes a tree whose root has no module id, and the
 * renderer throws "Astro component missing moduleId" for it — a blank canvas
 * and a console error rather than a visible failure, which is how the
 * `HTML/createButton` stories rendered nothing at all. Those stories return
 * their own DOM node, so they are returned unwrapped.
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
    (Story, context) =>
      isAstroComponent(context.component)
        ? { component: ThemeFrame, props: { theme: context.globals.theme } }
        : Story(),
  ],
};

export default preview;
