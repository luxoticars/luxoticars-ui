# Scrolling item cards and slotted listing-card — design

Date: 2026-11-06
Status: approved for planning

## Goal

Ship two complementary components in **Astro** and **Marko**, following how eBay
splits `su-scrolling-item-cards` (the scroller) from `su-item-card` (the card):

1. **`ScrollingItemCards` / `<lx-scrolling-item-cards>`** — a horizontal scroller
   that does not bake in listings. Consumers slot a header, an optional promo
   title-card, any number of item cards, and an optional footer.
2. **`ListingCard` / `<lx-listing-card>`** — the listing card as its own
   component, with a slot API as close to `su-item-card` as is practical for
   Luxoticars (media, kicker, title, price, meta, location, action).

Two layouts, both required:

- **Similar cars** — a header above the track (Astro consumers may put
  `SectionHead` in the title slot; the scroller does not depend on it).
- **Promo** — a title-card that is detached and full-width on small screens,
  and the first carousel item from `768px` up.

The carousel moves by **native `overflow-x` + `scroll-snap`**, plus **Previous /
Next buttons** (a little JS). Swipe, trackpad and drag-scroll always work.
Accessibility is a priority. Images in a listing card must lazy-load by default
(progressive enhancement: they still appear with no JS); a first-visible / LCP
card may use `fetchpriority="high"` instead of lazy loading.

## Non-goals

- An HTML builder (`createScrollingItemCards`, or any change to
  `createListingCard`). HTML is explicitly on hold.
- A Marko port of `SectionHead`.
- A port of `ebay-carousel` (index-based slides, pagination dots, live regions,
  autoplay).
- Cloning unused `su-item-card` / `su-scrolling-item-cards` API: `@subtitle`,
  `@description`, `@info`, per-item `@header`, original/strikethrough price,
  shipping, seller, sponsored, quantity.
- Changing the visual design of the existing HTML listing card, other than
  additive styles needed for the new `action` slot.
- Rewriting `src/utils/listing-card.js`. Those helpers stay the way callers
  format kicker, title, price, meta and location text.

## Provenance

The idea comes from eBay Sonata UI's `su-scrolling-item-cards` (which wraps
`ebay-carousel` and slots `@title`, `@subtitle`, `@description`, `@info`,
`@item`, `@footer`, with `hasTitleCard` / `responsiveTitleCard`) and
`su-item-card` (slot-composed media, title, price, and related regions).
**No code, CSS, stories or artwork are copied.** The motion model is native
CSS scroll rather than `ebay-carousel`.

| eBay | This design | Why |
|------|-------------|-----|
| `su-scrolling-item-cards` wraps `ebay-carousel` | Native `overflow-x` + `scroll-snap` + prev/next | Approved approach A: free scroll plus buttons, less JS |
| `@title` `@subtitle` `@description` `@info` | One `title` slot | `SectionHead` (or any heading + optional “View all” link) already covers the Similar-cars header |
| `hasTitleCard` / `responsiveTitleCard` | Infer title-card from the `titleCard` slot; always responsive | No extra boolean when the slot’s presence is enough |
| `@item` | `item` (Marko, repeatable) / default slot children (Astro) | Same composition: the scroller does not know what a card is |
| `@footer` | `footer` | Cheap and useful (disclaimers, “View all”) |
| `su-item-card` slots (`media`, `title`, `price`, …) | `media`, `kicker`, `title`, `price`, `meta`, `location`, `action` | The regions Luxoticars listing cards already show, plus `action` so a control can sit above the stretched link |
| Per-item header, shipping, sponsored, … | Omitted | Not used |

## Current state (upstream/main, v0.16.0)

| Item | Today |
|------|-------|
| Listing card | HTML builder only: `src/html/listing-card.js` (`createListingCard`). Markup: `<article class="listing-card">` with `__media` (image `loading="lazy"` `decoding="async"` `alt=""` inside `aria-hidden` media, or “Photo unavailable”), optional `__kicker`, `__title` + stretched `__link`, `__price`, optional `__meta`, `__location` + optional flag. |
| Listing card CSS | `src/styles/listing-card.css`, exported as `@luxoticars/ui/styles/listing-card.css`. Grid-oriented (`height: 100%`, `min-width: 0`); no horizontal-scroller width. |
| Listing text helpers | `src/utils/listing-card.js` (`cardKicker`, `cardTitle`, `cardMeta`, `cardPrice`, `cardLocation`, `mileageLabel`). |
| Section header | `SectionHead.astro` only (`title`, `headingId`, `tone`, `linkHref` / `linkLabel`, default slot). No Marko tag. |
| Carousel / scroller | None. |
| Dual-runtime pattern | Astro under `src/astro/` (page chrome) and `src/astro/ui/` (Button, Dialog, ProgramBadge); Marko tags under `src/marko/lx-*/index.marko` with `stories.ts` beside the tag. Shared CSS + a small script where behaviour needs JS (`src/scripts/dialog.js`). |
| Storybook | Host (HTML + Skin) + Astro ref (`stories/ui/*.stories.ts` already in the Astro glob) + Marko ref (`src/marko/**/stories.ts`). |

## Architecture

Two components, one job each. The scroller never imports the listing card.
The listing card never knows it might sit in a scroller.

| Concern | Home | Owns |
|---------|------|------|
| Listing-card presentation | `src/styles/listing-card.css` (already exported) | Existing BEM block, plus additive `__action` rules so a control is clickable above the stretched link |
| Scroller presentation | `src/styles/scrolling-item-cards.css` (new export) | Header, responsive title-card, track, snap, prev/next chrome |
| Scroller behaviour | `src/scripts/scrolling-item-cards.js` (+ `.d.ts`) | Progressive enhancement: show prev/next, `scrollBy` one item, enable/disable at the ends, listen for `scroll` / `resize`. No-op to install twice on the same root. |
| Rendering, Astro | `src/astro/ui/ListingCard.astro`, `src/astro/ui/ScrollingItemCards.astro` | Slots and props in, shared CSS imported, scroller script installed via a processed `<script>` |
| Rendering, Marko | `src/marko/lx-listing-card/index.marko`, `src/marko/lx-scrolling-item-cards/index.marko` | Same tree as Astro for the same inputs. Marko 6 Tags API, concise syntax only. |
| Story cases | `stories/listing-card-cases.ts`, `stories/scrolling-item-cards-cases.ts` | Framework-free cases shared by Astro stories, Marko stories, and parity checks |

Rules:

1. Shared CSS and the scroller script import nothing from Astro or Marko.
2. The two renderers never import each other and produce the same element tree
   (tag names, attributes, trimmed text) for the same cases, aside from
   whitespace.
3. Do not add a Marko-only stylesheet fork. Both renderers import the files
   under `src/styles/`.
4. `createListingCard` and `HTML/createListingCard` stories are left alone.

## ListingCard

### Slots

| Slot | Region | Notes |
|------|--------|-------|
| `media` | `.listing-card__media` | Always `aria-hidden="true"` (same as today’s HTML card: the title names the card). Do not put essential text only here. |
| `kicker` | `.listing-card__kicker` | Year · make, or a `ProgramBadge`. Omit the wrapper when the slot is empty. |
| `title` | Inside the heading + stretched link | Phrasing/text only — not a nested link. Required; throw if missing or whitespace-only. |
| `price` | `.listing-card__price` | Required; throw if missing or whitespace-only. |
| `meta` | `.listing-card__meta` | Condition · type · mileage. Omit wrapper when empty. |
| `location` | `.listing-card__location` | May include a flag image (`alt=""`; the state is named in the text). Omit wrapper when empty. |
| `action` | `.listing-card__action` | Optional control (save, compare). Positioned above the stretched link (`position: relative; z-index: 1`) so it is reachable by pointer and keyboard. |

Empty optional slots render nothing — no empty `<p>`.

Callers that already have a listing object keep using
`@luxoticars/ui/utils/listing-card` to format the text they put in the slots.
The component does not accept a `listing` object; slots are the API.

### Props

| Prop | Purpose |
|------|---------|
| `href` | Required. Target of the single stretched title link (`.listing-card__link`). Without it the component throws: a card with no link would fail the “one name, one link” contract. |
| `headingLevel` | `2` or `3`. Default `2`, matching `createListingCard`. |
| `headingId` | Optional id on the heading. When set, the `<article>` gets `aria-labelledby` pointing at it. |
| `linkLabel` | Optional `aria-label` on the stretched link. When omitted, the link is named by the title slot’s text (today’s HTML builder sets `aria-label` to the full listing title because visible text is the stripped `cardTitle`; slotted callers who want that difference pass `linkLabel`). |
| `class` / other native attributes | Spread onto the `<article>`, with `class` merged onto `listing-card` via `cn()`. |

### Image loading (required)

The card does not invent an `<img>` — the caller puts it in `media`. Any image
in that slot **must** be progressive:

- Default: `loading="lazy"` and `decoding="async"`.
- The first visible / LCP card in a row may use `fetchpriority="high"` and
  omit lazy loading (`loading="eager"` or no `loading` attribute).
- Decorative photos use `alt=""` (the title already names the card), matching
  `createListingCard`.

Stories demonstrate both the lazy default and one priority image. This is a
documented contract, not a runtime rewrite of slotted markup.

### Markup shape

Identical from both renderers, apart from whitespace:

```html
<article class="listing-card" aria-labelledby="listing-card-1">
  <div class="listing-card__media" aria-hidden="true">
    <img class="listing-card__image" src="…" alt="" loading="lazy" decoding="async" width="640" height="480">
  </div>
  <div class="listing-card__body">
    <p class="listing-card__kicker">2021 · Land Rover</p>
    <h2 class="listing-card__title" id="listing-card-1">
      <a class="listing-card__link" href="/m/abc/">Range Rover Vogue</a>
    </h2>
    <p class="listing-card__price">MYR 450,000</p>
    <p class="listing-card__meta">Recon · SUV · 5,001 – 10,000 km</p>
    <p class="listing-card__location"><span>Bangsar, W.P. Kuala Lumpur</span></p>
  </div>
  <!-- .listing-card__action only when the action slot is used -->
</article>
```

The existing listing-card CSS continues to apply (stretched link, focus ring on
the card via `:has(.listing-card__link:focus-visible)`, hover shadow, reduced
motion). Additive CSS only:

- `.listing-card__action` sits above the stretched `::after` hit area.
- No change to hover, type, or focus behaviour of the HTML builder’s markup.

### Usage sketches

Astro:

```astro
---
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ListingCard href="/m/abc/" headingId="listing-card-1">
  <img slot="media" class="listing-card__image" src={src} alt="" width="640" height="480" loading="lazy" decoding="async" />
  <Fragment slot="kicker">{kicker}</Fragment>
  <Fragment slot="title">{title}</Fragment>
  <Fragment slot="price">{price}</Fragment>
  <Fragment slot="meta">{meta}</Fragment>
  <Fragment slot="location">{location}</Fragment>
</ListingCard>
```

Marko (concise Tags API; `@title` here is the card title slot):

```marko
lx-listing-card href="/m/abc/" headingId="listing-card-1"
  @media
    img.listing-card__image src=src alt="" width="640" height="480" loading="lazy" decoding="async"
  @kicker -- ${kicker}
  @title -- ${title}
  @price -- ${price}
  @meta -- ${meta}
  @location -- ${location}
```

## ScrollingItemCards

### Slots

| Slot | Role |
|------|------|
| `title` | Header **above** the track. Suitable for `SectionHead` (Astro) or any heading, optionally with a “View all” link. |
| `titleCard` | Promo card. When present, layout is always the responsive title-card behaviour below. |
| default children (Astro) / repeating `item` (Marko) | The cards. Each child is wrapped as one snap item. The scroller does not inspect what they are. |
| `footer` | Optional content below the track. |

There is no `hasTitleCard` or `responsiveTitleCard` prop. If `titleCard` has
content, the responsive layout applies. If it is empty, nothing is reserved
for it.

### Props

| Prop | Purpose |
|------|---------|
| `headingId` | Optional. When the title slot contains a heading with this id, the outer `<section>` uses `aria-labelledby`. |
| `label` | Accessible name for the section when there is no `headingId` (`aria-label`). One of `headingId` or `label` is required so the region has a name — throw otherwise. |
| `prevLabel` | Accessible name of the previous button. Default `"Previous"`. |
| `nextLabel` | Accessible name of the next button. Default `"Next"`. |
| `class` / other native attributes | Spread onto the `<section>`, `class` merged onto `scrolling-item-cards`. |

### Layout

One `titleCard` node in the DOM (never duplicated, no JS breakpoint listener).
CSS rearranges which element is the horizontal scrollport:

- **Below `768px`:** `.scrolling-item-cards__flow` is a column. The title-card
  is detached, full width, above the track. Only `.scrolling-item-cards__track`
  is `overflow-x: auto`.
- **`768px` and up:** `.scrolling-item-cards__flow` becomes the scrollport
  (`overflow-x: auto` + snap). The title-card is the first snap item,
  `max-width: 225px`. `.scrolling-item-cards__track` uses `display: contents`
  so the listing items join that same scrollport and the title-card can
  scroll away with them.

Use a container query on `.scrolling-item-cards` (`@container`, min-width
`768px`) and the same numbers in a `@media (min-width: 768px)` fallback, so
the layout still flips when the section is not a container query container.

The active scrollport uses `overflow-x: auto` (not `scroll`, so unused
scrollbars can hide), `scroll-snap-type: x mandatory`, and
`-webkit-overflow-scrolling: touch`. Each listing item (and the in-flow
title-card from `768px` up) has `scroll-snap-align: start` and a fixed width
via `--scrolling-item-cards-item-width` (default `16.5rem`) plus a `1rem` gap,
so the next card peeks. Listing cards inside stretch to the item box
(`height: 100%` already).

`prefers-reduced-motion: reduce`: `scroll-behavior: auto` (no smooth scroll)
and `scroll-snap-type: x proximity` (less aggressive snapping).

### Motion and buttons

- Native overflow is the source of truth. The script scrolls whichever
  element is the active scrollport (the track below `768px`, the flow from
  `768px` up when a title-card is present; the track in every other case).
  Buttons measure the first item’s `offsetWidth` plus the track gap and call
  `scrollBy({ left: ±thatAmount, behavior })`.
- Buttons overlay the left and right edges of the viewport.
- Until JS runs, the buttons are not shown (`hidden`), so a no-JS visitor
  never tabs to a dead control. They can still swipe or shift-scroll.
- After `initScrollingItemCards(root)`:
  - If the active scrollport does not overflow, both buttons stay hidden.
  - If it overflows, the relevant button is shown; at the start the previous
    button is `disabled`, at the end the next button is `disabled`.
  - `scroll`, `resize`, and a `ResizeObserver` on the scrollport update that
    state.
- Focus must not vanish when a button becomes disabled: if the focused button
  is the one that disables, move focus to the other button if it is enabled,
  otherwise to the `<section>`.
- Activating a button does **not** move focus into a card.
- The track itself is not given `tabindex="0"` — the buttons are the keyboard
  path, so the region does not add an extra tab stop.

Install the script the same way Dialog and the site-header scroll extras do:
export `initScrollingItemCards` from `@luxoticars/ui/scripts/scrolling-item-cards`,
and have both renderers invoke it on their root. Installation on the same root
twice is a no-op.

### Markup shape

```html
<section class="scrolling-item-cards" aria-labelledby="similar-cars">
  <div class="scrolling-item-cards__header">
    <!-- title slot, e.g. SectionHead with id="similar-cars" -->
  </div>
  <div class="scrolling-item-cards__viewport">
    <button type="button" class="scrolling-item-cards__control scrolling-item-cards__control--prev" aria-label="Previous" hidden></button>
    <div class="scrolling-item-cards__flow">
      <div class="scrolling-item-cards__title-card">
        <!-- titleCard slot; present only when used -->
      </div>
      <div class="scrolling-item-cards__track">
        <div class="scrolling-item-cards__item"><!-- each item --></div>
      </div>
    </div>
    <button type="button" class="scrolling-item-cards__control scrolling-item-cards__control--next" aria-label="Next" hidden></button>
  </div>
  <!-- optional .scrolling-item-cards__footer -->
</section>
```

Visible control icons are decorative (`aria-hidden="true"`); the accessible
name is the `aria-label`. Use a simple currentColor chevron, not a new icon
set.

### Usage sketches

Similar cars (Astro):

```astro
<ScrollingItemCards headingId="similar-cars">
  <SectionHead slot="title" title="Similar cars" headingId="similar-cars" linkHref="/search" linkLabel="View all" />
  {listings.map((listing, i) => (
    <ListingCard href={`/m/${listing.id}/`} headingId={`similar-${listing.id}`} headingLevel={3}>
      <img
        slot="media"
        class="listing-card__image"
        src={listing.imageSrc}
        alt=""
        width="640"
        height="480"
        loading={i === 0 ? "eager" : "lazy"}
        fetchpriority={i === 0 ? "high" : undefined}
        decoding="async"
      />
      <!-- kicker, title, price, meta, location -->
    </ListingCard>
  ))}
</ScrollingItemCards>
```

Promo (Marko): title-card in `@titleCard`, cards in repeated `@item`. No
header slot required if `label` names the region (for example
`label="Featured cars"`).

## Accessibility

- The scroller is a named `<section>` (`aria-labelledby` or `aria-label`).
- One link per listing card (stretched title link). The `action` slot is the
  supported escape hatch for a second control.
- Media is decorative (`aria-hidden` on the region, `alt=""` on photos).
- Prev/Next are real `<button type="button">` elements with clear names.
- Keyboard and pointer both work; swipe/trackpad work with no JS.
- `prefers-reduced-motion` is honoured as specified above.
- Focus is not lost when controls disable, and is not forcibly moved into
  cards after a click.
- Do not implement the full WAI-ARIA Carousel pattern (slide indexes, live
  region announcements). Native scrolling plus named buttons is the
  accessible model here.

## Storybook

Astro stories go under `stories/ui/` so the existing `ASTRO_STORY_GLOBS`
entry `../stories/ui/*.stories.ts` picks them up with no glob change:

| File | Title |
|------|-------|
| `stories/ui/ListingCard.stories.ts` | `Components/ListingCard` |
| `stories/ui/ScrollingItemCards.stories.ts` | `Components/ScrollingItemCards` |
| `src/marko/lx-listing-card/stories.ts` | Marko `Components/lx-listing-card` (follow neighbouring tag title style) |
| `src/marko/lx-scrolling-item-cards/stories.ts` | Marko `Components/lx-scrolling-item-cards` |

Cases (shared, framework-free):

- **ListingCard:** default card, no-photo, with kicker/meta/location, with
  `action`, heading level 3, priority image (`fetchpriority="high"`).
- **ScrollingItemCards:** Similar cars (title slot + several listing cards,
  first image priority, the rest lazy); promo (title-card + listing cards);
  no overflow (buttons stay hidden after init); footer present.

Show code for the Astro stories should show consumer markup (imports + slots),
not a raw args object — same expectation as Skin/pill.

## Packaging

| Change | Detail |
|--------|--------|
| `package.json#exports` | `"./styles/scrolling-item-cards.css"` and `"./scripts/scrolling-item-cards"` (types + default), matching `dialog`. Astro paths are covered by `./astro/*`; Marko tags by `./marko/lx-*`. |
| Changeset | **minor** — new components. |
| README | Mention both components and the image-loading contract. |
| `createListingCard` / `./styles/listing-card.css` / `./utils/listing-card` | Unchanged exports. |

## Order of work

1. Additive `.listing-card__action` CSS, then `ListingCard.astro` and
   `lx-listing-card`, with shared cases and stories.
2. `scrolling-item-cards.css` and `src/scripts/scrolling-item-cards.js` with
   unit tests for button state (no overflow, start, middle, end) and for
   double-init being a no-op.
3. `ScrollingItemCards.astro` and `lx-scrolling-item-cards`, with Similar-cars
   and promo stories composing `ListingCard`.
4. Exports, README, minor changeset, verification.

## Verification

All of these must pass before the PR is raised:

1. `npm test`: existing tests stay green (including anything that covers
   `createListingCard`), plus scroller-script tests for the button-state table
   and double-init.
2. `npx astro check`: 0 errors (with `@astrojs/check` installed transiently if
   that is still the repo’s practice).
3. `npx mtc -p tsconfig.marko.json`: 0 errors (same caveat as above).
4. `npm run check:exports`.
5. `npm run build-storybook` succeeds, and both new Astro and Marko stories
   appear in the respective `index.json` files.
6. `npm run test:stories` (or the repo’s Storybook/a11y test command) covers
   the new stories.
7. Parity: for every shared listing-card case, Astro and Marko produce the
   same element tree (tag names, attributes, trimmed text).
8. Accessibility checks on the built stories:
   - The scroller is found as a region/section with the expected name.
   - Prev/Next are found by role `button` and their names; they are absent or
     not displayed before enhancement and when the track does not overflow.
   - Each listing card has exactly one link (two only when the `action` case
     adds a control).
   - Images in default cases have `loading="lazy"`; the documented priority
     case has `fetchpriority="high"`.
9. No JS: the track still scrolls and the buttons are not shown.

## Follow-ups

- HTML builders for both components, when we pick HTML back up.
- A Marko `lx-section-head`, if Similar-cars headers should match Astro
  without consumers writing their own heading.
- Extra `su-item-card` slots (original price, and so on) only if a consumer
  actually needs them.
