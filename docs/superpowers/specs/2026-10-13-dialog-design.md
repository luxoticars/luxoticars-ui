# Dialog — design

Status: implemented on branch `claude/dialog-native` · 2026-10-13

## Intent

A modal dialog component for `@luxoticars/ui` that can host a **simple confirmation**, a **form**
(enquiry, booking, …) or a **single image**. It ships in both APIs the package already has: an Astro
component and an HTML string builder.

Success means:

- **Self-contained.** Importing the Astro component is the whole setup. Its stylesheet and its small
  runtime script come with it, and nothing has to be wired up in the consuming app.
- **Refuses to be inaccessible.** A dialog that would ship without a way to name it or leave it fails the
  build (Astro) or throws (HTML). The full list is under [Validation](#validation).
- **Composable.** The dialog does not own its contents. Footer actions are ordinary `Button`s, a form
  is the consumer's own `<form>`, and a trigger is a `Button` that knows which dialog it opens.
- **Verified in a real browser,** not by reading markup (see [Verification](#verification)).

### Decisions

| Decision | Outcome |
|---|---|
| Element | Native `<dialog>` opened with `showModal()`. This gives focus containment, an `inert` page, Escape handling and focus return for free, as `.github/instructions/a11y.instructions.md` K3 requires. |
| Browser floor | **Evergreen.** Invoker commands (`command` / `commandfor`, Baseline since December 2025) open and close dialogs with no JS. The runtime script does two things: it clears stale results in every browser, and it stands in for `closedby` where a browser lacks it (Safari releases without `closedby`; Playwright's WebKit 27.2 has it natively). |
| Variants | `lightbox`, `confirm`, `panel`. |
| Out of scope | Snackbar (not modal: a live region, its own component), image gallery (prev/next, keys, counter, swipe, zoom — built on `Dialog` later), a hero-image variant and a back button. |

## Sizes and motion

- Lightbox widths: **616px** default, **480px** narrow, **896px** wide.
- Breakpoints **512 / 768 / 1024px**. The footer stacks below 512px and is a right-aligned row above it.
- Under 512px the lightbox is a **bottom sheet** that slides up. From 512px it is centred and scales from **0.75 → 1**.
- `large`: 70% height on desktop, 95% on mobile. `fullscreen`: edge-to-edge on mobile, as `large` above 512px.
- Panel: full width under 512px, **384px (24rem)** above, from either side.
- Confirm: centred at every size, max 616px from 768px, title 18/28px semibold, Cancel before the confirming action.
- Motion: transform **500ms** `cubic-bezier(0.3, 0, 0, 1)` in; opacity and scrim **167ms**
  `cubic-bezier(0.3, 0, 0.7, 1)`; exit **167ms** `cubic-bezier(0.3, 0, 1, 1)`. Panel slide 320ms ease-out.
- Close button 32×32px, above WCAG 2.5.8's 24px minimum target.

## Design choices

| Choice | Why |
|---|---|
| `@starting-style` + `transition-behavior: allow-discrete` on `display` and `overlay` | Enter and exit in pure CSS, with no script adding state classes |
| `prefers-reduced-motion: reduce` drops every transform | Opacity fades only |
| `html:has(.dialog:modal) { overflow: hidden; scrollbar-gutter: stable }`, no `!important` | The page is locked only while a modal is open; nothing global otherwise |
| Scrim from `neutral` at 70%, borders from `base-300` | Both follow the theme, so dark mode works |
| `max-height: 90dvh` | Mobile browser toolbars do not clip it |
| No drag handle on the bottom sheet | A handle that cannot be dragged is a false affordance |
| `overscroll-behavior: contain` on whatever scrolls | Scrolling the dialog never scrolls the page behind it |
| `closedby` per variant, with a stand-in for Safari | Backdrop dismissal is a per-variant policy |
| `<form method="dialog">` footer | The clicked button's `value` becomes `dialog.returnValue`; no click handlers |

## Architecture

Each concern has one home. Both APIs share every one of them except the renderer.

| Concern | Home | Owns |
|---|---|---|
| **Decisions** | `src/utils/dialog.js` (internal, not exported) | `resolveDialogOptions()`: validation, classes, role, `closedby`, ids, the close label, and **which parts render** (close button, body, footer). Pure: no DOM, no markup. |
| **Rendering** | `src/astro/ui/Dialog.astro`, `src/html/dialog.js` | Each translates its own inputs (Astro slots, HTML options) into the resolver's booleans, then follows its answer. Neither re-derives anything the resolver decides. |
| **Styling** | `src/styles/dialog.css` | All presentation. One page-level rule: the scroll lock on `html`. |
| **Runtime** | `src/scripts/dialog.js` | `installDialogFallbacks()`, made of two independent parts: `clearStaleResults` (every browser) and `emulateClosedBy` (Safari only, removable on its own). |
| **Opening** | `src/astro/ui/DialogTrigger.astro`, `createDialogTrigger()` | A button with `command="show-modal"`. No script. |

The markup itself is written twice, once per renderer. The parity test (Verification, item 11) holds the two
copies together.

## Files

| File | Purpose |
|---|---|
| `src/utils/dialog.js` + `dialog.d.ts` | The option resolver and the close icon, shared by both APIs |
| `src/styles/dialog.css` | The single stylesheet, shared by both APIs (the `logo.css` / `footer.css` arrangement) |
| `src/astro/ui/Dialog.astro` | The Astro dialog |
| `src/astro/ui/DialogTrigger.astro` | A `Button` that opens a dialog |
| `src/html/dialog.js` + `dialog.d.ts` | `createDialog()`, `createDialogTrigger()` |
| `src/scripts/dialog.js` + `dialog.d.ts` | `installDialogFallbacks()`, idempotent per document |
| `src/types.d.ts` | `DialogVariant`, `DialogSize`, `DialogSide`, `DialogDismiss` |
| `tests/html-dialog.test.js`, `tests/dialog-options.test.js` | Unit tests (`npm test`, Node's built-in runner) |
| `stories/ui/Dialog.stories.ts`, `stories/ui/DialogDemo.astro` | Astro stories; the demo composes `Dialog` + `DialogTrigger` + `Button` |
| `stories/createDialog.stories.ts`, `stories/dialog-content.ts` | HTML-API stories, and the copy both story files share |
| `.changeset/dialog-component.md` | Minor bump |

`package.json#exports` gains `./styles/dialog.css` and `./scripts/dialog` (with a `types` entry).
`src/scripts/dialog.js` has no import-time effects — installation is an explicit call — so `sideEffects` is
unchanged. `src/html/index.js` (and its `.d.ts`) re-export the two builders. `npm run check:exports` must pass.

## Markup

Both APIs emit the same tree. Every part of the dialog carries a BEM class, so no part of it is selected by tag.

```html
<dialog id="x" class="dialog dialog--lightbox" aria-labelledby="x-title" aria-describedby="x-desc" closedby="any">
  <div class="dialog__header">
    <h2 id="x-title" class="dialog__title">…title…</h2>
    <button type="button" class="dialog__close" command="close" commandfor="x" aria-label="Close">
      <svg class="dialog__close-icon" aria-hidden="true" focusable="false" …>…</svg>
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
- The resolver decides the optional parts: the body renders when there is a description or content, the footer
  when there is footer content, and the close button for `lightbox` and `panel`, never for `confirm`.
  In the HTML API, whitespace-only options count as none; in Astro, the `title` and `description` slots are
  checked by their rendered text, while the default and `footer` slots count as present whenever they are given.
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
| `id` | `string` (required, no whitespace) | — | all — triggers target it, and title/description ids derive from it |
| `variant` | `"lightbox" \| "confirm" \| "panel"` | `"lightbox"` | — |
| `size` | `"narrow" \| "default" \| "wide" \| "large" \| "fullscreen"` | `"default"` | `lightbox` |
| `side` | `"start" \| "end"` | `"start"` | `panel` |
| `dismiss` | `"any" \| "closerequest" \| "none"` | `"any"`; `confirm`: `"closerequest"` | all; `confirm` does not accept `"any"` |
| `closeLabel` | `string` (non-empty) | `"Close"` | `lightbox`, `panel` |
| …rest | `HTMLAttributes<"dialog">` | — | spread onto `<dialog>` |

`dismiss` maps to `closedby`: `any` closes on backdrop click and Escape, `closerequest` on Escape only, `none`
on neither. Form dialogs should use `"closerequest"` so a stray click outside does not discard what was typed.

Slots:

| Slot | Required | Renders as |
|---|---|---|
| `title` | **yes** | `<h2 class="dialog__title" id="{id}-title">`, referenced by `aria-labelledby` |
| `description` | **yes for `confirm`**; optional otherwise | `<div class="dialog__description" id="{id}-desc">`, referenced by `aria-describedby` |
| default | no | inside `.dialog__body` |
| `footer` | **yes for `confirm`**; optional otherwise | inside `<form method="dialog" class="dialog__footer">` |

The `title` and `description` slots are checked by their **rendered text**, not by `Astro.slots.has()`. A slot
that is present but renders nothing — `<Fragment slot="title">{car.name}</Fragment>` with an empty name —
counts as missing, and markup with no text does too.

Attribute integrity follows the `Button.astro` precedent: an HTML parser keeps the *first* of a duplicated
attribute, so attributes the component must control are **removed from the spread**, not overridden after it.
Removed: `role`, `aria-labelledby`, `aria-describedby`, `closedby`, `open` (an `open` attribute shows the dialog
non-modally, which bypasses focus containment) and `title` (a tooltip duplicating the title slot). `class` is
merged with `cn`.

The component imports `../../styles/dialog.css` in its frontmatter (the `Logo.astro` pattern — an `@import`
inside a scoped `<style>` 404s in Storybook's prerender), and calls `installDialogFallbacks()` from a processed
`<script>`, which Astro bundles once per page however many dialogs it holds.

### `DialogTrigger.astro`

`Button` with `command="show-modal"` and `commandfor={for}`. It accepts every `Button` prop except `href` (a
link cannot invoke a command) and forwards `Button`'s `left-icon` / `right-icon` slots, so triggers look like the
rest of the UI. `for` is required and must contain no whitespace.

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

- `title`, `description`, `closeLabel`, `label`, `id` and `className` are **escaped**. `body` and `footer` are
  **raw HTML supplied by the caller** and are not escaped; the `.d.ts` JSDoc says so.
- `DialogOptions` is a discriminated union on `variant`, like the Astro props; a confirm requires `description`
  and `footer`.
- It throws the same errors the Astro component does (see [Validation](#validation)).
- Callers load `@luxoticars/ui/styles/dialog.css` and call `installDialogFallbacks()` from
  `@luxoticars/ui/scripts/dialog` once.

## Validation

All checks live in the resolver, so both APIs enforce the same list. Each message starts `Dialog "<id>": `
(or `Dialog: ` when there is no usable id).

| Condition | Why |
|---|---|
| Missing or blank `id`; an `id` containing whitespace | Triggers and ARIA references cannot target it |
| Missing or empty title | No accessible name |
| A confirm without a description | Nothing for the alertdialog to announce |
| A confirm without a footer | No ✕ and no backdrop dismiss: its buttons are the only way out |
| An empty `closeLabel` (lightbox, panel) | The ✕ button would have no name |
| A confirm with `dismiss: "any"` | A forced choice must not close on a stray click |
| `size` on a non-lightbox; `side` on a non-panel | The option would be silently ignored |
| An unknown `variant`, `size`, `side` or `dismiss` | — |

`createDialogTrigger` throws when `for` is missing, blank or contains whitespace.

## Styling

- **Colour tokens.** Each reads the `tokens.css` name first, then daisyUI's, then a literal:
  `var(--lux-<name>, var(--color-<name>, <literal>))`. The order matters. Tailwind's `@theme` declares
  `--color-base-100: var(--lux-base-100)` on `:root`, and a custom property is resolved where it is declared, so
  under a nested `[data-theme="dark"]` the daisyUI-named variable still carries the `:root` value. `--lux-*` is
  redeclared on the themed element itself. In luxoticars-dash, which has no `tokens.css`, `--lux-*` is undefined
  and daisyUI's own variables take over. The literal makes the dialog render in an app with neither. Surface
  `base-100`, text `base-content`, borders `base-300`, focus ring `accent`, scrim `neutral` at 70% via `color-mix`,
  radius `--radius-box` with a literal fallback. The drop shadow is a literal.
- **Component custom properties** — the only extension points, each with a default:
  `--dialog-max-width`, `--dialog-scrim`, `--dialog-duration-enter`, `--dialog-duration-exit`.
- **Layout.** `.dialog` is a flex column with `max-height: 90dvh`; the header and footer stay put and
  `.dialog__body` scrolls with `overscroll-behavior: contain`. On short viewports (`max-height: 25rem`, about a
  phone at 400% zoom) the whole dialog scrolls instead, so the footer is never clipped out of reach (WCAG 1.4.10).
- **Forced colours.** The dialog's edge is a shadow, which forced-colors mode drops, so there it gets a
  `1px solid CanvasText` border.
- **Motion.** Enter and exit transitions on `opacity`, `translate`/`scale`, `display` and `overlay`, with
  `@starting-style` for the entry state; `::backdrop` fades the scrim. Reduced motion removes all transforms.
- **RTL.** Layout uses logical properties. `translate` is physical, so the panel's slide direction flips under
  `:dir(rtl)`.

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

Installs at most once per document, using delegated listeners so dialogs inserted later are covered. It is
made of two independent parts.

**`clearStaleResults` — every browser.** A close that carries no value (Escape, the ✕ command, a light
dismiss) leaves `returnValue` at its previous value, so a confirm closed with "delete", reopened and dismissed
would still read "delete". The script clears `returnValue` when a `.dialog` opens (`beforetoggle`) and again
when it is cancelled.

**`emulateClosedBy` — only where `"closedBy" in HTMLDialogElement.prototype` is false (Safari).**

1. **Backdrop dismiss.** A click on an open `.dialog[closedby="any"]` that lands outside its box closes it with
   `""` — but only if the press also started on the backdrop. A text selection dragged from inside the dialog
   ends in a click on the dialog too, and must not close it.
2. **`dismiss="none"`.** A `cancel` event on a `.dialog[closedby="none"]` is `preventDefault()`ed.

## Verification

Per CLAUDE.md: `npm ci`, transient `@astrojs/check` (it also needs `@emnapi/runtime` and `@emnapi/core`
transiently, because `.npmrc`'s `legacy-peer-deps` skips them), `npx astro check` → 0 errors,
`npm run build-storybook`, `npm run check:exports`, `rm -rf .astro`. Then:

- **Unit tests** (`npm test`): the resolver's decisions, the builder's markup contract, escaping, and every
  validation message.
- **Browser tests**: the built Storybook driven by `playwright-core` (kept in a scratch directory, not a
  dependency), asserting on the real DOM:
  1. Clicking a trigger opens the dialog modally (`:modal`), and focus moves inside it.
  2. Escape closes it, and focus returns to the trigger.
  3. After a footer choice, reopening and dismissing with Escape, ✕ or the backdrop leaves `returnValue` `""`.
  4. Backdrop click closes a lightbox and a panel, and does not close a confirm or a `dismiss="closerequest"`
     dialog; `dismiss="none"` survives two Escapes and a backdrop click.
  5. Roles and ARIA: `alertdialog` on confirm; `aria-labelledby`/`aria-describedby` resolve to existing nodes;
     no `aria-describedby` without a description.
  6. The document does not scroll while a dialog is open, and does again after it closes.
  7. Layout: at 375px a lightbox is docked at the bottom; at 1280px it is centred and 616px wide; narrow, wide,
     large, fullscreen and panel sizes; on a 320×200 viewport the footer can be scrolled into view.
  8. Dark theme, including a dialog under a nested `[data-theme="dark"]` while the OS is light.
  9. Reduced motion: no transform at any point of the opening; forced colours: a visible edge.
  10. Form story: the footer submit button submits the body form; Cancel closes without validating.
  11. Parity: `Dialog` and `createDialog` emit the same tree for the same inputs.
  12. A drag from inside the dialog onto the backdrop does not close it.
- **A real consumer app**: the package packed with `npm pack` and installed into a scratch Astro app. It checks
  that the subpaths resolve, that the component's own `<script>` is bundled and runs, and that the build fails,
  with the documented message, for a missing or empty title, a confirm without a description, a confirm
  without a footer, and an empty `closeLabel`.

The behaviour tests and the consumer-app tests run in both Chromium and Playwright's WebKit 27.2, and pass in
both. Both engines have `closedby` natively, so `emulateClosedBy` (for Safari releases without it) is not
exercised by any engine available here; it is verified by code review only.

## Known limitations

- **Scrollbar gutter.** While a modal is open, `scrollbar-gutter: stable` reserves the scrollbar's width even on
  a page that did not overflow. With classic (non-overlay) scrollbars, such as Windows', that narrows the
  dialog's containing block by the scrollbar width, so a fullscreen dialog or an end-side panel stops about 15px
  short of the right edge. Accepted: the common case is a page that scrolls, where the space is already taken.
- **Storybook.** The Storybook prerender emits the component's `<script>` as a raw source path that 404s in the
  preview. The story files call `installDialogFallbacks()` themselves; the real bundling is verified in the
  consumer app.
- **Exit transition outside Chromium.** Only Chromium can transition `overlay`. WebKit 27.2 hides a closing
  dialog at once, so there the exit is instant rather than a fade; it does not leave a copy behind (tested).
  Firefox is untested.
- **Focus after a mouse-opened dialog in Safari.** In Safari a mouse click does not focus a button, so when a
  dialog opened by mouse closes, focus goes to the page body rather than the trigger. That is the platform's
  behaviour for every native dialog. Opened from the keyboard, focus returns to the trigger (tested in WebKit).
- **`emulateClosedBy` is unexercised.** See Verification: no available engine lacks `closedby`.

## Follow-ups

- Snackbar — non-modal live region.
- Image gallery — built on `Dialog`: prev/next, arrow keys, "3 / 12", swipe, zoom.
- Hero-image variant and back button, if a screen needs them.
