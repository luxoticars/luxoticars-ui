import type { Meta, StoryObj } from "@storybook/marko";
import SiteHeader, { type Input } from "../src/marko/site-header-mobile.marko";

/**
 * `<site-header-mobile>`: the phone header. The links live only in the menu,
 * so the bar holds the wordmark, the button and the menu button at every
 * width, and the page ships less HTML and script than `<site-header-desktop>`.
 */
export default {
  title: "Components/site-header-mobile",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: { bleed: true },
  argTypes: {
    siteTitle: { control: "text" },
    homeHref: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    links: { control: "object" },
    search: { table: { disable: true } },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

/** The menu button opens the links. */
export const WithoutSearch: Story = { args: {} };

/** An external link opens in a new tab and says so to screen readers. */
export const ExternalLink: Story = {
  args: { links: [{ label: "Buy", href: "/search" }, { label: "Blog", href: "https://example.com", external: true }] },
};
