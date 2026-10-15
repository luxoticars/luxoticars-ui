# @luxoticars/ui

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
