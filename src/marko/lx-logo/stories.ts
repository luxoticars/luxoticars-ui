import type { Meta, StoryObj } from "@storybook/marko";
import Logo, { type Input } from "./index.marko";

/**
 * `<lx-logo>` for Marko 6 apps, the twin of the Astro `Logo` and `createLogo`.
 * Discovered through the package's marko.json: `lx-logo variant="black" accent`.
 */
export default {
  title: "Components/logo",
  component: Logo,
  tags: ["autodocs"],
  argTypes: {
    siteTitle: { control: "text" },
    href: { control: "text" },
    variant: { control: "inline-radio", options: ["white", "black"] },
    accent: { control: "boolean" },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

/** Black wordmark with the accent line, for light backgrounds. */
export const BlackWithAccent: Story = { args: { variant: "black", accent: true }, globals: { theme: "light" } };
