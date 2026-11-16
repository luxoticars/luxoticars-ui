import ScrollingItemCardsDemo from "./ScrollingItemCardsDemo.astro";
import { initScrollingItemCards } from "../../src/scripts/scrolling-item-cards.js";
import { scrollerSource } from "../scrolling-item-cards-cases";
import "../../src/styles/scrolling-item-cards.css";
import "../../src/styles/listing-card.css";
import "../../src/styles/section-head.css";

function rootOf(canvasElement: HTMLElement) {
  const root = canvasElement.querySelector(".scrolling-item-cards");
  if (!root) throw new Error("missing .scrolling-item-cards");
  return root;
}

export default {
  title: "Components/ScrollingItemCards",
  component: ScrollingItemCardsDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Horizontal scroller for slotted cards: native overflow and scroll-snap, plus Previous / Next buttons.

## Navigation buttons: where they sit, and what they cost

\`controlsPlacement\` moves Previous / Next. \`sides\` (default) floats one over each edge of the track. \`top-start\`, \`top-center\`, \`top-end\`, \`bottom-start\`, \`bottom-center\` and \`bottom-end\` put both together in one row above or below the track, so a thumb or a mouse does not have to travel to the far edge, and the buttons never cover a card. In the DOM the row sits where it appears (before the track for \`top-*\`, after it for \`bottom-*\`), so the tab order matches what people see.

Placement is **CSS only**: the script is identical for every option, so it costs 0 extra JS bytes whichever you pick.

| What you pay | \`sides\` (default) | any corner option |
| --- | --- | --- |
| JS (\`scrolling-item-cards.js\`, minified) | 2,002 B raw · 832 B gzip · 711 B brotli | same |
| CSS (\`scrolling-item-cards.css\`, minified) | 3,379 B raw · 900 B gzip · 742 B brotli before this option existed | 3,798 B raw · 973 B gzip · 804 B brotli (**+73 B gzip, +62 B brotli**, once per page, shared by every instance) |
| HTML per instance | 0 B | \`bottom-end\` +50 B · \`bottom-start\` +88 B · \`bottom-center\` +89 B · \`top-end\` +86 B · \`top-center\` +125 B (raw; repeated class names compress to a few bytes) |

Why it stays this small:

- Bottom and end are the CSS defaults, so \`bottom-end\` emits no modifier class at all, only the one wrapper \`div\`.
- Per instance, \`sides\` pays nothing for the corner options: it renders no wrapper and no modifier.
- The prev/next buttons are rendered once per instance whichever option you pick; moving them costs no extra icons.
- No new listeners, observers or measuring code: the same enable/disable logic drives all placements.

Numbers are minified with esbuild and compressed at gzip level 9 / default brotli, measured against the stylesheet before this option was added. The page that never uses a corner option still receives the extra ~419 raw bytes of CSS, because the components import one stylesheet: if that matters to you, the cost is 73 B on the wire.
`,
      },
    },
  },
  argTypes: {
    scenario: { control: "select", options: ["similar", "promo", "no-overflow", "footer"] },
    controlsPlacement: {
      control: "select",
      options: ["sides", "top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end"],
      description: "Where Previous / Next sit. CSS only; no extra JS.",
      table: { defaultValue: { summary: "sides" } },
    },
  },
};

type Rect = { top: number; bottom: number; left: number; right: number };
const rectOf = (el: Element): Rect => el.getBoundingClientRect();

async function settle(root: Element) {
  initScrollingItemCards(root);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export const SimilarCars = {
  args: { scenario: "similar" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    if (root.getAttribute("aria-labelledby") !== "similar-cars") {
      throw new Error("Similar cars must name the section via headingId");
    }
    const imgs = [...root.querySelectorAll("img.listing-card__image")];
    if (imgs.length < 4) throw new Error("Similar cars needs at least four cards");
    if (imgs[0].getAttribute("fetchpriority") !== "high") throw new Error("first image fetchpriority");
    if (imgs.slice(1).some((img) => img.getAttribute("loading") !== "lazy")) {
      throw new Error("remaining images must be loading=lazy");
    }
    const links = root.querySelectorAll("a.listing-card__link");
    if (links.length !== imgs.length) throw new Error("one stretched link per card");
    // The Astro Storybook dev renderer does not execute component scripts.
    // The static-build test covers the component's automatic install path.
    initScrollingItemCards(root);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!next || next.hasAttribute("hidden")) {
      throw new Error("next should be shown when the scroller overflows");
    }
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.SimilarCars } } },
};
export const Promo = {
  args: { scenario: "promo" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    if (root.getAttribute("aria-label") !== "Featured cars") throw new Error("promo label");
    if (!root.querySelector(".scrolling-item-cards__title-card")) throw new Error("missing title-card");
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.Promo } } },
};
export const NoOverflow = {
  args: { scenario: "no-overflow" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    initScrollingItemCards(root);
    const prev = root.querySelector(".scrolling-item-cards__control--prev");
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!prev?.hasAttribute("hidden") || !next?.hasAttribute("hidden")) {
      throw new Error("buttons should stay hidden when there is no overflow");
    }
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.NoOverflow } } },
};
export const WithFooter = {
  args: { scenario: "footer" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    if (root.getAttribute("aria-labelledby") !== "with-footer") throw new Error("footer headingId");
    const footer = root.querySelector(".scrolling-item-cards__footer");
    if (!footer || !footer.textContent?.includes("Prices include taxes.")) {
      throw new Error("footer slot");
    }
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.WithFooter } } },
};

export const ControlsBottomEnd = {
  args: { scenario: "similar", controlsPlacement: "bottom-end" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    await settle(root);
    const group = root.querySelector(".scrolling-item-cards__controls");
    const track = root.querySelector(".scrolling-item-cards__track");
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!group || !track || !next) throw new Error("controls row, track and next must render");
    if (group.className !== "scrolling-item-cards__controls") {
      throw new Error("bottom-end is the default and must add no modifier class");
    }
    if (root.querySelectorAll(".scrolling-item-cards__control").length !== 2) throw new Error("two controls");
    if (group.previousElementSibling !== track.parentElement) {
      throw new Error("bottom controls must come after the track in the DOM (tab order = visual order)");
    }
    if (rectOf(group).top < rectOf(track).bottom - 1) throw new Error("bottom controls must sit below the track");
    if (rectOf(next).right < rectOf(root).right - 2) throw new Error("end controls must align to the end edge");
    if (next.hasAttribute("hidden")) throw new Error("next should show when the scroller overflows");
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.ControlsBottomEnd } } },
};
export const ControlsTopStart = {
  args: { scenario: "similar", controlsPlacement: "top-start" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    await settle(root);
    const group = root.querySelector(".scrolling-item-cards__controls--top.scrolling-item-cards__controls--start");
    const track = root.querySelector(".scrolling-item-cards__track");
    const prev = root.querySelector(".scrolling-item-cards__control--prev");
    if (!group || !track || !prev) throw new Error("top-start controls row must render");
    if (group.nextElementSibling !== track.parentElement) {
      throw new Error("top controls must come before the track in the DOM");
    }
    if (rectOf(group).bottom > rectOf(track).top + 1) throw new Error("top controls must sit above the track");
    if (rectOf(prev).left > rectOf(root).left + 2) throw new Error("start controls must align to the start edge");
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.ControlsTopStart } } },
};
export const ControlsBottomCenter = {
  args: { scenario: "similar", controlsPlacement: "bottom-center" },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = rootOf(canvasElement);
    await settle(root);
    const prev = root.querySelector(".scrolling-item-cards__control--prev");
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!prev || !next) throw new Error("controls must render");
    const mid = (rectOf(prev).left + rectOf(next).right) / 2;
    const rootMid = (rectOf(root).left + rectOf(root).right) / 2;
    if (Math.abs(mid - rootMid) > 2) throw new Error("centered controls must be centered");
  },
  parameters: { docs: { source: { language: "astro", code: scrollerSource.ControlsBottomCenter } } },
};
