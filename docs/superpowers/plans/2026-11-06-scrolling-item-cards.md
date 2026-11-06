# Scrolling Item Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship slotted `ListingCard` / `<lx-listing-card>` and horizontal `ScrollingItemCards` / `<lx-scrolling-item-cards>` in Astro and Marko (native overflow + prev/next), without touching the HTML builders.

**Architecture:** Two independent components share BEM CSS under `src/styles/` and, for the scroller only, a progressive-enhancement script under `src/scripts/`. Astro widgets live in `src/astro/ui/`; Marko tags in `src/marko/lx-*/` (concise Tags API). Framework-free story cases under `stories/` drive Astro stories, Marko stories, and parity assertions. The scroller never imports the listing card.

**Tech Stack:** Astro 7 components, Marko 6 Tags API (concise), shared CSS (BEM), `cn()` (`clsx` + `tailwind-merge`), Node `node:test` for unit tests, Storybook 10 (Astro + Marko refs) + Vitest browser story tests, Changesets.

## Global Constraints

- Spec (authoritative): `docs/superpowers/specs/2026-11-06-scrolling-item-cards-design.md` (local copy also at `/workspace/sdd/2026-11-06-scrolling-item-cards-design.md`).
- Astro + Marko only. Do **not** add `createScrollingItemCards`, do **not** change `createListingCard` / `src/html/listing-card.js` / `src/utils/listing-card.js` / existing `./styles/listing-card.css` or `./utils/listing-card` export paths (additive CSS inside the existing CSS file is allowed).
- Do **not** port `ebay-carousel`, unused eBay slots, a Marko `SectionHead`, or a Marko-only stylesheet fork. Both renderers import `src/styles/*.css`.
- Listing-card BEM block stays `listing-card` in **both** renderers (parity with HTML). Scroller block is `scrolling-item-cards`.
- Additive listing-card CSS only: `.listing-card__action { position: relative; z-index: 1; }` (above the stretched `::after`). No visual redesign of the existing card.
- Title-card layout: **one** DOM node; below 768px `__flow` is a column and only `__track` scrolls; from 768px `__flow` is the scrollport, title-card first snap item `max-width: 225px`, `__track` uses `display: contents`. Container query on `.scrolling-item-cards` **and** `@media (min-width: 768px)` fallback. Item width `--scrolling-item-cards-item-width` default `16.5rem`, gap `1rem`. Reduced motion: `scroll-behavior: auto`, snap `proximity`.
- Script export name: `initScrollingItemCards(root)`. Double-init on the same root is a no-op. Buttons start `hidden`; stay hidden when no overflow; focus moves when the focused button disables.
- No full WAI-ARIA Carousel pattern. Track is not `tabindex="0"`.
- Astro stories under `stories/ui/` with titles `Components/ListingCard` and `Components/ScrollingItemCards`. Do **not** change story globs.
- Marko story titles follow neighbours (`Components/program-badge`, `Components/logo`): `Components/listing-card` and `Components/scrolling-item-cards` (no `lx-` prefix).
- Image loading is a documented caller contract (default `loading="lazy"` `decoding="async"`; LCP may use `fetchpriority="high"` + eager). Components do not rewrite slotted `<img>`s.
- Changeset: **minor**. Package version on main is `0.16.0`.
- Verification commands are those in CONTRIBUTING / package.json (listed in Task 6). Do not invent alternate runners.

## File Structure

| File | Responsibility |
| ---- | -------------- |
| `src/styles/listing-card.css` | Existing card styles + additive `.listing-card__action` |
| `src/utils/listing-card-slots.js` (+ `.d.ts`) | Shared throw helpers for required `href` / title / price |
| `src/astro/ui/ListingCard.astro` | Slotted listing card (Astro) |
| `src/marko/lx-listing-card/index.marko` | Same tree (Marko Tags API, concise) |
| `stories/listing-card-cases.ts` | Framework-free cases + DOM assertion helper + Show-code snippets |
| `stories/ui/ListingCard.stories.ts` | Astro stories `Components/ListingCard` |
| `src/marko/lx-listing-card/stories.ts` | Marko stories `Components/listing-card` |
| `tests/listing-card-slots.test.js` | Unit tests for the shared throw helper |
| `tests/listing-card-parity.test.js` | Astro Container + Marko render element-tree parity |
| `src/styles/scrolling-item-cards.css` | Scroller presentation (new export) |
| `src/scripts/scrolling-item-cards.js` (+ `.d.ts`) | `initScrollingItemCards` PE script |
| `tests/scrolling-item-cards.test.js` | TDD: button states, double-init, focus move |
| `src/astro/ui/ScrollingItemCards.astro` | Scroller (Astro) + script install |
| `src/marko/lx-scrolling-item-cards/index.marko` | Scroller (Marko) + script install |
| `stories/scrolling-item-cards-cases.ts` | Framework-free scroller cases / source snippets |
| `stories/ui/ScrollingItemCards.stories.ts` | Astro stories composing `ListingCard` |
| `stories/ui/ScrollingItemCardsDemo.astro` | Scenario wrapper for Astro scroller stories (like DialogDemo) |
| `src/marko/lx-scrolling-item-cards/demo.marko` | Scenario wrapper for Marko scroller stories |
| `src/marko/lx-scrolling-item-cards/stories.ts` | Marko stories |
| `package.json` | Exports for CSS + script |
| `marko.json` | Register both new tags |
| `tsconfig.marko.json` | Include new `stories/*-cases.ts` files |
| `tests/storybook-globs.test.js` | Extend exact Astro sidebar title list |
| `README.md` | Mention both components + image-loading contract |
| `.changeset/<slug>.md` | Minor changeset |

---

### Task 1: ListingCard Astro (additive CSS, cases, stories)

**Files:**
- Modify: `src/styles/listing-card.css` (append only)
- Create: `src/utils/listing-card-slots.js`
- Create: `src/utils/listing-card-slots.d.ts`
- Create: `src/astro/ui/ListingCard.astro`
- Create: `stories/listing-card-cases.ts`
- Create: `stories/ui/ListingCard.stories.ts`
- Create: `tests/listing-card-slots.test.js`
- Modify: `tests/storybook-globs.test.js` (exact Astro titles list)

**Interfaces:**
- Consumes: `cn` from `src/utils/cn.js`; existing `listing-card` BEM from `src/styles/listing-card.css`; markup contract of `createListingCard` (do not change that file).
- Produces:
  - `assertListingCardSlots({ href, titleText, priceText })` — throws `Error` with messages starting `ListingCard:` when `href`, title, or price missing/whitespace-only; returns `void` otherwise.
  - `ListingCard.astro` props: `href: string` (required), `headingLevel?: 2 | 3` (default `2`), `headingId?: string`, `linkLabel?: string`, plus `HTMLAttributes<"article">` minus controlled attrs; slots `media`, `kicker`, `title`, `price`, `meta`, `location`, `action`.
  - Export path (wildcard, no package.json change yet): `@luxoticars/ui/astro/ui/ListingCard`.
  - Cases keys: `Default`, `NoPhoto`, `WithKickerMetaLocation`, `WithAction`, `HeadingLevel3`, `PriorityImage`.
  - Story title: `Components/ListingCard`.

- [ ] **Step 1: Write the failing unit test for the throw helper**

Create `tests/listing-card-slots.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertListingCardSlots } from "../src/utils/listing-card-slots.js";

test("accepts a complete card", () => {
  assert.doesNotThrow(() =>
    assertListingCardSlots({ href: "/m/abc/", titleText: "Range Rover Vogue", priceText: "MYR 450,000" }),
  );
});

test("throws without href", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "", titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: "   ", titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: undefined, titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
});

test("throws without title text", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "", priceText: "MYR 1" }),
    { message: "ListingCard: `title` slot is required and must not be empty." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "  ", priceText: "MYR 1" }),
    { message: "ListingCard: `title` slot is required and must not be empty." },
  );
});

test("throws without price text", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "Car", priceText: "" }),
    { message: "ListingCard: `price` slot is required and must not be empty." },
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/listing-card-slots.test.js`

Expected: FAIL with `Cannot find module` / `ERR_MODULE_NOT_FOUND` for `../src/utils/listing-card-slots.js`.

- [ ] **Step 3: Implement the throw helper**

Create `src/utils/listing-card-slots.js`:

```js
/**
 * Shared guards for ListingCard / <lx-listing-card>. Both renderers call this
 * before printing markup so a missing href, title or price fails the same way.
 *
 * @param {{ href?: string, titleText?: string, priceText?: string }} input
 */
export function assertListingCardSlots({ href, titleText, priceText }) {
  if (typeof href !== "string" || href.trim() === "") {
    throw new Error("ListingCard: `href` is required.");
  }
  if (typeof titleText !== "string" || titleText.trim() === "") {
    throw new Error("ListingCard: `title` slot is required and must not be empty.");
  }
  if (typeof priceText !== "string" || priceText.trim() === "") {
    throw new Error("ListingCard: `price` slot is required and must not be empty.");
  }
}
```

Create `src/utils/listing-card-slots.d.ts`:

```ts
export declare function assertListingCardSlots(input: {
  href?: string;
  titleText?: string;
  priceText?: string;
}): void;
```

- [ ] **Step 4: Re-run the unit test**

Run: `node --test tests/listing-card-slots.test.js`

Expected: PASS (all 4 tests).

- [ ] **Step 5: Append additive action CSS**

Append exactly this to the end of `src/styles/listing-card.css` (do not change any existing rule):

```css
/* Optional control above the stretched title-link hit area. */
.listing-card__action {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 6: Write shared cases**

Create `stories/listing-card-cases.ts`:

```ts
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
  const c = cases[name];
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
  const c = cases[name];
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
```

- [ ] **Step 7: Implement ListingCard.astro**

Create `src/astro/ui/ListingCard.astro`:

```astro
---
/*
  Slotted listing card. Markup matches `createListingCard` (same BEM block).
  Callers format text with `@luxoticars/ui/utils/listing-card` and put it in
  slots; this component does not accept a `listing` object.
*/
import type { HTMLAttributes } from "astro/types";
import { cn } from "../../utils/cn.js";
import { assertListingCardSlots } from "../../utils/listing-card-slots.js";
import "../../styles/listing-card.css";

type Controlled = "aria-labelledby";

export type Props = Omit<HTMLAttributes<"article">, Controlled> & {
  /** Required. Target of the single stretched title link. */
  href: string;
  /** `2` or `3`. @default 2 */
  headingLevel?: 2 | 3;
  /** Optional id on the heading; when set, the article gets `aria-labelledby`. */
  headingId?: string;
  /**
   * Optional `aria-label` on the stretched link. When omitted, the link is
   * named by the title slot's text.
   */
  linkLabel?: string;
};

const {
  href,
  headingLevel = 2,
  headingId,
  linkLabel,
  class: className,
  "class:list": classList,
  ...attributes
} = Astro.props;

const { "aria-labelledby": _labelledby, ...rest } = attributes as HTMLAttributes<"article">;

const textOf = (html: string) => html.replace(/<[^>]*>/g, "").trim();

const titleHtml = Astro.slots.has("title") ? await Astro.slots.render("title") : "";
const priceHtml = Astro.slots.has("price") ? await Astro.slots.render("price") : "";
assertListingCardSlots({
  href,
  titleText: textOf(titleHtml),
  priceText: textOf(priceHtml),
});

if (headingLevel !== 2 && headingLevel !== 3) {
  throw new Error("ListingCard: `headingLevel` must be 2 or 3.");
}

const Heading = headingLevel === 3 ? "h3" : "h2";

const mediaHtml = Astro.slots.has("media") ? await Astro.slots.render("media") : "";
const kickerHtml = Astro.slots.has("kicker") ? await Astro.slots.render("kicker") : "";
const metaHtml = Astro.slots.has("meta") ? await Astro.slots.render("meta") : "";
const locationHtml = Astro.slots.has("location") ? await Astro.slots.render("location") : "";
const actionHtml = Astro.slots.has("action") ? await Astro.slots.render("action") : "";

const hasKicker = textOf(kickerHtml) !== "" || /<[^>]+>/.test(kickerHtml);
const hasMeta = textOf(metaHtml) !== "" || /<[^>]+>/.test(metaHtml);
const hasLocation = textOf(locationHtml) !== "" || /<[^>]+>/.test(locationHtml);
const hasMedia = mediaHtml.trim() !== "";
const hasAction = actionHtml.trim() !== "";
---

<article
  {...rest}
  class={cn("listing-card", className, classList)}
  aria-labelledby={headingId}
>
  {
    hasMedia && (
      <div class="listing-card__media" aria-hidden="true" set:html={mediaHtml} />
    )
  }
  <div class="listing-card__body">
    {hasKicker && <p class="listing-card__kicker" set:html={kickerHtml} />}
    <Heading class="listing-card__title" id={headingId}>
      <a class="listing-card__link" href={href} aria-label={linkLabel} set:html={titleHtml} />
    </Heading>
    <p class="listing-card__price" set:html={priceHtml} />
    {hasMeta && <p class="listing-card__meta" set:html={metaHtml} />}
    {hasLocation && <p class="listing-card__location" set:html={locationHtml} />}
  </div>
  {hasAction && <div class="listing-card__action" set:html={actionHtml} />}
</article>
```

- [ ] **Step 8: Write Astro stories with Show code + play assertions**

Create `stories/ui/ListingCard.stories.ts`:

```ts
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
```

- [ ] **Step 9: Update the Astro sidebar titles pin**

In `tests/storybook-globs.test.js`, change the exact Astro titles assertion to:

```js
  assert.deepEqual(titles(ASTRO_STORY_GLOBS), [
    "Components/Button",
    "Components/Dialog",
    "Components/Footer",
    "Components/ListingCard",
    "Components/Logo",
    "Components/ProgramBadge",
    "Components/SectionHead",
    "Components/SiteHeader",
  ]);
```

(ScrollingItemCards is added in Task 4.)

- [ ] **Step 10: Run unit tests**

Run: `node --test tests/listing-card-slots.test.js tests/listing-card.test.js tests/storybook-globs.test.js`

Expected: PASS. Existing `createListingCard` tests stay green; globs list includes `Components/ListingCard`.

- [ ] **Step 11: Commit**

```bash
git add src/styles/listing-card.css src/utils/listing-card-slots.js src/utils/listing-card-slots.d.ts src/astro/ui/ListingCard.astro stories/listing-card-cases.ts stories/ui/ListingCard.stories.ts tests/listing-card-slots.test.js tests/storybook-globs.test.js
git commit -m "$(cat <<'EOF'
feat(ListingCard): add slotted Astro card and action CSS

EOF
)"
```

---

### Task 2: lx-listing-card (Marko) + parity

**Files:**
- Create: `src/marko/lx-listing-card/index.marko`
- Create: `src/marko/lx-listing-card/stories.ts`
- Modify: `marko.json` (register `<lx-listing-card>`)
- Modify: `tsconfig.marko.json` (include `stories/listing-card-cases.ts`)
- Create: `tests/listing-card-parity.test.js`

**Interfaces:**
- Consumes: `assertListingCardSlots`, `cn`, `src/styles/listing-card.css`, `cases` / `assertListingCardTree` from `stories/listing-card-cases.ts`.
- Produces: `<lx-listing-card>` with AttrTags `@media` `@kicker` `@title` `@price` `@meta` `@location` `@action`; props `href`, `headingLevel` (default 2), `headingId`, `linkLabel`, `class`; same DOM as Astro for shared cases. Story title `Components/listing-card`. Discovery via `marko.json` and `./marko/lx-*` export wildcard.

- [ ] **Step 1: Register the tag and extend the Marko tsconfig**

In `marko.json`, add beside the other tags:

```json
"<lx-listing-card>": { "template": "./src/marko/lx-listing-card/index.marko" }
```

In `tsconfig.marko.json`, change `include` to:

```json
"include": ["src/marko", "stories-marko", ".storybook-marko", "stories/program-badge-cases.ts", "stories/listing-card-cases.ts"]
```

- [ ] **Step 2: Implement the Marko tag**

Create `src/marko/lx-listing-card/index.marko` (concise Tags API; global `Marko` namespace like `lx-program-badge` — no `@marko/run` import; shared CSS import, **no** `style.css` fork):

```marko
/*
  Slotted listing card for Marko 6 — the twin of `astro/ui/ListingCard.astro`.
  Same BEM block (`listing-card`) and shared stylesheet; no Marko-only fork.
  Concise syntax, by repo convention.
*/
import { cn } from "../../utils/cn.js"
import { assertListingCardSlots } from "../../utils/listing-card-slots.js"
import "../../styles/listing-card.css"

export interface Input extends Omit<Marko.HTML.Article, "content" | "aria-labelledby"> {
  /** Required. Target of the single stretched title link. */
  href: string
  /** `2` or `3`. @default 2 */
  headingLevel?: 2 | 3
  /** Optional id on the heading; when set, the article gets `aria-labelledby`. */
  headingId?: string
  /** Optional `aria-label` on the stretched link. */
  linkLabel?: string
  media?: Marko.AttrTag<{ content: Marko.Body }>
  kicker?: Marko.AttrTag<{ content: Marko.Body }>
  /** Required. Phrasing/text only — not a nested link. */
  title: Marko.AttrTag<{ content: Marko.Body }>
  /** Required. */
  price: Marko.AttrTag<{ content: Marko.Body }>
  meta?: Marko.AttrTag<{ content: Marko.Body }>
  location?: Marko.AttrTag<{ content: Marko.Body }>
  action?: Marko.AttrTag<{ content: Marko.Body }>
  content?: never
}

const/{
  href,
  headingLevel = 2,
  headingId,
  linkLabel,
  class: className,
  media,
  kicker,
  title,
  price,
  meta,
  location,
  action,
  content: _content,
  "aria-labelledby": _labelledby,
  ...attrs
}=input

const/_assert=assertListingCardSlots({
  href,
  titleText: title ? "x" : "",
  priceText: price ? "x" : "",
})
const/_level=(headingLevel === 3 ? 3 : headingLevel === 2 ? 2 : (() => { throw new Error("ListingCard: `headingLevel` must be 2 or 3.") })())
const/Heading=(_level === 3 ? "h3" : "h2")

article ...attrs class=cn("listing-card", className) aria-labelledby=headingId
  if=media
    div.listing-card__media aria-hidden="true"
      ${media.content}
  div.listing-card__body
    if=kicker
      p.listing-card__kicker
        ${kicker.content}
    ${Heading} class="listing-card__title" id=headingId
      a.listing-card__link href=href aria-label=linkLabel
        ${title.content}
    p.listing-card__price
      ${price.content}
    if=meta
      p.listing-card__meta
        ${meta.content}
    if=location
      p.listing-card__location
        ${location.content}
  if=action
    div.listing-card__action
      ${action.content}
```

Marko AttrTags are present-or-absent; whitespace-only title/price still counts as present. Astro uses `textOf`. Shared cases always pass non-empty text. Callers must omit empty slots.

- [ ] **Step 3: Write Marko stories**

Create `src/marko/lx-listing-card/stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/marko";
import ListingCard, { type Input } from "./index.marko";
import { assertListingCardTree, cases } from "../../../stories/listing-card-cases";

/**
 * `<lx-listing-card>` for Marko 6 apps. Discovered through marko.json:
 *
 * ```marko
 * lx-listing-card href="/m/abc/" headingId="listing-card-1"
 *   @media
 *     img.listing-card__image src="/m/abc/cover/" alt="" width="640" height="480" loading="lazy" decoding="async"
 *   @kicker -- 2021 · Land Rover
 *   @title -- Range Rover Vogue
 *   @price -- MYR 450,000
 * ```
 *
 * Cases are shared with the Astro stories (`stories/listing-card-cases.ts`).
 */
export default {
  title: "Components/listing-card",
  component: ListingCard,
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text", description: "Required. Target of the stretched title link." },
    headingLevel: {
      control: "inline-radio",
      options: [2, 3],
      description: "`2` or `3`.",
      table: { defaultValue: { summary: "2" } },
    },
    headingId: { control: "text", description: "Optional id on the heading." },
    linkLabel: { control: "text", description: "Optional aria-label on the stretched link." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

const play =
  (name: keyof typeof cases) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertListingCardTree(canvasElement, name);
  };

function toArgs(name: keyof typeof cases): Input {
  const c = cases[name];
  return {
    href: c.href,
    headingLevel: c.headingLevel,
    headingId: c.headingId,
    linkLabel: c.linkLabel,
    class: c.class,
    media: c.slots.media ? ({ content: c.slots.media } as Input["media"]) : undefined,
    kicker: c.slots.kicker ? ({ content: c.slots.kicker } as Input["kicker"]) : undefined,
    title: { content: c.slots.title } as Input["title"],
    price: { content: c.slots.price } as Input["price"],
    meta: c.slots.meta ? ({ content: c.slots.meta } as Input["meta"]) : undefined,
    location: c.slots.location ? ({ content: c.slots.location } as Input["location"]) : undefined,
    action: c.slots.action ? ({ content: c.slots.action } as Input["action"]) : undefined,
  };
}

export const Default: Story = { args: toArgs("Default"), play: play("Default") };
export const NoPhoto: Story = { args: toArgs("NoPhoto"), play: play("NoPhoto") };
export const WithKickerMetaLocation: Story = {
  args: toArgs("WithKickerMetaLocation"),
  play: play("WithKickerMetaLocation"),
};
export const WithAction: Story = { args: toArgs("WithAction"), play: play("WithAction") };
export const HeadingLevel3: Story = { args: toArgs("HeadingLevel3"), play: play("HeadingLevel3") };
export const PriorityImage: Story = { args: toArgs("PriorityImage"), play: play("PriorityImage") };
```

If `@storybook/marko` expects AttrTag `content` as a render body rather than an HTML string, switch slot args to render-body functions or small inline templates until Default renders; then fix the rest. Do not add dependencies.

- [ ] **Step 4: Write the Astro/Marko parity test**

Create `tests/listing-card-parity.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ListingCardAstro from "../src/astro/ui/ListingCard.astro";
import ListingCardMarko from "../src/marko/lx-listing-card/index.marko";
import { cases } from "../stories/listing-card-cases.ts";

function dump(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

function slotsToAstro(c) {
  const slots = { title: c.slots.title, price: c.slots.price };
  if (c.slots.media) slots.media = c.slots.media;
  if (c.slots.kicker) slots.kicker = c.slots.kicker;
  if (c.slots.meta) slots.meta = c.slots.meta;
  if (c.slots.location) slots.location = c.slots.location;
  if (c.slots.action) slots.action = c.slots.action;
  return slots;
}

const normalize = (html) =>
  dump(html)
    .replace(/<!---->/g, "")
    .replace(/ class="([^"]*)"/g, (_, cls) => ` class="${cls.split(/\s+/).filter(Boolean).sort().join(" ")}"`);

test("Astro and Marko listing cards match for every shared case", async () => {
  const container = await AstroContainer.create();
  for (const name of Object.keys(cases)) {
    const c = cases[name];
    const astroHtml = await container.renderToString(ListingCardAstro, {
      props: {
        href: c.href,
        headingLevel: c.headingLevel,
        headingId: c.headingId,
        linkLabel: c.linkLabel,
        class: c.class,
      },
      slots: slotsToAstro(c),
    });

    const markoResult = await ListingCardMarko.render({
      href: c.href,
      headingLevel: c.headingLevel,
      headingId: c.headingId,
      linkLabel: c.linkLabel,
      class: c.class,
      media: c.slots.media ? { content: c.slots.media } : undefined,
      kicker: c.slots.kicker ? { content: c.slots.kicker } : undefined,
      title: { content: c.slots.title },
      price: { content: c.slots.price },
      meta: c.slots.meta ? { content: c.slots.meta } : undefined,
      location: c.slots.location ? { content: c.slots.location } : undefined,
      action: c.slots.action ? { content: c.slots.action } : undefined,
    });
    const markoHtml = typeof markoResult === "string" ? markoResult : markoResult.toString();

    assert.equal(normalize(astroHtml), normalize(markoHtml), name);
  }
});
```

If Marko `render` rejects string `content`, adjust AttrTag shape to the Marko 6.4.x runtime helper used in-repo — do not add `linkedom`/`happy-dom`. Prefer fixing AttrTag shape over dropping parity.

- [ ] **Step 5: Run tests**

Run: `node --test tests/listing-card-slots.test.js tests/listing-card.test.js tests/marko-tags.test.js tests/listing-card-parity.test.js`

Expected: PASS (`<lx-listing-card>` registered; parity equal for all 6 cases).

- [ ] **Step 6: Commit**

```bash
git add src/marko/lx-listing-card marko.json tsconfig.marko.json tests/listing-card-parity.test.js
git commit -m "$(cat <<'EOF'
feat(lx-listing-card): add Marko twin and Astro/Marko parity

EOF
)"
```

---

### Task 3: scrolling-item-cards CSS + script (TDD)

**Files:**
- Create: `tests/scrolling-item-cards.test.js` (first)
- Create: `src/scripts/scrolling-item-cards.js`
- Create: `src/scripts/scrolling-item-cards.d.ts`
- Create: `src/styles/scrolling-item-cards.css`

**Interfaces:**
- Consumes: nothing from Astro/Marko.
- Produces:
  - `export function initScrollingItemCards(root: Element | null | undefined): void`
  - Double-init on the same `root` is a no-op (`WeakSet`).
  - CSS classes: `scrolling-item-cards`, `__header`, `__viewport`, `__control`, `__control--prev`, `__control--next`, `__flow`, `__title-card`, `__track`, `__item`, `__footer`; custom property `--scrolling-item-cards-item-width` (default `16.5rem`).

- [ ] **Step 1: Write the failing script tests (TDD)**

Create `tests/scrolling-item-cards.test.js` (DOM fakes in the spirit of `tests/site-header-hide-on-scroll.test.js` — no browser deps):

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { initScrollingItemCards } from "../src/scripts/scrolling-item-cards.js";

function createFixture({
  overflow = true,
  scrollLeft = 0,
  maxScroll = 400,
  clientWidth = 200,
  itemWidth = 100,
  gap = 16,
  hasTitleCard = false,
  mqMatches = false,
} = {}) {
  const listeners = { scroll: [], resize: [], button: [] };
  const state = { scrollLeft, maxScroll: overflow ? maxScroll : 0, clientWidth };
  let active = null;

  function makeButton(label, kind) {
    return {
      kind,
      hidden: true,
      disabled: false,
      getAttribute: (n) => (n === "aria-label" ? label : null),
      focus() {
        active = this;
      },
      addEventListener(type, fn) {
        if (type === "click") listeners.button.push({ kind, fn });
      },
    };
  }

  const prev = makeButton("Previous", "prev");
  const next = makeButton("Next", "next");
  const item = { offsetWidth: itemWidth };
  const titleCard = hasTitleCard ? { offsetWidth: itemWidth } : null;

  const scrolled = [];

  function makeScrollport(name) {
    return {
      name,
      style: { columnGap: `${gap}px`, gap: `${gap}px` },
      get clientWidth() {
        return state.clientWidth;
      },
      get scrollWidth() {
        return state.clientWidth + state.maxScroll;
      },
      get scrollLeft() {
        return state.scrollLeft;
      },
      set scrollLeft(v) {
        state.scrollLeft = v;
      },
      scrollBy({ left, behavior }) {
        scrolled.push({ name, left, behavior });
        state.scrollLeft = Math.min(state.maxScroll, Math.max(0, state.scrollLeft + left));
        for (const fn of listeners.scroll) fn();
      },
      addEventListener(type, fn) {
        if (type === "scroll") listeners.scroll.push(fn);
      },
      querySelectorAll(sel) {
        if (sel === ".scrolling-item-cards__item") return [item, item, item, item];
        return [];
      },
    };
  }

  const track = makeScrollport("track");
  const flow = makeScrollport("flow");

  const win = {
    matchMedia: (q) => ({
      matches: String(q).includes("768") ? mqMatches : false,
      addEventListener() {},
      removeEventListener() {},
    }),
    getComputedStyle: (el) => ({
      columnGap: el.style.columnGap || "0px",
      gap: el.style.gap || "0px",
    }),
    addEventListener(type, fn) {
      if (type === "resize") listeners.resize.push(fn);
    },
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  };

  const root = {
    ownerDocument: {
      defaultView: win,
      get activeElement() {
        return active;
      },
    },
    hasAttribute: () => false,
    setAttribute() {},
    querySelector(sel) {
      if (sel === ".scrolling-item-cards__control--prev") return prev;
      if (sel === ".scrolling-item-cards__control--next") return next;
      if (sel === ".scrolling-item-cards__flow") return flow;
      if (sel === ".scrolling-item-cards__track") return track;
      if (sel === ".scrolling-item-cards__title-card") return titleCard;
      if (sel === ".scrolling-item-cards__item") return item;
      return null;
    },
    focus() {
      active = root;
    },
  };

  return {
    root,
    prev,
    next,
    state,
    listeners,
    scrolled,
    setActive(btn) {
      active = btn;
    },
    get active() {
      return active;
    },
  };
}

test("no overflow: both buttons stay hidden after init", () => {
  const f = createFixture({ overflow: false });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.hidden, true);
  assert.equal(f.next.hidden, true);
});

test("start: prev disabled, next shown and enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0 });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.hidden, false);
  assert.equal(f.next.hidden, false);
  assert.equal(f.prev.disabled, true);
  assert.equal(f.next.disabled, false);
});

test("middle: both enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 100, maxScroll: 400 });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.disabled, false);
  assert.equal(f.next.disabled, false);
});

test("end: next disabled, prev shown and enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 400, maxScroll: 400 });
  initScrollingItemCards(f.root);
  assert.equal(f.next.disabled, true);
  assert.equal(f.prev.disabled, false);
});

test("double-init on the same root is a no-op", () => {
  const f = createFixture({ overflow: true });
  initScrollingItemCards(f.root);
  const buttonListeners = f.listeners.button.length;
  initScrollingItemCards(f.root);
  assert.equal(f.listeners.button.length, buttonListeners);
});

test("focus moves to the other button when the focused one disables", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0, maxScroll: 400 });
  initScrollingItemCards(f.root);
  f.setActive(f.next);
  f.state.scrollLeft = 400;
  for (const fn of f.listeners.scroll) fn();
  assert.equal(f.next.disabled, true);
  assert.equal(f.active, f.prev);
});

test("focus moves to the section when controls hide", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0, maxScroll: 400 });
  initScrollingItemCards(f.root);
  f.setActive(f.next);
  f.state.maxScroll = 0;
  f.state.scrollLeft = 0;
  for (const fn of f.listeners.scroll) fn();
  assert.equal(f.prev.hidden, true);
  assert.equal(f.next.hidden, true);
  assert.equal(f.active, f.root);
});

test("next click scrollBys by the first item width plus gap", () => {
  const f = createFixture({ overflow: true, itemWidth: 100, gap: 16, scrollLeft: 0 });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).left, 116);
});

test("wide viewport with a title-card scrollBys on flow, not track", () => {
  const f = createFixture({ overflow: true, hasTitleCard: true, mqMatches: true });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).name, "flow");
});

test("narrow viewport with a title-card scrollBys on track, not flow", () => {
  const f = createFixture({ overflow: true, hasTitleCard: true, mqMatches: false });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).name, "track");
});

test("initScrollingItemCards(null) does nothing", () => {
  assert.doesNotThrow(() => initScrollingItemCards(null));
  assert.doesNotThrow(() => initScrollingItemCards(undefined));
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `node --test tests/scrolling-item-cards.test.js`

Expected: FAIL `ERR_MODULE_NOT_FOUND` for `scrolling-item-cards.js`.

- [ ] **Step 3: Implement the script**

Create `src/scripts/scrolling-item-cards.js`:

```js
/*
  Progressive enhancement for `.scrolling-item-cards`: reveal prev/next, scroll
  by one item, enable/disable at the ends. Native overflow remains the source
  of truth. Installation on the same root twice is a no-op.
*/

const installed = new WeakSet();

const prefersReducedMotion = (win) =>
  Boolean(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

function gapOf(el, win) {
  const style = win.getComputedStyle(el);
  const raw = style.columnGap || style.gap || "0";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function measureStep(root, scrollport, win) {
  const item =
    scrollport.querySelectorAll?.(".scrolling-item-cards__item")?.[0] ||
    root.querySelector(".scrolling-item-cards__item");
  const width = item?.offsetWidth || 0;
  return width + gapOf(scrollport, win);
}

function activeScrollport(root, win) {
  const flow = root.querySelector(".scrolling-item-cards__flow");
  const track = root.querySelector(".scrolling-item-cards__track");
  const titleCard = root.querySelector(".scrolling-item-cards__title-card");
  const wide = Boolean(win.matchMedia?.("(min-width: 768px)")?.matches);
  if (titleCard && wide && flow) return flow;
  return track || flow;
}

function update(root, prev, next, scrollport) {
  const max = Math.max(0, scrollport.scrollWidth - scrollport.clientWidth);
  const left = scrollport.scrollLeft;
  const eps = 1;
  const overflow = max > eps;
  const atStart = left <= eps;
  const atEnd = left >= max - eps;

  if (!overflow) {
    prev.hidden = true;
    next.hidden = true;
    prev.disabled = true;
    next.disabled = true;
  } else {
    prev.hidden = false;
    next.hidden = false;
    prev.disabled = atStart;
    next.disabled = atEnd;
  }

  const active = root.ownerDocument.activeElement;
  if (active === prev && (prev.disabled || prev.hidden)) {
    if (!next.disabled && !next.hidden) next.focus();
    else root.focus();
  } else if (active === next && (next.disabled || next.hidden)) {
    if (!prev.disabled && !prev.hidden) prev.focus();
    else root.focus();
  }
}

export function initScrollingItemCards(root) {
  if (!root || installed.has(root)) return;
  const doc = root.ownerDocument;
  const win = doc?.defaultView;
  if (!win) return;
  installed.add(root);

  const prev = root.querySelector(".scrolling-item-cards__control--prev");
  const next = root.querySelector(".scrolling-item-cards__control--next");
  if (!prev || !next) return;

  if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");

  let scrollport = activeScrollport(root, win);

  const refreshPort = () => {
    scrollport = activeScrollport(root, win);
  };

  const sync = () => {
    refreshPort();
    update(root, prev, next, scrollport);
  };

  const behavior = () => (prefersReducedMotion(win) ? "auto" : "smooth");

  prev.addEventListener("click", () => {
    refreshPort();
    scrollport.scrollBy({ left: -measureStep(root, scrollport, win), behavior: behavior() });
  });
  next.addEventListener("click", () => {
    refreshPort();
    scrollport.scrollBy({ left: measureStep(root, scrollport, win), behavior: behavior() });
  });

  const onScroll = () => update(root, prev, next, scrollport);
  scrollport.addEventListener("scroll", onScroll, { passive: true });
  const flow = root.querySelector(".scrolling-item-cards__flow");
  const track = root.querySelector(".scrolling-item-cards__track");
  if (flow && flow !== scrollport) flow.addEventListener("scroll", onScroll, { passive: true });
  if (track && track !== scrollport) track.addEventListener("scroll", onScroll, { passive: true });

  win.addEventListener("resize", sync);
  if (typeof win.ResizeObserver === "function") {
    const ro = new win.ResizeObserver(sync);
    if (flow) ro.observe(flow);
    if (track) ro.observe(track);
  }

  sync();
}
```

Create `src/scripts/scrolling-item-cards.d.ts`:

```ts
/**
 * Progressive enhancement for one `.scrolling-item-cards` root: show prev/next
 * when the active scrollport overflows, `scrollBy` one item, enable/disable at
 * the ends. Call once per root; further calls on the same root are no-ops.
 *
 * `ScrollingItemCards.astro` and `<lx-scrolling-item-cards>` install this
 * themselves.
 */
export declare function initScrollingItemCards(root: Element | null | undefined): void;
```

- [ ] **Step 4: Run script tests — expect PASS**

Run: `node --test tests/scrolling-item-cards.test.js`

Expected: PASS. If a focus test fails because of fake/`activeElement` timing, adjust the fake to what the script calls — do not drop the focus requirement.

- [ ] **Step 5: Write the shared CSS**

Create `src/styles/scrolling-item-cards.css`:

```css
/*
  Horizontal scroller for slotted item cards. Shared by Astro and Marko.
  Native overflow + scroll-snap; prev/next come from scripts/scrolling-item-cards.js.
*/

.scrolling-item-cards {
  --scrolling-item-cards-item-width: 16.5rem;
  --_gap: 1rem;
  --_control-size: 2.5rem;
  --_surface: var(--lux-base-100, var(--color-base-100, oklch(100% 0 0)));
  --_text: var(--lux-base-content, var(--color-base-content, oklch(21% 0.006 285.885)));
  --_line: var(--lux-base-200, var(--color-base-200, oklch(96% 0.001 286)));
  --_focus: var(--lux-accent, var(--color-accent, oklch(52% 0.16 232.661)));

  container-type: inline-size;
  container-name: scrolling-item-cards;
  color: var(--_text);
}

.scrolling-item-cards__header {
  margin-block-end: 1rem;
}

.scrolling-item-cards__viewport {
  position: relative;
}

.scrolling-item-cards__flow {
  display: flex;
  flex-direction: column;
  gap: var(--_gap);
}

.scrolling-item-cards__title-card {
  min-width: 0;
}

.scrolling-item-cards__track {
  display: flex;
  gap: var(--_gap);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-block-end: 0.25rem;
}

.scrolling-item-cards__item {
  flex: 0 0 var(--scrolling-item-cards-item-width);
  width: var(--scrolling-item-cards-item-width);
  min-width: 0;
  scroll-snap-align: start;
}

.scrolling-item-cards__item > * {
  height: 100%;
}

.scrolling-item-cards__footer {
  margin-block-start: 1rem;
}

.scrolling-item-cards__control {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-grid;
  place-items: center;
  width: var(--_control-size);
  height: var(--_control-size);
  margin: 0;
  padding: 0;
  border: 1px solid var(--_line);
  border-radius: 999px;
  background: var(--_surface);
  color: inherit;
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  cursor: pointer;
  transform: translateY(-50%);
}

.scrolling-item-cards__control--prev {
  left: 0.25rem;
}

.scrolling-item-cards__control--next {
  right: 0.25rem;
}

.scrolling-item-cards__control:focus-visible {
  outline: 2px solid var(--_focus);
  outline-offset: 2px;
}

.scrolling-item-cards__control:disabled {
  opacity: 0.4;
  cursor: default;
}

.scrolling-item-cards__control[hidden] {
  display: none;
}

.scrolling-item-cards__control-icon {
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

/*
  From 768px with a title-card: flow is the scrollport; track uses display:contents.
  Select descendants of the container (not `.scrolling-item-cards` itself) so the
  container query can apply. `:has(> .__title-card)` keeps the flip title-card-only.
*/
@container scrolling-item-cards (min-width: 768px) {
  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) {
    flex-direction: row;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) > .scrolling-item-cards__title-card {
    flex: 0 0 auto;
    width: min(225px, var(--scrolling-item-cards-item-width));
    max-width: 225px;
    scroll-snap-align: start;
  }

  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) > .scrolling-item-cards__track {
    display: contents;
    overflow: visible;
    scroll-snap-type: none;
  }
}

@media (min-width: 768px) {
  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) {
    flex-direction: row;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) > .scrolling-item-cards__title-card {
    flex: 0 0 auto;
    width: min(225px, var(--scrolling-item-cards-item-width));
    max-width: 225px;
    scroll-snap-align: start;
  }

  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) > .scrolling-item-cards__track {
    display: contents;
    overflow: visible;
    scroll-snap-type: none;
  }
}

/*
  Match the 768px title-card flow selector's specificity so reduced motion
  actually overrides `scroll-behavior: smooth` and `scroll-snap-type: x mandatory`.
*/
@media (prefers-reduced-motion: reduce) {
  .scrolling-item-cards__track,
  .scrolling-item-cards__flow,
  .scrolling-item-cards__flow:has(> .scrolling-item-cards__title-card) {
    scroll-behavior: auto;
    scroll-snap-type: x proximity;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/scripts/scrolling-item-cards.js src/scripts/scrolling-item-cards.d.ts src/styles/scrolling-item-cards.css tests/scrolling-item-cards.test.js
git commit -m "$(cat <<'EOF'
feat(scrolling-item-cards): add CSS and initScrollingItemCards script

EOF
)"
```

---

### Task 4: ScrollingItemCards Astro + stories

**Files:**
- Create: `src/astro/ui/ScrollingItemCards.astro`
- Create: `stories/scrolling-item-cards-cases.ts`
- Create: `stories/ui/ScrollingItemCardsDemo.astro`
- Create: `stories/ui/ScrollingItemCards.stories.ts`
- Modify: `tests/storybook-globs.test.js` (add `Components/ScrollingItemCards`)

**Interfaces:**
- Consumes: `initScrollingItemCards`, `cn`, `ListingCard.astro`, `SectionHead.astro` (Similar cars story only).
- Produces: props `headingId?: string`, `label?: string` (one required), `prevLabel?: string` (default `"Previous"`), `nextLabel?: string` (default `"Next"`), `class` merged onto `scrolling-item-cards`; slots `title`, `titleCard`, default (items), `footer`. Story title `Components/ScrollingItemCards`.
- Astro cannot iterate default-slot children the way Marko iterates `@item`. **Convention:** each card in the default slot is wrapped by the caller in `<div class="scrolling-item-cards__item">`. Marko wraps `@item` for the caller. Document this in the component JSDoc.

- [ ] **Step 1: Shared scroller source helpers**

Create `stories/scrolling-item-cards-cases.ts`:

```ts
/** Framework-free scroller story metadata and Show-code snippets. */

const listingCardSnippet = (
  id: string,
  title: string,
  price: string,
  image: "priority" | "lazy",
) => `<div class="scrolling-item-cards__item">
    <ListingCard href="/m/${id}/" headingId="card-${id}" headingLevel={3}>
      <img slot="media" class="listing-card__image" src="/m/${id}/cover/" alt="" width="640" height="480" ${
        image === "priority"
          ? 'loading="eager" fetchpriority="high"'
          : 'loading="lazy"'
      } decoding="async" />
      <Fragment slot="title">${title}</Fragment>
      <Fragment slot="price">${price}</Fragment>
    </ListingCard>
  </div>`;

export const scrollerSource = {
  SimilarCars: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
import SectionHead from "@luxoticars/ui/astro/SectionHead";
---
<ScrollingItemCards headingId="similar-cars">
  <SectionHead slot="title" title="Similar cars" headingId="similar-cars" linkHref="/search" linkLabel="View all" />
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
  ${listingCardSnippet("3", "BMW M4", "MYR 520,000", "lazy")}
  ${listingCardSnippet("4", "Mercedes-AMG GT", "MYR 780,000", "lazy")}
</ScrollingItemCards>`,
  Promo: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards label="Featured cars">
  <div slot="titleCard"><h2>This week's picks</h2></div>
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
</ScrollingItemCards>`,
  NoOverflow: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards label="One car">
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
</ScrollingItemCards>`,
  WithFooter: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards headingId="with-footer">
  <h2 id="with-footer" slot="title">Just listed</h2>
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
  <p slot="footer">Prices include taxes.</p>
</ScrollingItemCards>`,
} as const;
```

- [ ] **Step 2: Implement ScrollingItemCards.astro**

Create `src/astro/ui/ScrollingItemCards.astro`:

```astro
---
import type { HTMLAttributes } from "astro/types";
import { cn } from "../../utils/cn.js";
import "../../styles/scrolling-item-cards.css";

type Controlled = "aria-label" | "aria-labelledby";

export type Props = Omit<HTMLAttributes<"section">, Controlled> & {
  /**
   * When the title slot contains a heading with this id, the section uses
   * `aria-labelledby`. One of `headingId` or `label` is required.
   */
  headingId?: string;
  /** Accessible name when there is no `headingId`. */
  label?: string;
  /** @default "Previous" */
  prevLabel?: string;
  /** @default "Next" */
  nextLabel?: string;
};

/**
 * Horizontal scroller. Default-slot children should each be wrapped in
 * `.scrolling-item-cards__item` (Marko `@item` wraps for you).
 */
const {
  headingId,
  label,
  prevLabel = "Previous",
  nextLabel = "Next",
  class: className,
  "class:list": classList,
  ...attributes
} = Astro.props;

const {
  "aria-label": _ariaLabel,
  "aria-labelledby": _ariaLabelledby,
  ...rest
} = attributes as HTMLAttributes<"section">;

if (!headingId && !(typeof label === "string" && label.trim())) {
  throw new Error("ScrollingItemCards: one of `headingId` or `label` is required.");
}

const hasTitle = Astro.slots.has("title");
const hasTitleCard = Astro.slots.has("titleCard");
const hasFooter = Astro.slots.has("footer");

const chevronPrev =
  '<svg class="scrolling-item-cards__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>';
const chevronNext =
  '<svg class="scrolling-item-cards__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';
---

<section
  {...rest}
  class={cn("scrolling-item-cards", className, classList)}
  aria-labelledby={headingId}
  aria-label={headingId ? undefined : label}
>
  {
    hasTitle && (
      <div class="scrolling-item-cards__header">
        <slot name="title" />
      </div>
    )
  }
  <div class="scrolling-item-cards__viewport">
    <button
      type="button"
      class="scrolling-item-cards__control scrolling-item-cards__control--prev"
      aria-label={prevLabel}
      hidden
      set:html={chevronPrev}
    />
    <div class="scrolling-item-cards__flow">
      {
        hasTitleCard && (
          <div class="scrolling-item-cards__title-card">
            <slot name="titleCard" />
          </div>
        )
      }
      <div class="scrolling-item-cards__track">
        <slot />
      </div>
    </div>
    <button
      type="button"
      class="scrolling-item-cards__control scrolling-item-cards__control--next"
      aria-label={nextLabel}
      hidden
      set:html={chevronNext}
    />
  </div>
  {
    hasFooter && (
      <div class="scrolling-item-cards__footer">
        <slot name="footer" />
      </div>
    )
  }
</section>

<script>
  import { initScrollingItemCards } from "../../scripts/scrolling-item-cards.js";

  // SiteHeader tears down listeners with AbortController + signal. This script
  // does not: `initScrollingItemCards` treats a second call on the same root as
  // a no-op (WeakSet), which is the spec. After `astro:after-swap`, preserved
  // roots skip re-wiring; new roots initialize.
  function initAll() {
    for (const root of document.querySelectorAll(".scrolling-item-cards")) {
      initScrollingItemCards(root);
    }
  }

  initAll();
  document.addEventListener("astro:after-swap", initAll);
</script>
```

- [ ] **Step 3: Astro demo wrapper and stories**

Create `stories/ui/ScrollingItemCardsDemo.astro` (composition is awkward as args-only; this matches `DialogDemo.astro`):

```astro
---
import ScrollingItemCards from "../../src/astro/ui/ScrollingItemCards.astro";
import ListingCard from "../../src/astro/ui/ListingCard.astro";
import SectionHead from "../../src/astro/SectionHead.astro";

export interface Props {
  scenario: "similar" | "promo" | "no-overflow" | "footer";
}

const { scenario } = Astro.props;

const cars = [
  { id: "1", title: "Range Rover Vogue", price: "MYR 450,000" },
  { id: "2", title: "Porsche 911", price: "MYR 890,000" },
  { id: "3", title: "BMW M4", price: "MYR 520,000" },
  { id: "4", title: "Mercedes-AMG GT", price: "MYR 780,000" },
];
const list = scenario === "no-overflow" ? cars.slice(0, 1) : cars;
---

{
  list && (
    <Fragment>
      {scenario === "similar" && (
        <ScrollingItemCards headingId="similar-cars">
          <SectionHead slot="title" title="Similar cars" headingId="similar-cars" linkHref="/search" linkLabel="View all" />
          {list.map((car, i) => (
            <div class="scrolling-item-cards__item">
              <ListingCard href={`/m/${car.id}/`} headingId={`similar-${car.id}`} headingLevel={3}>
                <img
                  slot="media"
                  class="listing-card__image"
                  src={`/m/${car.id}/cover/`}
                  alt=""
                  width="640"
                  height="480"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchpriority={i === 0 ? "high" : undefined}
                  decoding="async"
                />
                <Fragment slot="title">{car.title}</Fragment>
                <Fragment slot="price">{car.price}</Fragment>
              </ListingCard>
            </div>
          ))}
        </ScrollingItemCards>
      )}
      {scenario === "promo" && (
        <ScrollingItemCards label="Featured cars">
          <div slot="titleCard">
            <h2>This week's picks</h2>
          </div>
          {list.map((car, i) => (
            <div class="scrolling-item-cards__item">
              <ListingCard href={`/m/${car.id}/`} headingId={`featured-${car.id}`} headingLevel={3}>
                <img
                  slot="media"
                  class="listing-card__image"
                  src={`/m/${car.id}/cover/`}
                  alt=""
                  width="640"
                  height="480"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchpriority={i === 0 ? "high" : undefined}
                  decoding="async"
                />
                <Fragment slot="title">{car.title}</Fragment>
                <Fragment slot="price">{car.price}</Fragment>
              </ListingCard>
            </div>
          ))}
        </ScrollingItemCards>
      )}
      {scenario === "no-overflow" && (
        <ScrollingItemCards label="One car">
          {list.map((car) => (
            <div class="scrolling-item-cards__item">
              <ListingCard href={`/m/${car.id}/`} headingId={`one-${car.id}`} headingLevel={3}>
                <img
                  slot="media"
                  class="listing-card__image"
                  src={`/m/${car.id}/cover/`}
                  alt=""
                  width="640"
                  height="480"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                />
                <Fragment slot="title">{car.title}</Fragment>
                <Fragment slot="price">{car.price}</Fragment>
              </ListingCard>
            </div>
          ))}
        </ScrollingItemCards>
      )}
      {scenario === "footer" && (
        <ScrollingItemCards headingId="with-footer">
          <h2 id="with-footer" slot="title">Just listed</h2>
          {list.map((car, i) => (
            <div class="scrolling-item-cards__item">
              <ListingCard href={`/m/${car.id}/`} headingId={`listed-${car.id}`} headingLevel={3}>
                <img
                  slot="media"
                  class="listing-card__image"
                  src={`/m/${car.id}/cover/`}
                  alt=""
                  width="640"
                  height="480"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchpriority={i === 0 ? "high" : undefined}
                  decoding="async"
                />
                <Fragment slot="title">{car.title}</Fragment>
                <Fragment slot="price">{car.price}</Fragment>
              </ListingCard>
            </div>
          ))}
          <p slot="footer">Prices include taxes.</p>
        </ScrollingItemCards>
      )}
    </Fragment>
  )
}
```

Create `stories/ui/ScrollingItemCards.stories.ts`:

```ts
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
```

- [ ] **Step 4: Update globs exact titles**

```js
  assert.deepEqual(titles(ASTRO_STORY_GLOBS), [
    "Components/Button",
    "Components/Dialog",
    "Components/Footer",
    "Components/ListingCard",
    "Components/Logo",
    "Components/ProgramBadge",
    "Components/ScrollingItemCards",
    "Components/SectionHead",
    "Components/SiteHeader",
  ]);
```

- [ ] **Step 5: Run unit + globs tests**

Run: `node --test tests/scrolling-item-cards.test.js tests/storybook-globs.test.js tests/listing-card.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/astro/ui/ScrollingItemCards.astro stories/scrolling-item-cards-cases.ts stories/ui/ScrollingItemCards.stories.ts stories/ui/ScrollingItemCardsDemo.astro tests/storybook-globs.test.js
git commit -m "$(cat <<'EOF'
feat(ScrollingItemCards): add Astro scroller and stories

EOF
)"
```

---

### Task 5: lx-scrolling-item-cards (Marko)

**Files:**
- Create: `src/marko/lx-scrolling-item-cards/index.marko`
- Create: `src/marko/lx-scrolling-item-cards/demo.marko`
- Create: `src/marko/lx-scrolling-item-cards/stories.ts`
- Modify: `marko.json`
- Modify: `tsconfig.marko.json` (add `stories/scrolling-item-cards-cases.ts`)

**Interfaces:**
- Consumes: `initScrollingItemCards`, `cn`, shared CSS; AttrTags `@title` `@titleCard` repeating `@item` `@footer`.
- Produces: same element tree as Astro for the same inputs (aside from whitespace). Wraps each `@item` in `.scrolling-item-cards__item`. Story title `Components/scrolling-item-cards`. Script install: `script -- initScrollingItemCards(root() as HTMLElement)` (same `script --` + tagged node ref as `lx-site-header/base.marko`'s `wireSiteMenu(menu() as HTMLDetailsElement, $signal)`). Do **not** pass `$signal`: `initScrollingItemCards` uses a WeakSet no-op instead of abortable listeners.

- [ ] **Step 1: Register tag + tsconfig include**

Add to `marko.json`:

```json
"<lx-scrolling-item-cards>": { "template": "./src/marko/lx-scrolling-item-cards/index.marko" }
```

Extend `tsconfig.marko.json` `include` with `"stories/scrolling-item-cards-cases.ts"`.

- [ ] **Step 2: Implement the Marko tag**

Create `src/marko/lx-scrolling-item-cards/index.marko`:

```marko
/*
  Horizontal scroller for Marko 6 — twin of `astro/ui/ScrollingItemCards.astro`.
  Shared CSS + initScrollingItemCards. Concise Tags API only. No Marko-only CSS.
*/
import { cn } from "../../utils/cn.js"
import { initScrollingItemCards } from "../../scripts/scrolling-item-cards.js"
import "../../styles/scrolling-item-cards.css"

export interface Input extends Omit<Marko.HTML.Section, "content" | "aria-label" | "aria-labelledby"> {
  headingId?: string
  label?: string
  /** @default "Previous" */
  prevLabel?: string
  /** @default "Next" */
  nextLabel?: string
  title?: Marko.AttrTag<{ content: Marko.Body }>
  titleCard?: Marko.AttrTag<{ content: Marko.Body }>
  /** Repeatable item cards. */
  item?: Marko.AttrTag<{ content: Marko.Body }>
  footer?: Marko.AttrTag<{ content: Marko.Body }>
  content?: never
}

const/{
  headingId,
  label,
  prevLabel = "Previous",
  nextLabel = "Next",
  class: className,
  title,
  titleCard,
  item,
  footer,
  content: _content,
  "aria-label": _a,
  "aria-labelledby": _b,
  ...attrs
}=input

const/_named=(headingId || (typeof label === "string" && label.trim()))
const/_assert=_named ? true : (() => { throw new Error("ScrollingItemCards: one of `headingId` or `label` is required.") })()

section/root ...attrs class=cn("scrolling-item-cards", className) aria-labelledby=headingId aria-label=(headingId ? undefined : label)
  if=title
    div.scrolling-item-cards__header
      ${title.content}
  div.scrolling-item-cards__viewport
    button.scrolling-item-cards__control.scrolling-item-cards__control--prev type="button" aria-label=prevLabel hidden
      svg.scrolling-item-cards__control-icon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        polyline points="15 18 9 12 15 6"
    div.scrolling-item-cards__flow
      if=titleCard
        div.scrolling-item-cards__title-card
          ${titleCard.content}
      div.scrolling-item-cards__track
        for|entry| of=item
          div.scrolling-item-cards__item
            ${entry.content}
    button.scrolling-item-cards__control.scrolling-item-cards__control--next type="button" aria-label=nextLabel hidden
      svg.scrolling-item-cards__control-icon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        polyline points="9 18 15 12 9 6"
  if=footer
    div.scrolling-item-cards__footer
      ${footer.content}

script -- initScrollingItemCards(root() as HTMLElement)
```

If `for|entry| of=item` fails when `item` is a single AttrTag, use the Marko 6 iterable AttrTag form that neighbouring repeatable tags use (AttrTags are iterable whether one or many). Verify with one and many `@item`s in stories.

- [ ] **Step 3: Marko demo wrapper and stories**

Create `src/marko/lx-scrolling-item-cards/demo.marko`:

```marko
/*
  Storybook demo wrapper for <lx-scrolling-item-cards>. Composes
  <lx-listing-card> the way a Marko app would (no Marko SectionHead —
  a heading in `@title` is enough).
*/
import ScrollingItemCards from "./index.marko"
import ListingCard from "../lx-listing-card/index.marko"

export interface Input {
  scenario: "similar" | "promo" | "no-overflow" | "footer"
}

const/{ scenario }=input
const/cars=[{ id: "1", title: "Range Rover Vogue", price: "MYR 450,000" }, { id: "2", title: "Porsche 911", price: "MYR 890,000" }, { id: "3", title: "BMW M4", price: "MYR 520,000" }, { id: "4", title: "Mercedes-AMG GT", price: "MYR 780,000" }]
const/list=(scenario === "no-overflow" ? cars.slice(0, 1) : cars)

if(scenario === "similar")
  ScrollingItemCards headingId="similar-cars"
    @title
      h2#similar-cars -- Similar cars
    for|car, i| of=list
      @item
        ListingCard href=`/m/${car.id}/` headingId=`similar-${car.id}` headingLevel=3
          @media
            if(i === 0)
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="eager" fetchpriority="high" decoding="async"
            else
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="lazy" decoding="async"
          @title -- ${car.title}
          @price -- ${car.price}
else if(scenario === "promo")
  ScrollingItemCards label="Featured cars"
    @titleCard
      h2 -- This week's picks
    for|car, i| of=list
      @item
        ListingCard href=`/m/${car.id}/` headingId=`featured-${car.id}` headingLevel=3
          @media
            if(i === 0)
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="eager" fetchpriority="high" decoding="async"
            else
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="lazy" decoding="async"
          @title -- ${car.title}
          @price -- ${car.price}
else if(scenario === "no-overflow")
  ScrollingItemCards label="One car"
    for|car| of=list
      @item
        ListingCard href=`/m/${car.id}/` headingId=`one-${car.id}` headingLevel=3
          @media
            img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="eager" fetchpriority="high" decoding="async"
          @title -- ${car.title}
          @price -- ${car.price}
else if(scenario === "footer")
  ScrollingItemCards headingId="with-footer"
    @title
      h2#with-footer -- Just listed
    for|car, i| of=list
      @item
        ListingCard href=`/m/${car.id}/` headingId=`listed-${car.id}` headingLevel=3
          @media
            if(i === 0)
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="eager" fetchpriority="high" decoding="async"
            else
              img.listing-card__image src=`/m/${car.id}/cover/` alt="" width="640" height="480" loading="lazy" decoding="async"
          @title -- ${car.title}
          @price -- ${car.price}
    @footer
      p -- Prices include taxes.
```

If a `for` loop cannot emit nested `@item` attribute tags, unroll the four cards as repeated `@item` blocks — do not change the rendered tree.

Create `src/marko/lx-scrolling-item-cards/stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/marko";
import Demo, { type Input } from "./demo.marko";
import { initScrollingItemCards } from "../../scripts/scrolling-item-cards.js";

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
    initScrollingItemCards(root);
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
```

- [ ] **Step 4: Run marko-tags + scroller unit tests**

Run: `node --test tests/marko-tags.test.js tests/scrolling-item-cards.test.js tests/marko-source.test.js`

Expected: PASS; both new tags registered; no `$` scriptlets.

- [ ] **Step 5: Commit**

```bash
git add src/marko/lx-scrolling-item-cards marko.json tsconfig.marko.json
git commit -m "$(cat <<'EOF'
feat(lx-scrolling-item-cards): add Marko scroller tag

EOF
)"
```

---

### Task 6: Packaging, README, changeset, full verification

**Files:**
- Modify: `package.json` (`exports`)
- Modify: `README.md`
- Create: `.changeset/scrolling-item-cards.md`

**Interfaces:**
- Produces package subpaths:
  - `"./styles/scrolling-item-cards.css": "./src/styles/scrolling-item-cards.css"`
  - `"./scripts/scrolling-item-cards": { "types": "./src/scripts/scrolling-item-cards.d.ts", "default": "./src/scripts/scrolling-item-cards.js" }`
- Astro still via `./astro/*`; Marko via `./marko/lx-*` + `marko.json`.
- Minor changeset for `@luxoticars/ui`.

- [ ] **Step 1: Add exports**

In `package.json` `exports`, next to the dialog script / listing-card style entries, add:

```json
"./styles/scrolling-item-cards.css": "./src/styles/scrolling-item-cards.css",
"./scripts/scrolling-item-cards": {
  "types": "./src/scripts/scrolling-item-cards.d.ts",
  "default": "./src/scripts/scrolling-item-cards.js"
}
```

Do **not** change `./styles/listing-card.css` or `./utils/listing-card`.

- [ ] **Step 2: README**

In `README.md`, under Astro API / Marko API (short subsection, no props table), mention:

- `ListingCard` / `<lx-listing-card>` — slotted listing card; components import the shared stylesheet; callers still use `@luxoticars/ui/utils/listing-card` to format text into slots.
- `ScrollingItemCards` / `<lx-scrolling-item-cards>` — horizontal scroller; stylesheet `@luxoticars/ui/styles/scrolling-item-cards.css`; script `@luxoticars/ui/scripts/scrolling-item-cards` (`initScrollingItemCards`) installed by the components.
- Image-loading contract: default `loading="lazy"` `decoding="async"`; first-visible/LCP may use `fetchpriority="high"` and eager loading; decorative `alt=""`.

- [ ] **Step 3: Changeset**

Create `.changeset/scrolling-item-cards.md`:

```md
---
"@luxoticars/ui": minor
---

Add slotted `ListingCard` / `<lx-listing-card>` and `ScrollingItemCards` / `<lx-scrolling-item-cards>` (Astro + Marko), with shared scroller CSS and `initScrollingItemCards`.
```

- [ ] **Step 4: Full verification checklist (run in order)**

```bash
# 1. Unit tests (createListingCard stays green; new script + slots + parity + globs + marko-tags)
npm test

# 2–3. Type gates (transient install per CONTRIBUTING.md)
npm i --no-save @astrojs/check @marko/type-check @emnapi/runtime@1.11.3
npx astro check && rm -rf .astro
npx mtc -p tsconfig.marko.json

# 4. Exports
npm run check:exports

# 5. Storybook build + index presence
npm run build-storybook
node -e "const fs=require('fs'); const a=JSON.parse(fs.readFileSync('storybook-static/astro/index.json','utf8')); const m=JSON.parse(fs.readFileSync('storybook-static/marko/index.json','utf8')); const ae=JSON.stringify(a); const me=JSON.stringify(m); if(!ae.includes('ListingCard')||!ae.includes('ScrollingItemCards')) throw new Error('astro stories missing'); if(!me.includes('listing-card')||!me.includes('scrolling-item-cards')) throw new Error('marko stories missing'); console.log('story indices ok');"

# 6. Story / a11y tests (needs Chromium once)
npx playwright install chromium
npm run test:stories
```

Expected:

1. `npm test` — all pass (including existing `createListingCard` tests).
2. `astro check` — prints `Result (N files): 0 errors`.
3. `mtc` — 0 errors.
4. `check:exports` — `exports check passed (… subpaths, v0.16.0)` (version unchanged until release).
5. `build-storybook` succeeds; node assertion prints `story indices ok`.
6. `test:stories` — pass, including a11y (`parameters.a11y.test: "error"` in previews). Confirm: named region; named prev/next; `hidden` before enhancement / when no overflow; one link per card (action case uses a button — still one link); lazy vs `fetchpriority` from listing-card plays.
7. Parity covered by `tests/listing-card-parity.test.js` + story plays.
8. No-JS: static markup includes `hidden` on both controls; track remains `overflow-x: auto` (swipe/shift-scroll still works).

- [ ] **Step 5: Commit**

```bash
git add package.json README.md .changeset/scrolling-item-cards.md
git commit -m "$(cat <<'EOF'
feat: export scrolling-item-cards and document ListingCard

EOF
)"
```

---

## Self-review (author)

### Spec coverage

| Spec requirement | Task |
| --- | --- |
| ListingCard slots media/kicker/title/price/meta/location/action | 1, 2 |
| href/title/price required throws | 1 (`assertListingCardSlots`), 2 |
| headingLevel 2\|3 default 2; headingId → aria-labelledby; linkLabel; cn class | 1, 2 |
| Empty optional slots omit wrappers | 1, 2 |
| Additive `__action` CSS only | 1 |
| Image-loading contract + stories lazy/priority | 1, 2, 6 (README) |
| No listing object prop; utils/listing-card unchanged | Global + Tasks 1–6 |
| ScrollingItemCards slots title/titleCard/items/footer | 4, 5 |
| headingId \| label required; prev/next labels; cn | 4, 5 |
| CSS flow/track/display:contents + CQ + media + reduced motion | 3 |
| initScrollingItemCards; double-init no-op; button states; focus move; scrollBy step; flow vs track scrollport | 3 |
| Markup shape; decorative chevrons; hidden until JS | 3–5 |
| No WAI-ARIA carousel; no ebay port; no Marko SectionHead; no Marko-only CSS | Global |
| Stories + Show code consumer markup | 1, 4 |
| Marko titles neighbouring style | 2, 5 (`Components/listing-card`, `Components/scrolling-item-cards`) |
| package exports + minor changeset + README | 6 |
| Verification commands 1–9 | 6 |
| Parity Astro/Marko listing-card cases | 2 |
| createListingCard / HTML stories untouched | Global |

### Placeholder scan

No TBD/TODO/`implement later` left as unfinished work. Complete code is provided for helpers, CSS, script, Astro, Marko, tests, exports, changeset, `ScrollingItemCardsDemo.astro`, and `demo.marko`.

### Type/name consistency

- `initScrollingItemCards` (not `installScrollingItemCards` / not dialog’s `installDialogFallbacks` naming).
- Classes: `scrolling-item-cards`, `listing-card`, `__action`, `__item`, etc. match the spec.
- Slots: `titleCard` (camelCase), Marko `@titleCard` / `@item`.
- Throw prefix `ListingCard:` / `ScrollingItemCards:`.

### Known uncertainties (prefer spec; do not invent silently)

1. **Marko AttrTag `content` in Storybook/node render** — prop-only neighbours pass plain args; slotted AttrTags may need render-body functions. Task 2 notes fixing the AttrTag shape against Marko 6.4.x rather than adding DOM libraries.
2. **Astro default-slot per-child `__item` wrapping** — Astro cannot iterate slot children like Marko `@item`. Plan: callers/stories wrap each card in `__item`; Marko wraps `@item`. Spec markup is still achieved. No runtime DOM rewriter.
3. **Focus unit-test fakeness** — hand-rolled DOM fakes (same spirit as site-header hide-on-scroll tests). Adjust the fake to match what the script calls; do not drop focus rules.
4. **Marko story titles** — neighbouring tags use `Components/program-badge` and `Components/logo` (no `lx-` prefix). Spec table suggested `Components/lx-listing-card`; this plan follows the neighbouring convention instead.
5. **Dialog script name vs scroller** — repo uses `installDialogFallbacks` (document-wide). Spec locks scroller to per-root `initScrollingItemCards`; plan follows the spec.
6. **No `lx-dialog` Marko tag** — script install for Marko follows `lx-site-header` (`script -- init…(root())`), not a Dialog Marko twin.
