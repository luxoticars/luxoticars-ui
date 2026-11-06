import ListingCard from "../../src/astro/ui/ListingCard.astro";
import {
  assertListingCardTree,
  cases,
  listingCardSource,
  type ListingCardCase,
} from "../listing-card-cases";
import "../../src/styles/listing-card.css";

const toArgs = (c: ListingCardCase) => ({
  href: c.href,
  headingLevel: c.headingLevel,
  headingId: c.headingId,
  linkLabel: c.linkLabel,
  class: c.class,
  slots: {
    ...(c.slots.media ? { media: c.slots.media } : {}),
    ...(c.slots.kicker ? { kicker: c.slots.kicker } : {}),
    title: c.slots.title,
    price: c.slots.price,
    ...(c.slots.meta ? { meta: c.slots.meta } : {}),
    ...(c.slots.location ? { location: c.slots.location } : {}),
    ...(c.slots.action ? { action: c.slots.action } : {}),
  },
});

const play =
  (name: keyof typeof cases) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertListingCardTree(canvasElement, name);
  };

/**
 * Slotted listing card for Astro. Callers put progressive images in `media`
 * (`loading="lazy"` by default; the first visible / LCP card may use
 * `fetchpriority="high"` and eager loading).
 */
export default {
  title: "Components/ListingCard",
  component: ListingCard,
  tags: ["autodocs"],
  argTypes: {
    slots: { table: { disable: true } },
  },
};

export const Default = {
  args: toArgs(cases.Default),
  play: play("Default"),
  parameters: { docs: { source: { language: "astro", code: listingCardSource("Default") } } },
};
export const NoPhoto = {
  args: toArgs(cases.NoPhoto),
  play: play("NoPhoto"),
  parameters: { docs: { source: { language: "astro", code: listingCardSource("NoPhoto") } } },
};
export const WithKickerMetaLocation = {
  args: toArgs(cases.WithKickerMetaLocation),
  play: play("WithKickerMetaLocation"),
  parameters: {
    docs: { source: { language: "astro", code: listingCardSource("WithKickerMetaLocation") } },
  },
};
export const WithAction = {
  args: toArgs(cases.WithAction),
  play: play("WithAction"),
  parameters: { docs: { source: { language: "astro", code: listingCardSource("WithAction") } } },
};
export const HeadingLevel3 = {
  args: toArgs(cases.HeadingLevel3),
  play: play("HeadingLevel3"),
  parameters: { docs: { source: { language: "astro", code: listingCardSource("HeadingLevel3") } } },
};
export const PriorityImage = {
  args: toArgs(cases.PriorityImage),
  play: play("PriorityImage"),
  parameters: { docs: { source: { language: "astro", code: listingCardSource("PriorityImage") } } },
};
