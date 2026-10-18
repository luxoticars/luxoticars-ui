import type { Meta, StoryObj } from "@storybook/marko";
import SiteHeader, { type Input } from "../src/marko/site-header.marko";

/**
 * `<site-header>` for Marko 6 apps, the twin of the Astro `SiteHeader`. It is
 * discovered through the package's marko.json, so it needs no import:
 *
 * ```marko
 * site-header
 *   @search
 *     my-search-field
 * ```
 */
export default {
  title: "Components/site-header",
  component: SiteHeader,
  tags: ["autodocs"],
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

/** No search: the menu always shows beside the wordmark. On phones it opens from the menu button. */
export const WithoutSearch: Story = { args: {} };

/** An external link opens in a new tab and says so to screen readers. */
export const ExternalLink: Story = {
  args: { links: [{ label: "Buy", href: "/search" }, { label: "Blog", href: "https://example.com", external: true }] },
};
