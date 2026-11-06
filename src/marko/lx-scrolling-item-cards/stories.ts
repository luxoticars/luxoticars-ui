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
  argTypes: {
    scenario: { control: "select", options: ["similar", "promo", "no-overflow", "footer"] },
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
