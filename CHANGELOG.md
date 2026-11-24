# @luxoticars/ui

## 0.26.0

### Minor Changes

- e728723: `Button` is now Tailwind-free and has a Marko twin, `<lx-button>`. Both print what one resolver (`utils/button`) decides; the Astro button reads `styles/button.css` (also exported as `@luxoticars/ui/styles/button.css`) and the Marko tag its own forked `style.css`.
  
  - **Radius:** a `radius` prop (`field` | `none` | `sm` | `md` | `lg` | `xl` | `2xl` | `full`). `field`, the default, still follows `--radius-field`. `pill` keeps working as shorthand for `radius="full"` and is deprecated; `radius` wins when both are set.
  - **Accessibility:** `aria-expanded` (accordions and disclosures), `aria-haspopup` (menus and modals: `true`, `menu`, `listbox`, `tree`, `grid`, `dialog`) and `aria-controls` are validated and printed as the strings ARIA expects, so `aria-expanded={false}` still says `"false"`. An open button keeps its pressed look.
  - **Restyling:** set `--button-radius`, `--button-bg`, `--button-bg-hover`, `--button-fg`, `--button-height`, `--button-padding-inline`, `--button-font-size` or `--button-ring` on a button.
  - **Behaviour change:** Tailwind utilities passed as `class` no longer override the button's own styles (they sit in a lower layer than plain CSS). Use the props or the `--button-*` hooks instead.
  - **Site header:** the call-to-action in both `SiteHeader` and `<lx-site-header>` is now this button, rendering as before.
- b081407: `ProgressStepper` can now be composed. Each step has a slot for its own markup, named `content-<id>` (give the step an `id`) or `content-<index>` when it has none; the content sits under the step's label and description, in both orientations. New `labelPlacement="inline"` (horizontal) puts each step's text beside its marker, with the line running on after it, instead of under it. The Skin gains `.progress-stepper__body` and `.progress-stepper--labels-inline`. `.progress-stepper__content` is now a `<div>` rather than a `<span>` so it can hold block content; it is already `display: flex`, so nothing moves.

### Patch Changes

- c783b4a: `--lux-primary` and `--lux-marque-accent` now match the sky blue used on the Luxoticars steppers: `oklch(77.8% 0.12 231.7)` (about `#5BC4F6`) instead of the greener cyan `oklch(86% 0.127 207.078)`. `--lux-primary-content` still has 8.3:1 contrast on it. The logo accent line and the header and footer accents change colour with it.
- 8f569e3: The progress stepper's markers are now filled with `--lux-primary` and carry `--lux-primary-content`, as in the Luxoticars design, instead of the darker `--lux-accent`. Complete and current markers (and the loading arc) are filled primary with a ring and rail pulled towards the text colour, which keeps 3:1 or better against the page in both themes. The footer's top seam is now a hairline in the brand primary instead of grey. `ProgressStepper` and `.footer__seam` / `.lx-site-footer__seam` change colour; no markup or props change.
  
  `ProgramBadge` (Astro and `<lx-program-badge>`) now paints every icon with `--lux-primary` when text names the badge, not only the blue tick and the verified tick. An icon-only badge still uses `--lux-accent`, since primary is about 1.95:1 on white and WCAG asks 3:1 for an icon that stands alone.

## 0.25.0

### Minor Changes

- 29fa222: Add glass tokens (`--lux-glass-*` in `tokens.css`) and a `glass` skin (`@luxoticars/ui/styles/skin/glass.css`): a frosted surface for floating UI, theme-aware inside nested `[data-theme]`, solid under reduced transparency or without `backdrop-filter`.

## 0.24.0

### Minor Changes

- e4b100c: Add a progress stepper: `astro/ui/ProgressStepper` and the `progress-stepper` Skin (`@luxoticars/ui/styles/skin/progress-stepper.css`). Horizontal and vertical, complete / current / upcoming / loading / error states that never rely on colour alone, right-to-left through logical properties, and a horizontal row that stacks by itself in a container narrower than 40rem. A `<nav>` with an ordered list, `aria-current="step"` and hidden status text for screen readers; the arc stops under reduced motion.

## 0.23.0

### Minor Changes

- 0fc45e8: Give the menu button a waiting state. `busy` (and `busyLabel`) on `MenuButton` and `<lx-menu-button>`, or `setMenuButtonBusy(root, busy, label)` from `@luxoticars/ui/scripts/menu-button` for the Skin, puts `aria-busy` on the button, runs a bright arc around its edge, and has a screen reader say the label. The arc stops moving for reduced motion.

## 0.22.1

### Patch Changes

- 9cf5cb6: Fix the menu button's chevron, which pointed up when the menu was closed and down when it was open. It now points down when closed and up when open.

## 0.22.0

### Minor Changes

- 205dc20: Make the menu button usable as a Skin (CSS only). The stylesheet moves to `src/styles/skin/menu-button.css` and is exported as `@luxoticars/ui/styles/skin/menu-button.css`; `@luxoticars/ui/styles/menu-button.css` keeps working as an alias. The behaviour script is now exported as `@luxoticars/ui/scripts/menu-button` (`initMenuButtons()`), so a page that writes the markup itself, shown in the new `Skin/menu-button` story, gets the same keyboard and ARIA behaviour as the Astro component.

## 0.21.0

### Minor Changes

- cae73d8: Add `MenuButton` (Astro) and `<lx-menu-button>` (Marko): a button that opens an accessible menu, following the WAI-ARIA menu button pattern. Items can be plain actions or links, checkboxes or radios, and can carry a badge count and a prefix. Built for filters such as Condition. Styles are `@luxoticars/ui/styles/menu-button.css` (Astro imports them itself; the Marko tag has its own).

## 0.20.0

### Minor Changes

- 0d4fbc0: Add `controlsPlacement` to `ScrollingItemCards` and `<lx-scrolling-item-cards>`. The default, `sides`, is unchanged. `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center` and `bottom-end` put Previous / Next together in a row above or below the track, so a thumb or a mouse has less far to travel and the buttons never cover a card. It is CSS only: the script is unchanged, the stylesheet grows by 73 B gzip, and an instance adds at most one wrapper `div` (50 B for `bottom-end`). The cost table is in the component's Storybook docs.

## 0.19.0

### Minor Changes

- e704d90: Add `SellerSummary` (`@luxoticars/ui/astro/ui/SellerSummary`), an Astro component that says who is selling: the dealer's name, photo, the Luxoticars blue tick, the identity check, location, cars for sale, registration number and address. It has two sizes: `full`, a labelled card with the facts as a description list and a link to the dealer's page, and `compact`, one line for beside a price or a title. It shows only what it is given, so there is no rating or review count until the site collects them. Its stylesheet is also exported as `@luxoticars/ui/styles/seller-summary.css`.

## 0.18.0

### Minor Changes

- 2e817b3: ProgramBadge: new `blue-tick` and `verified` (the profile page's tick) icons, both with the tick knocked out, painted with `--lux-primary` when the badge has text and with the accent when it is icon-only (the primary is too light for a lone icon), and new `star` and `pin` icons. The badge text now uses `--font-futura`, and badges with text have the icon sized in cap heights (`1.6cap`, `2.1cap` at size 24).

## 0.17.2

### Patch Changes

- e96e07e: Frosted header on scroll-up: the search row on narrow screens is now frosted too, instead of sitting in a solid dark box (#107).

## 0.17.1

### Patch Changes

- dc74f1b: Show Astro ScrollingItemCards previous and next buttons in the static Storybook when the row overflows.

## 0.17.0

### Minor Changes

- e4e1fe9: Add slotted `ListingCard` / `<lx-listing-card>` and `ScrollingItemCards` / `<lx-scrolling-item-cards>` (Astro + Marko), with shared scroller CSS and `initScrollingItemCards`.

## 0.16.0

### Minor Changes

- 98be4e2: The site header's default menu ends with Merch, linking to the merchandise shop at merch.luxoticars.com.my. It opens in the same tab, like the other links: the shop is a Luxoticars site with the same header and footer.

## 0.15.8

### Patch Changes

- 97d3441: The Footer's company links include Services, pointing at `/services`, matching the site header.
- 6bd4b38: The `--color-*` aliases now follow a nested `data-theme`, so a light section inside a dark page gets light colours without each app re-declaring them.

## 0.15.7

### Patch Changes

- 54bf1db: Fix the frosted glass on scroll-up for `SiteHeader` and `<lx-site-header>`: its `@supports` condition used a bare `color-mix()` that browsers always read as false, so the effect never applied.

## 0.15.6

### Patch Changes

- 8580dcb: Storybook shell host: compose Astro and Marko refs

## 0.15.5

### Patch Changes

- 5cb91e1: Organize Storybook: Astro Logo under Components/; move pill into Skin (`styles/skin/pill.css`, story `Skin/pill`). `@luxoticars/ui/styles/pill.css` still works as an alias.

## 0.15.4

### Patch Changes

- a4da58d: Add opt-in site-header frosted glass CSS on scroll-up (`data-scroll-dir=up`), progressive with `backdrop-filter`.
- 71e829b: fix(site-header): match CTA padding to search autocomplete height

## 0.15.3

### Patch Changes

- 6a91b26: Site header hide-on-scroll keeps working when a browser understands `scroll-state` but does not hide the bar with `scroll-state(scrolled: bottom)`. The scroll-direction script now always sets `data-scroll-dir`, so scrolling down slides the bar away and scrolling up brings it back. The direction query stays as a progressive enhancement where it really applies.

## 0.15.2

### Patch Changes

- 8a54813: `Button`: the `destructive`, `success` and `warning` variants' text is darkened toward the page text colour so it meets the 4.5:1 AA contrast on its tinted background.
- e536793: Site header: the sticky bar can now slide out of view while the page scrolls down and come back on scrolling up. It stays while its menu is open or it has focus, and never moves under reduced motion. Chrome 144+ does it in CSS alone (`scroll-state(scrolled)` container queries); other browsers get a small scroll-direction script.
  
  The slide is an opt-in stylesheet, kept out of `styles/site-header.css` and the Marko entries' own CSS so pages that do not want it never download it. Import it once to turn it on:
  
  - Astro `SiteHeader`: `import "@luxoticars/ui/styles/site-header-hide-on-scroll.css";`
  - Marko `<lx-site-header>`: `import "@luxoticars/ui/marko/lx-site-header/hide-on-scroll.css"`
  
  The `hideOnScroll` prop is on by default in both, but only marks the bar for that stylesheet; without the import the bar stays at the top as before. Turn it off per header with `hideOnScroll={false}` / `hideOnScroll=false`.

## 0.15.1

### Patch Changes

- 3e752d0: `<lx-price-distribution-graph>`: a bar without `accessibilityText` is now hidden from assistive technology instead of being an unlabelled `role="img"`.

## 0.15.0

### Minor Changes

- 22dc8aa: Breaking (Marko): `<price-filter>` is now `<lx-price-filter>` and `<price-distribution-graph>` is now `<lx-price-distribution-graph>`. Their block classes follow the tag names and each ships its own `style.css`, so they need `styles/tokens.css` and no longer read Tailwind/daisyUI colour names or fallbacks. `marko/price-filter` and `marko/price-distribution-graph` become `marko/lx-price-filter` and `marko/lx-price-distribution-graph`.
- bc7cfe5: Breaking (Marko): `<selection-group>` is now `<lx-selection-group>`, its block class is `lx-selection-group` and its stylesheet moves beside the tag as `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/selection-group` becomes `marko/lx-selection-group`.
- dac095c: Add `<lx-site-footer>` for Marko 6, the twin of the Astro `Footer`. It is adaptive: the app passes the `entry` for the request (`@luxoticars/ui/marko/lx-site-footer/desktop.entry.marko` or `mobile.entry.marko`) and the package does not classify devices. Each entry ships its own `style.css` (forked from `styles/footer.css`). It keeps the footer's grey literals, each behind its `--footer-*` override, and reads the accent from `--lux-marque-accent`, so it needs `styles/tokens.css`.
- bee35aa: Breaking (Marko): `<site-header-desktop>` and `<site-header-mobile>` become one adaptive `<lx-site-header>`. The app picks the entry per request and passes it in (`entry=`), importing `@luxoticars/ui/marko/lx-site-header/desktop.entry.marko` or `mobile.entry.marko`; the package does not classify devices. Block classes are `lx-site-header`, each entry ships its own `style.css` (so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names), and the phone entry has no media queries. The default menu is now Buy, Services, Reviews, About, with the desktop header switching to its menu button below 52rem; the phone entry shows only the first word of the call-to-action at every width.

## 0.14.0

### Minor Changes

- 1fb5acc: Breaking (Marko): `<logo>` is now `<lx-logo>`, its block class is `lx-logo` and it ships its own `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names. `marko/logo` becomes `marko/lx-logo`. Adds `npm run new:tag`, and `npm test` now fails when a Marko tag's forked CSS falls behind the shared stylesheet it came from.
- 1311c47: Breaking (Marko): `<program-badge>` is now `<lx-program-badge>`, its block class is `lx-program-badge` and it ships its own `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/program-badge` becomes `marko/lx-program-badge`. The Astro `ProgramBadge` is unchanged.
- d471086: Breaking (Marko): `<text-range>` is now `<lx-text-range>`, its block class is `lx-text-range` and its stylesheet moves beside the tag as `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/text-range` becomes `marko/lx-text-range`.
- dd4761c: Ship the brand typeface (Jost, OFL-1.1) with the package instead of the `@luxoticars/fonts` dev dependency. Import `@luxoticars/ui/styles/fonts.css` to define `--font-futura`; the font files are exported under `@luxoticars/ui/fonts/*` for preloading.

### Patch Changes

- bc4dc98: Fix `<lx-program-badge>`: it used `$` scriptlets, which the Marko Tags API rejects, so the tag failed to compile. Back to `const/` tag variables, and `npm test` now fails if any Marko tag uses a `$` scriptlet.
- 19e2de6: Fix `<lx-program-badge>` so it compiles under the Marko tags API. Derived state uses `const/` instead of `$` scriptlets; the rendered badge is unchanged.

## 0.13.0

### Minor Changes

- e6f43dd: The marque accent is now the brand cyan (`oklch(86% 0.127 207.078)`, the same as `--lux-primary`) instead of blue. The logo's accent line and the header and footer accents change colour.
- a220673: Tokens: new `--lux-marque-accent`, the logo's accent blue, mapped to `--color-marque-accent` in `@theme`. The logo, header and footer read it from there, so changing it in `tokens.css` changes all three. An app that sets `--color-marque-accent` itself (luxoticars-homepage does) keeps its own value. The colour itself is unchanged.

## 0.12.0

### Minor Changes

- a453585: Add `<site-header-desktop>`, `<site-header-mobile>` and `<logo>`, the Marko twins of the Astro `SiteHeader` and `Logo`: same styles, with the header's search field passed as `@search`. The app picks the header per request: the phone one keeps the links in its menu only, so it ships less HTML and script. All of them take their links, new-tab attributes and button label from `resolveSiteHeader()`, and wire the menu with `wireSiteMenu()`, so they cannot drift. The Astro header's output is unchanged.
- 1207227: Add the Malaysian state flags shown beside a listing's location, as `@luxoticars/ui/flags/states/<slug>.svg`, and `stateFlagSlug()` from `@luxoticars/ui/utils/state-flag`, which maps a listing's `location_state` to its flag. The same 15 flags luxoticars-vi and luxoticars-srp each keep their own copy of.

### Patch Changes

- 960c16d: Move the logo's © mark back to the bottom right of the wordmark, where luxoticars.com shows it. The mark is a `<sub>` again in `Logo.astro` and `createLogo`.
- a3ab75d: Keep the site header's wordmark, button and menu button on one row at every phone width. Below about 400px the gaps, the wordmark and the button shrink with the bar instead of the button and the menu button dropping to a row of their own.

## 0.11.0

### Minor Changes

- 9ed7465: Add a shared listing card: `createListingCard()` (HTML) and `styles/listing-card.css`, with the text rules in `utils/listing-card` (year and make above a shortened title, price, condition · body · mileage, location). The search results and the home page's Just listed row can now show the same card instead of one copy each.
- 44a6e31: Add `styles/pill.css`: the rounded choice link used for body types on the home page and filter values on the search page. `pill` is 44px tall, `pill--sm` 32px; the current choice is marked with `aria-current` or `pill--selected`.

### Patch Changes

- 35351a2: The Footer's brand links swap Maserati, McLaren and Bugatti (one car listed each) for Toyota, Mercedes-Benz and Land Rover, so they follow what is in stock.

## 0.10.3

### Patch Changes

- 2884dcf: `<price-distribution-graph>` no longer lets its two value labels run into each other when the knobs sit close together and the prices are long, as with six-digit prices: it pushes them apart. A new `compactLabels` option shortens them (`RM100k` for `RM100000`), and `labels.currencyCaption` (for example "Amounts in RM") shows the currency once under bare-number labels. Each knob's value now includes the currency for screen readers, and the visible labels next to the knobs are hidden from them to avoid reading each value twice.

## 0.10.2

### Patch Changes

- 3b57490: `<text-range>` no longer loses what is being typed in one field when the other field is committed. Typing a minimum, moving to the maximum and typing there used to drop the maximum if the parent updated in between.

## 0.10.1

### Patch Changes

- 045cd37: `<price-filter>` now works as a plain form: without a graph its range starts from the text fields' values, and when it has a form `action` and no `onPriceRangeChange` the browser submits the form itself instead of the filter swallowing the submit. A selected link option in `<selection-group>` now carries `aria-current="true"`, so screen readers announce it as the current choice.

## 0.10.0

### Minor Changes

- f2879e1: `<text-range>` can be a real GET form. Give it an `action` and each field submits under its `key`, `hiddenFields` carry the rest of the page's state, and the submit button stays enabled, so the range works before any JavaScript has loaded. With JS and an `onChange` handler the submit is intercepted and reported through `onChange` as before.

## 0.9.0

### Minor Changes

- f387e55: Add the price filter as four Marko 6 tags: `<price-filter>`, which composes `<selection-group>` (preset ranges), `<text-range>` (min and max fields) and `<price-distribution-graph>` (a histogram with two knobs) around one shared range. Each part also works on its own. The decisions live in `utils/price-range`, which the tags share.

## 0.8.0

### Minor Changes

- 413b9e5: Tokens: new `--lux-neutral-line` (a hairline) and `--lux-neutral-muted` (quieter text) for use on the dark neutral background. SiteHeader reads them for its border and its muted text, after its own `--site-header-line` / `--site-header-muted` overrides; the values are the ones it used before, so it looks the same.
- a232384: Tokens: new `--page-max` (80rem) and `--page-gutter` (`clamp(1rem, 4vw, 3rem)`) set the page width and side padding, so a site's own sections can line up with the header and footer. The width includes the padding. Footer: its content now reads them and is `border-box`, so it is 80rem wide with Tailwind's reset or without it (before, a site without the reset got 80rem plus padding). Its side padding grows from 1.5rem/2rem to the new gutter, which is 1rem on small phones and 3rem on wide screens.
- 1ac3ccd: New Astro `SectionHead`: a section title with an optional link beside it (`linkHref` + `linkLabel`, such as "View all"), and a `dark` tone for the neutral background. The default slot takes anything else that sits beside the title, such as an intro line. Its stylesheet is also exported as `styles/section-head.css`. Astro only; no HTML builder or Marko tag.
- 9d28040: `data/footer` exports `whatsappLink(message)`: a wa.me link to the Luxoticars WhatsApp line with the message typed in. The Footer's WhatsApp contact is built with it, so the number lives in one place; its link is unchanged.

## 0.7.0

### Minor Changes

- 7b35602: Logo: new `accent` prop draws a short accent line under the first letters of the wordmark, stretching across it on hover and on keyboard focus. The line hangs 0.375rem below the wordmark, so leave room for it in the layout. Astro only; `createLogo` is unchanged.
- 0030bdd: New Astro `SiteHeader`: wordmark, menu, call-to-action button and an optional `search` slot. On phones the menu opens from a button. Astro only; no HTML builder or Marko tag. Its stylesheet is also exported as `styles/site-header.css`.

### Patch Changes

- 0c7c41d: Footer: the Car Reviews link points at `/a/reviews/` (the old `/a/car-reviews/` is a 404), and Lexus replaces Pagani in the default makes, since Pagani has no listings.
- deb183e: Logo: the © mark sits at the top right of the wordmark instead of the bottom right. It is now a `<sup>` instead of a `<sub>`, so it stays raised even where the logo stylesheet is not loaded.

## 0.6.0

### Minor Changes

- cbef21e: Add `ProgramBadge`, an icon and/or a short label such as "Top rated seller", and the package's first Marko component.
  
  - Astro: `import ProgramBadge from "@luxoticars/ui/astro/ui/ProgramBadge"`.
  - Marko 6: `<program-badge>`, discovered through the package's new `marko.json`.
  
  Marko is an optional peer dependency, so Astro-only apps install nothing new. The published Storybook now includes a Marko Storybook, composed into the same sidebar.

## 0.5.0

### Minor Changes

- dea5ae1: Add `Dialog` and `DialogTrigger` (Astro) and `createDialog` / `createDialogTrigger` (HTML): a native `<dialog>` in `lightbox`, `confirm` and `panel` variants. Opens with invoker commands and needs no setup in Astro. With the HTML API, load `@luxoticars/ui/styles/dialog.css` and call `installDialogFallbacks()` from `@luxoticars/ui/scripts/dialog`.

## 0.4.0

### Minor Changes

- 0b19d05: Add a `variant` option (`"white"` | `"black"`) to `Logo` and `createLogo`. Black is for light backgrounds; white stays the default.

## 0.3.0

### Minor Changes

- 75e9778: add spacing token

## 0.2.0

### Minor Changes

- 09d9655: Adopt Changesets for versioning. Releases are now tagged `vX.Y.Z` and published as GitHub Releases, so consumers can pin a version (`github:luxoticars/luxoticars-ui#v0.2.0`) instead of tracking `main`.
