import type { Meta, StoryObj } from "@storybook/marko";
import Demo, { type Input } from "./demo.marko";

function rootOf(canvasElement: HTMLElement) {
  const root = canvasElement.querySelector(".scrolling-item-cards");
  if (!root) throw new Error("missing .scrolling-item-cards");
  return root;
}

export default {
  title: "Components/scrolling-item-cards",
  component: Demo,
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
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const SimilarCars: Story = {
  args: { scenario: "similar" },
  play: async ({ canvasElement }) => {
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
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!next || next.hasAttribute("hidden")) {
      throw new Error("next should be shown when the scroller overflows");
    }
  },
};

export const Promo: Story = {
  args: { scenario: "promo" },
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    if (root.getAttribute("aria-label") !== "Featured cars") throw new Error("promo label");
    if (!root.querySelector(".scrolling-item-cards__title-card")) throw new Error("missing title-card");
  },
};

export const NoOverflow: Story = {
  args: { scenario: "no-overflow" },
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    const prev = root.querySelector(".scrolling-item-cards__control--prev");
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!prev?.hasAttribute("hidden") || !next?.hasAttribute("hidden")) {
      throw new Error("buttons should stay hidden when there is no overflow");
    }
  },
};

export const WithFooter: Story = {
  args: { scenario: "footer" },
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    if (root.getAttribute("aria-labelledby") !== "with-footer") throw new Error("footer headingId");
    const footer = root.querySelector(".scrolling-item-cards__footer");
    if (!footer || !footer.textContent?.includes("Prices include taxes.")) {
      throw new Error("footer slot");
    }
  },
};

export const ControlsBottomEnd: Story = {
  args: { scenario: "similar", controlsPlacement: "bottom-end" },
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const group = root.querySelector(".scrolling-item-cards__controls");
    const track = root.querySelector(".scrolling-item-cards__track");
    const next = root.querySelector(".scrolling-item-cards__control--next");
    if (!group || !track || !next) throw new Error("controls row, track and next must render");
    if (group.className !== "scrolling-item-cards__controls") throw new Error("bottom-end adds no modifier class");
    if (group.getBoundingClientRect().top < track.getBoundingClientRect().bottom - 1) {
      throw new Error("bottom controls must sit below the track");
    }
    if (next.getBoundingClientRect().right < root.getBoundingClientRect().right - 2) {
      throw new Error("end controls must align to the end edge");
    }
  },
};

export const ControlsTopStart: Story = {
  args: { scenario: "similar", controlsPlacement: "top-start" },
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const group = root.querySelector(".scrolling-item-cards__controls--top.scrolling-item-cards__controls--start");
    const track = root.querySelector(".scrolling-item-cards__track");
    const prev = root.querySelector(".scrolling-item-cards__control--prev");
    if (!group || !track || !prev) throw new Error("top-start controls row must render");
    if (group.getBoundingClientRect().bottom > track.getBoundingClientRect().top + 1) {
      throw new Error("top controls must sit above the track");
    }
    if (prev.getBoundingClientRect().left > root.getBoundingClientRect().left + 2) {
      throw new Error("start controls must align to the start edge");
    }
  },
};
