import SiteHeaderScrollDemo from "./SiteHeaderScrollDemo.astro";
import { wireHideOnScroll } from "../src/scripts/site-header-hide-on-scroll.js";
/*
  The header's styles reach it through a frontmatter import, which the
  Storybook framework does not follow for prerendered stories, so they are
  imported here as well, with the logo's.
*/
import "../src/styles/site-header.css";
import "../src/styles/logo.css";
import "./site-header-demo.css";
/*
  Hide on scroll is an opt-in stylesheet the component never imports; the
  stories load it so the scroll demos slide, as an app that opts in would.
*/
import "../src/styles/site-header-hide-on-scroll.css";

/**
 * The site's sticky header. By default it slides out of view while the page
 * scrolls down and comes back on scrolling up (`hideOnScroll`); the *Hide on
 * scroll* and *Always visible* stories put a page of text under it to try
 * that.
 *
 * The slide lives in an opt-in stylesheet, so a site that does not want it
 * never downloads it. `SiteHeader` does not import it; import it once in the
 * app, next to the header's own styles, to turn hide on scroll on:
 *
 * ```js
 * import "@luxoticars/ui/styles/site-header-hide-on-scroll.css";
 * ```
 *
 * ```astro
 * <SiteHeader />                      <!-- hides on scroll down, with the stylesheet -->
 * <SiteHeader hideOnScroll={false} /> <!-- always at the top -->
 * ```
 *
 * Without that stylesheet the bar stays at the top whatever `hideOnScroll`
 * says: the prop and its small script only mark the bar for it. These
 * stories import it.
 *
 * Every story here is prerendered to static markup, so on the published
 * Storybook the Controls panel changes nothing: each variant is its own story.
 * The props table belongs to the stories' wrapper (`SiteHeaderScrollDemo`),
 * which adds `page` to `SiteHeader`'s own props.
 */
export default {
  title: "Components/SiteHeader",
  component: SiteHeaderScrollDemo,
  // Not a component test: the header's `<script>` is TypeScript, which the Vitest
  // browser runner executes as plain JavaScript once the story is rendered, and fails
  // to parse ("Unexpected token ':'"). The story is still built and shown in Storybook.
  tags: ["autodocs", "!test"],
  argTypes: {
    slots: { table: { disable: true } },
    page: { table: { disable: true } },
  },
};

/*
  The header's own <script> does not run in these prerendered stories (as with
  Dialog's), so the story wires the scroll-direction script itself once
  rendered. A no-op with `hideOnScroll={false}`. Each render drops the previous
  one's listener.
*/
let unwire: AbortController | undefined;

/*
  A page of text under the header, in its own small frame on the docs page,
  scrolled inside, rather than a long stretch of the docs page.
*/
const scrolling = {
  parameters: { docs: { story: { inline: false, iframeHeight: 480 } } },
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    unwire?.abort();
    unwire = new AbortController();
    const header = canvasElement.querySelector<HTMLElement>("[data-site-header]");
    if (header) wireHideOnScroll(header, unwire.signal);
  },
};

/** No search: the menu always shows beside the wordmark. On phones it opens from the menu button. */
export const WithoutSearch = {
  args: {},
};

/** With a search field in the `search` slot. Below 75rem the search takes the menu's place. */
export const WithSearch = {
  args: {
    slots: {
      search: "<span>Search inventory</span>",
    },
  },
};

/**
 * The default. Scroll the canvas: down hides the bar, up brings it back. Open
 * the menu or tab into the bar and it stays put.
 */
export const HideOnScroll = {
  ...scrolling,
  args: { page: true },
};

/** `hideOnScroll={false}`: the bar stays at the top however the page scrolls. */
export const AlwaysVisible = {
  ...scrolling,
  args: { page: true, hideOnScroll: false },
};
