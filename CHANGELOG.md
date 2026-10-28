# @luxoticars/ui

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
