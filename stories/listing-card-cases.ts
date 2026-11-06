/*
  Story cases shared by Astro stories, Marko stories and the parity test.
  Framework-free: imports no component. Slot bodies are HTML strings (Astro
  `slots` / Marko attr-tag content). `assertListingCardTree` encodes the
  element-tree contract both renderers must satisfy.
*/

export interface ListingCardCase {
  href: string;
  headingLevel?: 2 | 3;
  headingId?: string;
  linkLabel?: string;
  class?: string;
  slots: {
    media?: string;
    kicker?: string;
    title: string;
    price: string;
    meta?: string;
    location?: string;
    action?: string;
  };
}

const lazyImg =
  '<img class="listing-card__image" src="/m/abc123/cover/" alt="" width="640" height="480" loading="lazy" decoding="async">';
const priorityImg =
  '<img class="listing-card__image" src="/m/abc123/cover/" alt="" width="640" height="480" loading="eager" fetchpriority="high" decoding="async">';
const noPhoto = '<span class="listing-card__no-photo">Photo unavailable</span>';

export const cases = {
  Default: {
    href: "/m/abc123/",
    headingId: "listing-card-1",
    slots: {
      media: lazyImg,
      kicker: "2021 · Land Rover",
      title: "Range Rover Vogue",
      price: "MYR 450,000",
      meta: "Recon · SUV · 5,001 – 10,000 km",
      location: "<span>Bangsar, W.P. Kuala Lumpur</span>",
    },
  },
  NoPhoto: {
    href: "/m/abc123/",
    headingId: "listing-card-nophoto",
    slots: {
      media: noPhoto,
      title: "Range Rover Vogue",
      price: "MYR 450,000",
    },
  },
  WithKickerMetaLocation: {
    href: "/m/abc123/",
    headingId: "listing-card-full",
    slots: {
      media: lazyImg,
      kicker: "2021 · Land Rover",
      title: "Range Rover Vogue",
      price: "MYR 450,000",
      meta: "Recon · SUV · 5,001 – 10,000 km",
      location:
        '<img class="listing-card__flag" src="/flags/wp-kuala-lumpur.svg" alt="" width="24" height="12" loading="lazy" decoding="async"><span>Bangsar, W.P. Kuala Lumpur</span>',
    },
  },
  WithAction: {
    href: "/m/abc123/",
    headingId: "listing-card-action",
    slots: {
      media: lazyImg,
      kicker: "2021 · Land Rover",
      title: "Range Rover Vogue",
      price: "MYR 450,000",
      action: '<button type="button">Save</button>',
    },
  },
  HeadingLevel3: {
    href: "/m/abc123/",
    headingLevel: 3,
    headingId: "listing-card-h3",
    slots: {
      media: lazyImg,
      title: "Range Rover Vogue",
      price: "MYR 450,000",
    },
  },
  PriorityImage: {
    href: "/m/abc123/",
    headingId: "listing-card-lcp",
    slots: {
      media: priorityImg,
      title: "Range Rover Vogue",
      price: "MYR 450,000",
    },
  },
} satisfies Record<string, ListingCardCase>;

/** Consumer markup shown in Astro Show code (imports + slots), not a raw args object. */
export const listingCardSource = (name: keyof typeof cases) => {
  // `satisfies` keeps each case's own keys, so optional fields are not on every
  // member. Read them through the shared case type.
  const c = cases[name] as ListingCardCase;
  const level = c.headingLevel === 3 ? "\n  headingLevel={3}" : "";
  const id = c.headingId ? `\n  headingId="${c.headingId}"` : "";
  const media = c.slots.media ? `\n  <Fragment slot="media">${c.slots.media}</Fragment>` : "";
  const kicker = c.slots.kicker ? `\n  <Fragment slot="kicker">${c.slots.kicker}</Fragment>` : "";
  const meta = c.slots.meta ? `\n  <Fragment slot="meta">${c.slots.meta}</Fragment>` : "";
  const location = c.slots.location
    ? `\n  <Fragment slot="location">${c.slots.location}</Fragment>`
    : "";
  const action = c.slots.action ? `\n  <Fragment slot="action">${c.slots.action}</Fragment>` : "";
  return `---
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ListingCard href="${c.href}"${id}${level}>${media}${kicker}
  <Fragment slot="title">${c.slots.title}</Fragment>
  <Fragment slot="price">${c.slots.price}</Fragment>${meta}${location}${action}
</ListingCard>`;
};

/**
 * Assert the listing-card element tree for a shared case. Used by Astro and
 * Marko story `play` functions and by the parity test.
 */
export function assertListingCardTree(root: ParentNode, name: keyof typeof cases) {
  const c = cases[name] as ListingCardCase;
  const article = root.querySelector("article.listing-card");
  if (!article) throw new Error(`${name}: missing article.listing-card`);
  if (c.headingId) {
    if (article.getAttribute("aria-labelledby") !== c.headingId) {
      throw new Error(`${name}: aria-labelledby`);
    }
  } else if (article.hasAttribute("aria-labelledby")) {
    throw new Error(`${name}: unexpected aria-labelledby`);
  }

  const media = article.querySelector(":scope > .listing-card__media");
  if (!media || media.getAttribute("aria-hidden") !== "true") {
    throw new Error(`${name}: media must be aria-hidden`);
  }
  if (c.slots.media?.includes("listing-card__image")) {
    const img = media.querySelector("img.listing-card__image");
    if (!img) throw new Error(`${name}: missing image`);
    if (name === "PriorityImage") {
      if (img.getAttribute("fetchpriority") !== "high") throw new Error(`${name}: fetchpriority`);
    } else if (img.getAttribute("loading") !== "lazy") {
      throw new Error(`${name}: expected loading=lazy`);
    }
    if (img.getAttribute("alt") !== "") throw new Error(`${name}: decorative alt`);
  }
  if (name === "NoPhoto" && !media.textContent?.includes("Photo unavailable")) {
    throw new Error(`${name}: no-photo placeholder`);
  }

  const body = article.querySelector(":scope > .listing-card__body");
  if (!body) throw new Error(`${name}: missing body`);

  const kicker = body.querySelector(".listing-card__kicker");
  if (c.slots.kicker) {
    if (!kicker || kicker.textContent?.trim() !== c.slots.kicker) throw new Error(`${name}: kicker`);
  } else if (kicker) {
    throw new Error(`${name}: unexpected kicker`);
  }

  const h = c.headingLevel === 3 ? "H3" : "H2";
  const title = body.querySelector(".listing-card__title");
  if (!title || title.tagName !== h) throw new Error(`${name}: heading level`);
  if (c.headingId && title.id !== c.headingId) throw new Error(`${name}: heading id`);
  const link = title.querySelector("a.listing-card__link");
  if (!link || link.getAttribute("href") !== c.href) throw new Error(`${name}: href`);
  if (link.textContent?.trim() !== c.slots.title) throw new Error(`${name}: title text`);
  if (c.linkLabel) {
    if (link.getAttribute("aria-label") !== c.linkLabel) throw new Error(`${name}: linkLabel`);
  }

  const price = body.querySelector(".listing-card__price");
  if (!price || price.textContent?.trim() !== c.slots.price) throw new Error(`${name}: price`);

  const meta = body.querySelector(".listing-card__meta");
  if (c.slots.meta) {
    if (!meta || meta.textContent?.trim() !== c.slots.meta) throw new Error(`${name}: meta`);
  } else if (meta) {
    throw new Error(`${name}: unexpected meta`);
  }

  const location = body.querySelector(".listing-card__location");
  if (c.slots.location) {
    if (!location) throw new Error(`${name}: location`);
  } else if (location) {
    throw new Error(`${name}: unexpected location`);
  }

  const action = article.querySelector(":scope > .listing-card__action");
  if (c.slots.action) {
    if (!action) throw new Error(`${name}: action`);
  } else if (action) {
    throw new Error(`${name}: unexpected action`);
  }

  if (article.querySelectorAll("a.listing-card__link").length !== 1) {
    throw new Error(`${name}: expected exactly one stretched link`);
  }
  if (name === "WithAction") {
    if (article.querySelectorAll("a").length !== 1) throw new Error(`${name}: action must not add a second link`);
    if (!action?.querySelector("button")) throw new Error(`${name}: action button`);
  }
}
