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
  argTypes: {
    scenario: { control: "select", options: ["similar", "promo", "no-overflow", "footer"] },
  },
};

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
