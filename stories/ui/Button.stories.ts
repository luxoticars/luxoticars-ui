import { css, variants } from "virtual:astro-story/ui/Button";
import { renderAstro } from "../render-astro";

const story = (key: keyof typeof variants) => ({
  render: () => renderAstro(css, variants[key], "astro-style-button"),
});

export default {
  title: "Components/Button",
  parameters: {
    docs: {
      description: {
        component:
          "Renders a <button>, or an <a> when `href` is set. Colours come from " +
          "the shared design tokens in src/styles/tokens.css — switch the " +
          "background between Dark and Light to check both themes. Variants " +
          "live in stories/ui/Button.variants.ts.",
      },
    },
  },
};

export const Default = story("Default");
export const Destructive = story("Destructive");
export const Outline = story("Outline");
export const Secondary = story("Secondary");
export const Ghost = story("Ghost");
export const Link = story("Link");
export const Success = story("Success");
export const Warning = story("Warning");
export const Info = story("Info");
export const WithRightIcon = story("WithRightIcon");
export const IconOnly = story("IconOnly");
export const Pill = story("Pill");
export const AsLink = story("AsLink");
export const DisabledLink = story("DisabledLink");
export const DisabledButton = story("DisabledButton");
