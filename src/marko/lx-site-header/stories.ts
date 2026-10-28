import type { Meta, StoryObj } from "@storybook/marko";
import SiteHeader, { type Input } from "./index.marko";
import desktopEntry from "./desktop.entry.marko";
import mobileEntry from "./mobile.entry.marko";

/**
 * `<lx-site-header>` for Marko 6 apps, the twin of the Astro `SiteHeader`. The
 * app picks the entry once per request (from the User-Agent, say) and passes it
 * in; this package does not classify devices. The desktop entry puts the links
 * in the bar and gives a narrow window the menu button; the mobile entry has
 * the menu button alone, at every width. Each entry loads only its own
 * stylesheet.
 *
 * ```marko
 * import desktop from "@luxoticars/ui/marko/lx-site-header/desktop.entry.marko"
 * import mobile from "@luxoticars/ui/marko/lx-site-header/mobile.entry.marko"
 *
 * lx-site-header entry=(isPhone ? mobile : desktop)
 *   @search
 *     my-search-field
 * ```
 */
export default {
  title: "Components/site-header",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: { bleed: true },
  argTypes: {
    entry: { table: { disable: true } },
    siteTitle: { control: "text" },
    homeHref: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    links: { control: "object" },
    search: { table: { disable: true } },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

const externalLink = [
  { label: "Buy", href: "/search" },
  { label: "Blog", href: "https://example.com", external: true },
];

/** The links sit in the bar. A narrow window gets the menu button. */
export const Desktop: Story = { args: { entry: desktopEntry } };

/** An external link opens in a new tab and says so to screen readers. */
export const DesktopExternalLink: Story = { args: { entry: desktopEntry, links: externalLink } };

/** The menu button alone, at every width; the links open from it. */
export const Mobile: Story = { args: { entry: mobileEntry } };

/** An external link in the phone menu opens in a new tab and says so. */
export const MobileExternalLink: Story = { args: { entry: mobileEntry, links: externalLink } };
