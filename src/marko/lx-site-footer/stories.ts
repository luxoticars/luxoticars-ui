import type { Meta, StoryObj } from "@storybook/marko";
import SiteFooter, { type Input } from "./index.marko";
import desktopEntry from "./desktop.entry.marko";
import mobileEntry from "./mobile.entry.marko";

/**
 * `<lx-site-footer>` for Marko 6 apps, the twin of the Astro `Footer`. The app
 * picks the entry once per request (from the User-Agent, say) and passes it in;
 * this package does not classify devices. The desktop entry lays the columns out
 * side by side as the window widens; the mobile entry is one column at every
 * width. Each entry loads only its own stylesheet. Every list and text is
 * optional and defaults to the live Luxoticars footer.
 *
 * ```marko
 * import desktop from "@luxoticars/ui/marko/lx-site-footer/desktop.entry.marko"
 * import mobile from "@luxoticars/ui/marko/lx-site-footer/mobile.entry.marko"
 *
 * lx-site-footer entry=(isPhone ? mobile : desktop)
 * ```
 */
export default {
  title: "Components/site-footer",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: { bleed: true },
  argTypes: {
    entry: { table: { disable: true } },
    logo: { table: { disable: true } },
    idPrefix: { control: "text" },
    siteTitle: { control: "text" },
    homeHref: { control: "text" },
    tagline: { control: "text" },
    brandsHeading: { control: "text" },
    brandLinks: { control: "object" },
    companyHeading: { control: "text" },
    companyLinks: { control: "object" },
    enquiriesHeading: { control: "text" },
    enquiriesText: { control: "text" },
    contacts: { control: "object" },
    socials: { control: "object" },
    legalLinks: { control: "object" },
    copyright: { control: "text" },
    year: { control: "number" },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

/** Two columns from 40rem, twelve from 64rem. */
export const Desktop: Story = { args: { entry: desktopEntry, year: 2026 } };

/** One column, a stacked masthead and a stacked bottom bar at every width. */
export const Mobile: Story = { args: { entry: mobileEntry, year: 2026 } };

/** No socials and no contacts: the masthead and the Enquiries column drop out. */
export const Minimal: Story = { args: { entry: desktopEntry, year: 2026, socials: [], contacts: [] } };
