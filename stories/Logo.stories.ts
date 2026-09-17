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
};

export const Default = {
  args: {
    siteTitle: "Luxoticars",
  },
};
