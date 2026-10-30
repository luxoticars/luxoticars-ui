import type { Meta, StoryObj } from "@storybook/marko";
import SiteHeader, { type Input } from "./index.marko";
import ScrollDemo from "./scroll-demo.stories.marko";
import desktopEntry from "./desktop.entry.marko";
import mobileEntry from "./mobile.entry.marko";
// Hide on scroll is an opt-in stylesheet no entry imports; the stories load
// it so the scroll demos slide, as an app that opts in would.
import "./hide-on-scroll.css";
import "./frosted-on-scroll.css";

/**
 * `<lx-site-header>` for Marko 6 apps, the twin of the Astro `SiteHeader`.
 *
 * ### `entry`: desktop or phone, chosen by the app
 *
 * The header comes in two builds, `desktop.entry.marko` and
 * `mobile.entry.marko`, and `entry` says which one this request gets. The app
 * decides, once per request, from whatever it already knows about the device
 * (the User-Agent, a client hint, a cookie); this package does not sniff
 * devices or switch builds in the browser. Each entry loads only its own
 * stylesheet, so a phone never downloads the desktop layout.
 *
 * - **desktop**: the links sit in the bar; a narrow window (or the search
 *   taking their place) swaps them for the menu button.
 * - **mobile**: the menu button alone, at every width.
 *
 * ```marko
 * import desktop from "@luxoticars/ui/marko/lx-site-header/desktop.entry.marko"
 * import mobile from "@luxoticars/ui/marko/lx-site-header/mobile.entry.marko"
 *
 * // isPhone is the app's own call, e.g. from the request's User-Agent.
 * lx-site-header entry=(isPhone ? mobile : desktop)
 *   @search
 *     my-search-field
 * ```
 *
 * ### Hide on scroll
 *
 * Scrolling down slides the bar out of view and scrolling up brings it back.
 * It stays while its menu is open or it has focus, and never moves under
 * reduced motion. The header's script sets the scroll direction;
 * `scroll-state(scrolled: bottom)` does the same where the browser applies it.
 *
 * The slide is an opt-in stylesheet, so a page that does not want it never
 * downloads it: no entry imports it. Import it once in the app to turn it on:
 *
 * ```marko
 * import "@luxoticars/ui/marko/lx-site-header/hide-on-scroll.css"
 * ```
 *
 * After a hide, scrolling up brings the bar back frosted (`data-scroll-dir=up`)
 * where `backdrop-filter` works; solid otherwise and under reduced motion.
 * That is a second opt-in stylesheet:
 *
 * ```marko
 * import "@luxoticars/ui/marko/lx-site-header/frosted-on-scroll.css"
 * ```
 *
 * `hideOnScroll` is on by default but only marks the bar for that stylesheet;
 * without it the bar stays at the top. `hideOnScroll=false` keeps it there
 * even with the stylesheet. These stories import it: try the *Scroll* stories
 * below.
 */
export default {
  title: "Components/site-header",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: { bleed: true },
  args: { hideOnScroll: true },
  argTypes: {
    entry: { table: { disable: true } },
    siteTitle: { control: "text" },
    homeHref: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    links: { control: "object" },
    hideOnScroll: {
      control: "boolean",
      description: "Slide the bar away while the page scrolls down, back on scrolling up.",
      table: { defaultValue: { summary: "true" } },
    },
    search: { table: { disable: true } },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

const externalLink = [
  { label: "Buy", href: "/search" },
  { label: "Blog", href: "https://example.com", external: true },
];

/*
  The header over a page of text, so the canvas scrolls. On the docs page each
  is its own small frame, scrolled inside, rather than a long stretch of the
  docs page.
*/
const scrolling = {
  render: (args) => ({ component: ScrollDemo, input: args }),
  parameters: { docs: { story: { inline: false, iframeHeight: 480 } } },
} satisfies Story;

/** The links sit in the bar. A narrow window gets the menu button. */
export const Desktop: Story = { args: { entry: desktopEntry } };

/** An external link opens in a new tab and says so to screen readers. */
export const DesktopExternalLink: Story = { args: { entry: desktopEntry, links: externalLink } };

/** The menu button alone, at every width; the links open from it. */
export const Mobile: Story = { args: { entry: mobileEntry } };

/** An external link in the phone menu opens in a new tab and says so. */
export const MobileExternalLink: Story = { args: { entry: mobileEntry, links: externalLink } };

/**
 * Scroll the canvas: down hides the bar, up brings it back. Open the menu or
 * tab into the bar and it stays. Flip `hideOnScroll` in Controls to compare.
 */
export const DesktopScroll: Story = { ...scrolling, args: { entry: desktopEntry } };

/** The phone bar, hiding the same way. Try it at a phone width. */
export const MobileScroll: Story = { ...scrolling, args: { entry: mobileEntry } };

/** `hideOnScroll=false`: the bar stays at the top however the page scrolls. */
export const HideOnScrollOff: Story = { ...scrolling, args: { entry: desktopEntry, hideOnScroll: false } };
