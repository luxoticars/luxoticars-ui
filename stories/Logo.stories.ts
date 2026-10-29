import Logo from "../src/astro/Logo.astro";
/*
  Astro components are prerendered to markup by the Storybook framework, and a
  component's `<style>` block is injected as its literal source text — an
  `@import` inside one resolves against the page URL and 404s, so a shared
  stylesheet has to reach the story as a module, the way a consuming app's
  bundler reaches it from the component's frontmatter import.
*/
import "../src/styles/logo.css";

export default {
  title: "Logo",
  component: Logo,
  argTypes: {
    variant: { control: "inline-radio", options: ["white", "black"] },
  },
};

export const Default = {
  args: {
    siteTitle: "Luxoticars",
  },
  // The default variant is white, and the test run renders the light theme
  // whatever the globals say, so the wordmark lands on a light background.
  parameters: { a11y: { test: "todo" } },
};

/** White wordmark, for dark backgrounds: the story opens in the dark theme. */
export const White = {
  args: { variant: "white" },
  globals: { theme: "dark" },
  // The test run renders the light theme whatever the story's globals say.
  parameters: { a11y: { test: "todo" } },
};

/** Black wordmark, for light backgrounds. */
export const Black = {
  args: { variant: "black" },
  globals: { theme: "light" },
};

/** Accent line under "LUX", as the site header uses it. Hover or keyboard focus stretches it. */
export const Accent = {
  args: { variant: "white", accent: true },
  globals: { theme: "dark" },
  parameters: { a11y: { test: "todo" } },
};
