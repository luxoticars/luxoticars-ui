# Dialog — design

Status: draft for review · 2026-10-13 · branch `claude/dialog-native`

## Intent

A modal dialog component for `@luxoticars/ui` that can host a **simple confirmation**, a **form**
(enquiry, booking, …) or a **single image**. It ships in both APIs the package already has: an Astro
component and an HTML string builder.

Success means:

- **Self-contained.** Importing the Astro component is the whole setup. Its stylesheet and its small
  runtime script come with it, and nothing has to be wired up in the consuming app.
- **Refuses to be inaccessible.** A dialog with no accessible name, or a confirm with no description,
  fails the build instead of shipping.
- **Composable.** The dialog does not own its contents. Footer actions are ordinary `Button`s, a form
  is the consumer's own `<form>`, and a trigger is a `Button` that knows which dialog it opens.
- **Verified in a real browser,** not by reading markup (see Verification).

### Decisions already made

| Decision | Outcome |
|---|---|
| Use `@ebay/skin`? | **No dependency.** It is used as a design reference only: anatomy, sizes, breakpoints and motion. Its legacy dialogs are `div[role=dialog]` driven by JS state classes, and its tokens are a third vocabulary that luxoticars-dash does not have. |
| Element | Native `<dialog>` opened with `showModal()`. This gives focus containment, `inert` page, Escape handling and focus return for free, as `.github/instructions/a11y.instructions.md` K3 requires. |
| Browser floor | **Evergreen.** Invoker commands (`command` / `commandfor`, Baseline Dec 2025) open and close dialogs with no JS. The only script is a fallback for Safari, which lacks `closedby`. |
| Variants this round | `lightbox`, `confirm`, `panel`. |
| Out of scope | Snackbar (not modal: a live region, its own component), image gallery (prev/next, keys, counter, swipe, zoom — built on `Dialog` later), eBay's "expressive" hero-image variant and its back button. |

## eBay reference values kept

From `@ebay/skin@19.37.1` `dist/{dialog,lightbox-dialog,confirm-dialog,panel-dialog}`:

- Lightbox widths: **616px** default, **480px** narrow, **896px** wide (88% between 768 and 1024px).
- Breakpoints **512 / 768 / 1024px**. The footer stacks below 512px and is a right-aligned row above it.
- Under 512px the lightbox is a **bottom sheet** that slides up. From 512px it is centred and scales from **0.75 → 1**.
- `large`: 70% height on desktop, 95% on mobile. `fullscreen`: edge-to-edge on mobile, as `large` above 512px.
- Panel: full width under 512px, **384px (24rem)** above, from either side.
- Confirm: centred at every size, max 616px from 768px, title 18/28px semibold, Cancel before the confirming action.
- Motion: transform **500ms** `cubic-bezier(0.3, 0, 0, 1)` in; opacity and scrim **167ms**
  `cubic-bezier(0.3, 0, 0.7, 1)`; exit **167ms** `cubic-bezier(0.3, 0, 1, 1)`. Panel slide 320ms ease-out.
- Close button 32×32px (meets WCAG 2.5.8's 24px minimum).

## Where we improve on the reference

| eBay | Here |
|---|---|
| Open/close via keyframes plus a JS-added `.dialog--close` class | `@starting-style` + `transition-behavior: allow-discrete` on `display` and `overlay`: enter and exit in pure CSS |
| New `.dialog` has no reduced-motion handling | `prefers-reduced-motion: reduce` drops every transform; opacity fades only |
| `body { overflow: hidden !important }`, global `:root { scrollbar-gutter: stable }` | `html:has(.dialog:modal) { overflow: hidden; scrollbar-gutter: stable }` — only while a modal is open, no `!important` |
| Hardcoded scrim `rgb(17 24 32 / .7)` and grey panel border | Scrim from `neutral` at 70%, border from `base-300`: both follow the theme, so dark mode works |
| `max-height: 90%` | `90dvh`, so mobile browser toolbars do not clip it |
| Decorative drag handle that does not drag | Omitted — a handle that cannot be dragged is a false affordance |
| Scroll chaining from the body into the page | `overscroll-behavior: contain` on the scrolling body |
| No backdrop-dismiss policy | `closedby` per variant, with a fallback for Safari |
| Confirm result needs click handlers | `<form method="dialog">` footer: the clicked button's `value` becomes `dialog.returnValue` |

## Files

| File | Purpose |
|---|---|
| `src/styles/dialog.css` | The single stylesheet, shared by both APIs (the `logo.css` / `footer.css` arrangement) |
| `src/astro/ui/Dialog.astro` | The dialog |
| `src/astro/ui/DialogTrigger.astro` | A `Button` that opens a dialog |
| `src/scripts/dialog.js` + `dialog.d.ts` | `installDialogFallbacks()` — Safari fallbacks, idempotent |
| `src/html/dialog.js` + `dialog.d.ts` | `createDialog()`, `createDialogTrigger()` |
| `stories/ui/Dialog.stories.ts`, `stories/createDialog.stories.ts` | Storybook (stories never live beside components) |
| `.changeset/dialog-component.md` | Minor bump |

`package.json#exports` gains `./styles/dialog.css` and `./scripts/dialog` (with a `types` entry).
`src/scripts/dialog.js` has no import-time effects — installation is an explicit call — so `sideEffects` is
unchanged. `src/html/index.js` (and its `.d.ts`) re-export the two builders. `npm run check:exports` must pass.

## Markup

Both APIs emit the same tree. Every node carries a BEM class, so nothing in the stylesheet selects by tag.

```html
<dialog id="x" class="dialog dialog--lightbox" aria-labelledby="x-title" aria-describedby="x-desc" closedby="any">
  <div class="dialog__header">
    <h2 id="x-title" class="dialog__title">…title…</h2>
    <button type="button" class="dialog__close" command="close" commandfor="x" aria-label="Close">
      <svg aria-hidden="true" focusable="false" …>…</svg>
    </button>
  </div>
  <div class="dialog__body">
    <div id="x-desc" class="dialog__description">…description…</div>
    …body…
  </div>
  <form method="dialog" class="dialog__footer">…footer…</form>
</dialog>
```

- The header is a `<div>`, not `<header>`: a `<header>` that is not inside `article`/`aside`/`main`/`nav`/`section`
  can be exposed as a page-level `banner` landmark.
- `aria-describedby` and the description node are emitted **only when a description exists**, so the dialog
  never references a missing id.
- The footer form is emitted only when footer content exists. The close button is emitted for `lightbox` and `panel`, never for `confirm`.
- `confirm` adds `role="alertdialog"`.

Modifier classes: `dialog--lightbox`, `dialog--confirm`, `dialog--panel`; size `dialog--narrow`, `dialog--wide`,
`dialog--large`, `dialog--fullscreen` (lightbox only); side `dialog--end` (panel only — `start` is the default).

## Astro API

### `Dialog.astro`

```astro
<Dialog id="delete-car" variant="confirm">
  <Fragment slot="title">Delete this listing?</Fragment>
  <Fragment slot="description">The car and its photos are removed for good.</Fragment>
  <Fragment slot="footer">
    <Button type="submit" value="cancel" variant="outline">Cancel</Button>
    <Button type="submit" value="delete" variant="destructive">Delete</Button>
  </Fragment>
</Dialog>
```

Props are a discriminated union on `variant`, so a prop that does not apply to a variant is a type error:

| Prop | Type | Default | Applies to |
|---|---|---|---|
| `id` | `string` (required) | — | all — triggers target it, and title/description ids derive from it |
| `variant` | `"lightbox" \| "confirm" \| "panel"` | `"lightbox"` | — |
| `size` | `"narrow" \| "default" \| "wide" \| "large" \| "fullscreen"` | `"default"` | `lightbox` |
| `side` | `"start" \| "end"` | `"start"` | `panel` |
| `dismiss` | `"any" \| "closerequest" \| "none"` | `"any"`; `confirm`: `"closerequest"` | all; `confirm` does not accept `"any"` |
| `closeLabel` | `string` | `"Close"` | `lightbox`, `panel` |
| …rest | `HTMLAttributes<"dialog">` | — | spread onto `<dialog>` |

`dismiss` maps to `closedby`: `any` closes on backdrop click and Escape, `closerequest` on Escape only, `none`
on neither. Form dialogs should use `"closerequest"` so a stray click outside does not discard what was typed.

Slots:

| Slot | Required | Renders as |
|---|---|---|
| `title` | **yes** — build error if absent | `<h2 class="dialog__title" id="{id}-title">`, referenced by `aria-labelledby` |
| `description` | **yes for `confirm`** — build error if absent; optional otherwise | `<div class="dialog__description" id="{id}-desc">`, referenced by `aria-describedby` |
| default | no | inside `.dialog__body` |
| `footer` | no | inside `<form method="dialog" class="dialog__footer">` |

Slot presence is checked with `Astro.slots.has()`; the errors name the dialog's `id` and the missing slot.

Attribute integrity follows the `Button.astro` precedent: an HTML parser keeps the *first* of a duplicated
attribute, so attributes the component must control are **removed from the spread**, not overridden after it.
Removed: `role`, `aria-labelledby`, `aria-describedby`, `closedby`, `open` (an `open` attribute shows the dialog
non-modally, which bypasses focus containment). `class` is merged with `cn`.

The component imports `../../styles/dialog.css` in its frontmatter (the `Logo.astro` pattern — an `@import`
inside a scoped `<style>` 404s in Storybook's prerender), and calls `installDialogFallbacks()` from a processed
`<script>`, which Astro bundles once per page however many dialogs it holds.

### `DialogTrigger.astro`

`Button` with `command="show-modal"` and `commandfor={for}`. It accepts every `Button` prop except `href` (a
link cannot invoke a command), so triggers look like the rest of the UI. `for` is required.

```astro
<DialogTrigger for="delete-car" variant="destructive">Delete listing</DialogTrigger>
```

### Hosting a form

The consumer's form lives in the body; the footer's submit button joins it with the `form` attribute, which
overrides its ancestor form:

```astro
<Dialog id="enquire" dismiss="closerequest">
  <Fragment slot="title">Enquire about this car</Fragment>
  <form id="enquire-form" method="post" action="/enquiries">…fields…</form>
  <Fragment slot="footer">
    <Button type="submit" value="cancel" variant="outline">Cancel</Button>
    <Button type="submit" form="enquire-form">Send enquiry</Button>
  </Fragment>
</Dialog>
```

## HTML API

```js
createDialog({ id, variant, size, side, dismiss, closeLabel, title, description, body, footer, className })
createDialogTrigger({ for: id, label, className })
```

- `title`, `description`, `closeLabel`, `label` are **escaped**. `body` and `footer` are **raw HTML supplied
  by the caller** and are not escaped; the `.d.ts` JSDoc says so.
- It throws the same errors the Astro component does: missing `id`, missing `title`, `confirm` without
  `description`, `confirm` with `dismiss: "any"`, and an unknown `variant`, `size`, `side` or `dismiss`.
- Callers load `@luxoticars/ui/styles/dialog.css` and call `installDialogFallbacks()` from
  `@luxoticars/ui/scripts/dialog` once.

## Styling

- **Tokens.** Every value is `var(--color-<daisyUI name>, var(--lux-<name>, <literal>))`. daisyUI defines the
  first name in luxoticars-dash; `tokens.css` defines the second in luxoticars-web. The second link matters
  because Tailwind v4 emits a theme variable only when a utility uses it, so `--color-base-100` may not exist
  there. The literal makes the dialog render in an app with neither. Surface `base-100`, text `base-content`,
  borders `base-300`, scrim `neutral` at 70% via `color-mix`, radius `--radius-box` with a literal fallback.
- **Component custom properties** — the only extension points, each with a default:
  `--dialog-max-width`, `--dialog-scrim`, `--dialog-duration-enter`, `--dialog-duration-exit`.
- **Layout.** `.dialog` is a flex column; header and footer are fixed, `.dialog__body` scrolls with
  `overscroll-behavior: contain`. `max-height: 90dvh`.
- **Motion.** Enter and exit transitions on `opacity`, `translate`/`scale`, `display` and `overlay`, with
  `@starting-style` for the entry state; `::backdrop` fades the scrim. Reduced motion removes all transforms.
- **RTL.** Logical properties throughout. The panel's slide direction flips under `:dir(rtl)`.

## Behaviour

| | lightbox | panel | confirm |
|---|---|---|---|
| Role | `dialog` | `dialog` | `alertdialog` |
| Escape | closes (unless `dismiss="none"`) | closes (unless `none`) | closes (unless `none`) |
| Backdrop click | closes when `dismiss="any"` (default) | same | never |
| Close button | yes | yes | no |
| Initial focus | native: first focusable (the close button) | same | native: first focusable — Cancel, by convention placed first |
| Result | `returnValue` from footer button `value` | same | same |

Focus return to the trigger, page inertness and top-layer stacking are native.

### `installDialogFallbacks()`

Installs at most once per document, using delegated listeners so dialogs inserted later are covered. Returns
early where the platform already does the work.

1. **Backdrop dismiss.** If `"closedBy" in HTMLDialogElement.prototype` is false (Safari), a `click` on an
   open `.dialog[closedby="any"]` whose coordinates fall outside its bounding box closes it with `""`.
2. **`dismiss="none"` in Safari.** A `cancel` event on a `.dialog[closedby="none"]` is `preventDefault()`ed.
3. **Stale `returnValue`.** Closing on Escape leaves `returnValue` at its previous value, so a confirm closed
   with "delete", reopened and then escaped would still read "delete". On `cancel` for any `.dialog`, the
   script resets `returnValue` to `""`. This runs in every browser.

## Verification

Per CLAUDE.md: `npm ci`, transient `@astrojs/check`, `npx astro check` → 0 errors, `npm run build-storybook`,
`npm run check:exports`, `rm -rf .astro`. Then the built Storybook driven by `playwright-core` in Chromium,
asserting on the real DOM:

1. Clicking a trigger opens the dialog modally (`:modal`), and focus moves inside it.
2. Escape closes it, and focus returns to the trigger.
3. Confirm: the clicked footer button's value is `returnValue`; after reopening and pressing Escape it is `""`.
4. Backdrop click closes a lightbox and a panel, and does not close a confirm or a `dismiss="closerequest"` dialog.
5. Roles and ARIA: `alertdialog` on confirm; `aria-labelledby`/`aria-describedby` resolve to existing nodes; no `aria-describedby` without a description.
6. The document does not scroll while a dialog is open, and does again after it closes.
7. At 375px a lightbox is docked at the bottom; at 1280px it is centred and no wider than 616px; a panel is 384px.
8. Dark theme: the surface uses the dark `base-100`.
9. Reduced motion: no computed transform at any point of the transition.
10. Form story: the footer submit button submits the body form.
11. Parity: `createDialog` output matches the prerendered Astro markup for the same inputs, after normalising whitespace and Astro's scoping attributes.
12. Build-time errors: a missing `title`, and a confirm without `description`, fail with the documented message.

Fallback paths (1–2 of `installDialogFallbacks`) cannot be exercised in Chromium, which supports `closedby`.
They are tested by deleting `closedBy` from the prototype before installing, which forces the fallback.

## Risks to check while building

- **Storybook script execution.** The `@storybook-astro` prerender may not run a component's processed
  `<script>`. If it does not, stories call `installDialogFallbacks()` from `.storybook/preview.ts`, and the
  component's own `<script>` is still verified in the build output.
- **`::backdrop` and custom properties.** Current evergreen browsers inherit custom properties into `::backdrop`
  from the dialog; this is an inference to confirm in the browser. The literal fallback covers it either way.
- **Scrollbar gutter.** `scrollbar-gutter: stable` while open reserves a gutter even on a page that did not
  overflow, so on classic (non-overlay) scrollbars such a page shifts by the scrollbar width. Accepted: the
  common case is a page that scrolls.

## Follow-ups

- Snackbar — non-modal live region.
- Image gallery — built on `Dialog`: prev/next, arrow keys, "3 / 12", swipe, zoom.
- Expressive hero-image variant and back button, if a screen needs them.
