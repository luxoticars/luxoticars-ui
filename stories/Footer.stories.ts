import { css, variants } from "virtual:astro-story/Footer";
import { renderAstro } from "./render-astro";

const story = (key: keyof typeof variants) => ({
  render: () => renderAstro(css, variants[key], "astro-style-footer"),
});

export default {
  title: "Components/Footer",
  parameters: {
    docs: {
      description: {
        component:
          "The site footer shared by luxoticars-homepage and luxoticars-vi. " +
          "Rendered through Astro in Node, so what you see is the real compiled " +
          "markup with its real scoped styles. Variants live in stories/Footer.variants.ts.",
      },
    },
  },
};

export const Default = story("Default");
export const Homepage = story("Homepage");
export const Vi = story("Vi");
export const CustomLogo = story("CustomLogo");
export const Minimal = story("Minimal");
export const ExternalLinks = story("ExternalLinks");

/** Narrow viewport, where the columns stack. */
export const Mobile = {
  ...story("Default"),
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
