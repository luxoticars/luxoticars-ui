import type { Meta, StoryObj } from "@storybook/marko";
import SiteHeader, { type Input } from "../src/marko/site-header-desktop.marko";

/**
 * `<site-header-desktop>` for Marko 6 apps, the twin of the Astro
 * `SiteHeader`: the links sit in the bar, and a narrow window gets the menu
 * button. Phones get `<site-header-mobile>` instead, picked by the app from
 * the User-Agent. Both are discovered through the package's marko.json, so
 * they need no import:
 *
 * ```marko
 * if=(device === "mobile")
 *   site-header-mobile
 *     @search
 *       my-search-field
 * else
 *   site-header-desktop
 *     @search
 *       my-search-field
 * ```
 */
export default {
  title: "Components/site-header-desktop",
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
