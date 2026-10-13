# @luxoticars/ui

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
