# @luxoticars/ui

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
