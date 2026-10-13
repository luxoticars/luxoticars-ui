# ProgramBadge — design

Status: spec approved, not yet implemented · 2026-10-13

## Intent

A small badge for `@luxoticars/ui`: an icon and/or a short label saying that a seller or listing belongs to a
programme. The first and only icon for now is **top-rated-seller**. It ships for **Astro** and **Marko 6**, and
it is the first component in the package with a Marko version.

Success means:

- **One answer, two renderers.** The Astro component and the Marko tag produce the same tree for the same
  inputs. A parity test enforces it (see [Verification](#verification)).
- **Accessible by construction.** When there is text, the icon is hidden from assistive tech, so the badge is
  read once. When the badge is icon-only, the icon carries the name. Meaningful graphics meet 3:1 contrast
  (WCAG 1.4.11) in both themes.
- **Marko in Storybook, done properly.** Marko has its own Storybook, built with Storybook's Marko framework and
  composed into the existing Astro Storybook. Nothing renders Marko through Astro.
- **Concerns stay separated.** The code that decides what to render knows nothing about Astro or Marko. Each
  renderer only prints what that code decided (see [Architecture](#architecture)).

### Decisions

| Decision | Outcome |
|---|---|
| Renderers | Astro and Marko 6. The **HTML string builder is deferred**, not dropped. This is a deliberate exception to the "every component ships an HTML builder" convention; `createProgramBadge` is a follow-up. |
| Names | Marko `<program-badge>`, Astro `ProgramBadge` (`@luxoticars/ui/astro/ui/ProgramBadge`). The Marko name is unprefixed at the maintainer's request; see [Known limitations](#known-limitations). |
| Marko version and syntax | Marko 6 Tags API, written in **concise syntax** in every `.marko` file in this repo, including any made only for a spike or a test. No Marko 5 syntax: no `$` scriptlets, `style { }` blocks, `class { }` blocks or `onClick("name")` handlers. |
| Icons | Original artwork on a 24×24 grid, one colour (`currentColor`), with details knocked out using `fill-rule="evenodd"` so they show the surface behind them. The first icon is a rosette with a star (see [Icon](#icon-top-rated-seller)). |
| Storybook | Storybook **composition**: `.storybook/` (Astro) stays the host and references `.storybook-marko/` (Marko) through `refs`. |
| Provenance | Only the idea comes from eBay Sonata UI's `su-program-badge`. See [Provenance](#provenance). |
| Out of scope | The HTML builder, more icons, a custom-icon slot, interactive badges (link or button), and per-icon colours. |

## Provenance

The idea is eBay Sonata UI's `su-program-badge` (`@ebay/sonata-ui`, from eBay's internal GitHub): an icon
plus a label, at two sizes. **No code, CSS, stories or artwork are copied.** The top-rated-seller icon is
drawn for Luxoticars, and its colour comes from Luxoticars tokens rather than eBay blue. The deliberate
differences from `su-program-badge`:

| `su-program-badge` | `ProgramBadge` | Why |
|---|---|---|
| `<div>` with `display: flex` | `<span>` with `display: inline-flex` | Valid inside `<p>`, `<a>` and `<button>`, where badges sit |
| Its `Default` story labels the icon *and* prints the same text | The icon is `aria-hidden` whenever text is present | Otherwise screen readers read the label twice |
| Depends on `su-icon`, `su-styled-text`, `su-component`, `@ebay/ebayui-core` | No dependencies beyond the shared files below | Nothing to drag along |

## Icon: top-rated-seller

A rosette: a round medal with a knocked-out five-point star, and two ribbon tails below it. The default
label is **"Top rated seller"**. The path data, on a `0 0 24 24` viewBox:

| Part | `d` | `fill-rule` |
|---|---|---|
| Ribbon tails | `M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z` | (nonzero) |
| Medal and star | `M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z` | `evenodd` |

The tails overlap the bottom of the medal. They are a separate path so `evenodd` on the medal does not cut
holes where the two overlap.

## Architecture

Each concern has one home. The framework-free homes are shared by both renderers.

| Concern | Home | Owns |
|---|---|---|
| **Artwork** | `src/data/program-badge-icons.js` + `.d.ts` (internal, not exported) | `id → { label, paths: [{ d, fillRule? }] }`. Data only. |
| **Decisions** | `src/utils/program-badge.js` + `.d.ts` (internal, not exported) | `resolveProgramBadge()`: validation, classes, and whether the icon is hidden or named. Pure: no DOM, no markup. |
| **Styling** | `src/styles/program-badge.css` (not exported until the HTML builder needs it) | All presentation. |
| **Shared types** | `src/types.d.ts` (exported as `./types`) | `ProgramBadgeIcon` (`"top-rated-seller"`), `ProgramBadgeSize` (`16 \| 24`) |
| **Rendering, Astro** | `src/astro/ui/ProgramBadge.astro` | Props in, resolver result out as markup |
| **Rendering, Marko** | `src/marko/program-badge.marko` | Input in, resolver result out as markup |

Rules the implementation holds to:

1. The framework-free files import nothing from Astro or Marko and never touch the DOM.
2. The renderers make **no decisions**. Every class, `role` and `aria-*` value they print comes from the
   resolver. Their only conditionals are "is there a badge", "is there an icon" and "is there text", each read
   straight off the resolver's result. A conditional that only one renderer needs belongs in the resolver.
3. The two renderers never import each other.
4. The Marko toolchain is confined to `src/marko/`, `marko.json`, `.storybook-marko/`, `stories-marko/` and
   `tsconfig.marko.json`. The Astro Storybook knows the Marko one only as a URL.

This fits Marko's own guidance. Its separation-of-concerns essay argues for splitting by real boundaries,
not by technology, and it lists separating lower-level utilities from higher-level components as one such
boundary. That is the split here: a framework-free core, and one renderer per framework. Marko's styling guide
names "sharing across templates" as the case for an imported stylesheet, which is what `program-badge.css` is.

## Resolver

```ts
resolveProgramBadge(options: {
  text?: string;
  icon?: ProgramBadgeIcon;
  size?: ProgramBadgeSize;   // default 16
  iconLabel?: string;
  className?: ClassValue;    // anything cn() accepts: Marko's `class` may be a string, array or object
}): null | {
  className: string;         // "program-badge", plus "program-badge--24", plus the caller's class
  text: string | undefined;
  icon: null | {
    paths: { d: string; fillRule?: "evenodd" }[];
    role: "img" | undefined;
    label: string | undefined;    // aria-label
    hidden: "true" | undefined;   // aria-hidden, as a string, never a boolean
  };
}
```

| Input | Result |
|---|---|
| No `icon` and no `text` (absent, empty, or whitespace-only text) | `null`: nothing renders |
| `icon` and `text` | Icon `hidden: "true"`, no `role` or `label`. `iconLabel` is ignored, because the text names the badge. The text is trimmed. |
| `icon` and whitespace-only `text` | Treated as icon-only, so the icon stays named. Hiding it next to an invisible label would leave the badge with no name. |
| `icon` only | Icon `role: "img"`, `label: iconLabel ?? the icon's default label` |
| `text` only | `icon: null` |
| Unknown `icon`, including inherited object keys such as `"toString"` | Throws: `ProgramBadge: unknown icon "x". Use one of: top-rated-seller.` |
| `size` as a numeric string (`"24"`) | Accepted as the number, which is how an HTML attribute or a Storybook control may pass it |
| `size` not 16 or 24 | Throws, naming the allowed sizes |
| Icon-only with an empty or whitespace-only `iconLabel` | Throws: an icon-only badge needs a non-empty label |

Throwing follows Dialog's rule that a component refuses to ship inaccessible or invalid output: the server
render, and therefore the build, fails with the message. Classes are joined with `cn()`, so a caller's
Tailwind classes merge the same way as in other components. Absent attributes are `undefined`. Astro and
Marko both skip `undefined`, `null` and `false` attributes. Marko's docs require ARIA values to be strings,
not booleans, which is why `hidden` is `"true" | undefined`.

## Markup

Identical from both renderers, apart from whitespace between elements:

```html
<!-- icon + text -->
<span class="program-badge">
  <svg class="program-badge__icon" viewBox="0 0 24 24" fill="currentColor" focusable="false" aria-hidden="true">
    <path d="M8.5 14.8…"/><path fill-rule="evenodd" d="M5 9.5…"/>
  </svg>
  <span class="program-badge__text">Top rated seller</span>
</span>

<!-- icon only -->
<span class="program-badge">
  <svg class="program-badge__icon" viewBox="0 0 24 24" fill="currentColor" focusable="false" role="img" aria-label="Top rated seller">…</svg>
</span>

<!-- text only, at size 24 -->
<span class="program-badge program-badge--24">
  <span class="program-badge__text">Free inspection</span>
</span>
```

Any other attributes the caller passes (`id`, `data-*`, …) are spread onto the outer `<span>`. The renderer
removes `class` from the spread, because the resolver owns the merged class. Writing an explicit `class` next
to a spread that also carries `class` emits two attributes, and the parser keeps the first. `Button.astro`
documents the same trap.

## Astro API

```astro
---
import ProgramBadge from "@luxoticars/ui/astro/ui/ProgramBadge";
---
<ProgramBadge icon="top-rated-seller" text="Top rated seller" />
<ProgramBadge icon="top-rated-seller" iconLabel="Penjual terbaik" size={24} />
```

`Props` is `{ text?, icon?, size?, iconLabel? } & HTMLAttributes<"span">`, with JSDoc on each prop, because
the Storybook docs are generated from it.

## Marko API

Discovered automatically in any Marko 6 app that installs the package, via `marko.json`:

```marko
program-badge icon="top-rated-seller" text="Top rated seller"
program-badge icon="top-rated-seller" iconLabel="Penjual terbaik" size=24
```

The tag, in concise syntax (a sketch; the implementation may differ in detail, not in shape):

```marko
import "../styles/program-badge.css"
import { resolveProgramBadge } from "../utils/program-badge.js"
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../types"

export interface Input extends Omit<Marko.HTML.Span, "content"> {
  /** Visible label. */
  text?: string
  /** A named icon. */
  icon?: ProgramBadgeIcon
  /** Icon size, text size and gap. @default 16 */
  size?: ProgramBadgeSize
  /** What screen readers hear for an icon-only badge. @default the icon's own label */
  iconLabel?: string
}

const/{ text, icon, size, iconLabel, class: className, content: _content, ...attrs }=input
const/badge=resolveProgramBadge({ text, icon, size, iconLabel, className })

if=badge
  span ...attrs class=badge.className
    if=badge.icon
      svg.program-badge__icon
        ,viewBox="0 0 24 24"
        ,fill="currentColor"
        ,focusable="false"
        ,role=badge.icon.role
        ,aria-label=badge.icon.label
        ,aria-hidden=badge.icon.hidden
        for|path| of=badge.icon.paths
          path d=path.d fill-rule=path.fillRule
    if=badge.text
      span.program-badge__text -- ${badge.text}
```

`content` is taken out of the input on purpose. Marko 6 native tags accept `content` as an attribute, so
spreading it onto the `<span>` would render body content the badge does not support.

## Styling

`src/styles/program-badge.css` uses BEM (Marko styles are global, and its docs recommend BEM for that reason).
Every token has a literal fallback, as in `footer.css` and `logo.css`. The only colour token is
`--color-accent`, which daisyUI also defines, so the rule in `Button.astro` holds.

| | size 16 (default) | `program-badge--24` |
|---|---|---|
| Icon box | 1rem | 1.5rem |
| Text | `var(--text-sm, 0.875rem)`, line-height 1.25rem | `var(--text-base, 1rem)`, line-height 1.5rem |
| Gap | 0.25rem | 0.5rem |

- `.program-badge`: `display: inline-flex; align-items: center`. The text colour is inherited.
- `.program-badge__icon`: `flex-shrink: 0`, coloured
  `var(--lux-accent, var(--color-accent, oklch(52% 0.16 232.661)))`. `--lux-*` is read first for the reason
  `dialog.css` records: Tailwind's `@theme` declares `--color-accent: var(--lux-accent)` on `:root`, and a
  custom property resolves where it is declared. Inside a nested `[data-theme]`, `--color-accent` would
  therefore still carry the `:root` value, while `--lux-accent` is redeclared on the themed element. A caller
  can recolour it with a class.

## Storybook

| File | Role |
|---|---|
| `.storybook/main.ts` | Gains a `refs` function: `http://localhost:6007` in development, the relative `marko/` path in a static build. |
| `.storybook-marko/main.ts` | Framework `@storybook/marko-vite`, stories from `../stories-marko/**/*.stories.ts`, `@storybook/addon-docs` |
| `.storybook-marko/preview.ts` | Loads `src/styles/tokens.css` and has the same Dark/Light theme toolbar as the Astro preview. A decorator sets `data-theme` on the story's canvas element and returns the story unchanged, which is the mechanism `@storybook/addon-themes` uses. A Marko `ThemeFrame` is not possible: `@storybook/marko@10.1.0` throws "Decorators are not yet supported in Tags API templates" for any decorator that returns a Marko 6 component. Touching the DOM is safe here, unlike in the Astro preview, because this renderer only runs in the browser. There is no static prerender in Node. |
| `stories/program-badge-cases.ts` | The story cases, framework-free (precedent: `stories/dialog-content.ts`). Both story files and the parity test read it. |
| `stories/ui/ProgramBadge.stories.ts` | Astro stories, built from the cases |
| `stories-marko/program-badge.stories.ts` | Marko stories, built from the same cases |

The cases are **Default** (icon and text), **TextOnly**, **IconOnly**, **Large** (size 24) and
**IconOnlyMalayLabel** (`iconLabel: "Penjual terbaik"`).

The Astro stories get their controls and docs from `Props` and its JSDoc. `@storybook/marko@10.1.0` has no
docgen: it does not read a tag's `Input` type. So the Marko stories declare `argTypes` explicitly, as Sonata
UI's do, and those `argTypes` live in `stories/program-badge-cases.ts` beside the cases.

Scripts:

| Script | Command |
|---|---|
| `storybook` | Unchanged: the Astro Storybook on 6006 |
| `storybook:marko` | `storybook dev -p 6007 -c .storybook-marko` |
| `build-storybook` | `storybook build && storybook build -c .storybook-marko -o storybook-static/marko` |

The Astro build runs first, because it replaces its output directory. The Pages workflow already runs
`build-storybook` and uploads `storybook-static/`, so it publishes both Storybooks with no workflow change. In
development the composed view needs both dev servers running. That is documented, and no new process-runner
dependency is added.

## Packaging

| Change | Detail |
|---|---|
| `marko.json` (new, root) | `{ "exports": "./src/marko", "script-lang": "ts" }`. Whether `script-lang` is needed is settled by spike S3. |
| `package.json#files` | Adds `marko.json` |
| `package.json#exports` | `"./marko/*.marko": "./src/marko/*.marko"` and `"./marko/*": "./src/marko/*.marko"`, mirroring the `./astro/*` pair, for apps that import by path |
| `peerDependencies` | `marko: "^6"`, marked optional in `peerDependenciesMeta`, so Astro-only consumers never install Marko |
| `devDependencies` | `marko@^6`, `@storybook/marko`, `@storybook/marko-vite@^5` (`@marko/vite` and `@marko/compiler` arrive with these) |
| `tsconfig.marko.json` (new) | Extends `tsconfig.json`, with `noEmit: true`. Includes `src/marko`, `src/utils`, `src/data`, `src/types.d.ts`, `stories-marko` and `.storybook-marko`. The main `tsconfig.json` and `astro check` stay untouched. |
| `description` / `keywords` | Mention Marko |

`@marko/type-check` is installed transiently for verification, as `@astrojs/check` is, and is never
committed.

### Compared with Sonata UI's distribution

Sonata UI (`@ebay/sonata-ui`, Marko 5) is a working Marko tag library, so its wiring is the reference point:

| | Sonata UI | `@luxoticars/ui` | Why the difference |
|---|---|---|---|
| Source | TypeScript `.marko` in `src/components/<name>/index.marko`, with its `style.css` alongside and auto-discovered | TypeScript `.marko` in `src/marko/program-badge.marko`, importing the shared `program-badge.css` | The stylesheet is shared with the Astro renderer. In Marko 6, `components/` folders are a heuristic for Marko 5 interop, so the folder is not named that. |
| Build | `mtc` with `outDir: dist`, which emits `.marko` with types stripped plus `.d.marko`, and postcss for CSS | None: the package ships unbuilt | Consumers install from Git, not from a registry. Spike S3 tests whether unbuilt source is enough. |
| `marko.json` | `{ "exports": "./dist/components" }` | `{ "exports": "./src/marko" }` | Points at source because nothing is built |
| `files` | `dist`, `marko.json`, and negations that drop stories and tests | `src`, `marko.json` | Stories already live outside `src/` |
| `marko` dependency | Required peer, `"5"` | Optional peer, `"^6"` | Marko is one of two renderers here |
| Publishing | `npm publish` to a private registry after `build:release` | A Git tag (`changeset git-tag`) | Unchanged |

## Order of work

0. **Spike (throwaway, not committed).** Each question has a pass condition and a fallback. If a question fails
   with no fallback, work stops and the findings are reported before any component code is written.

   | # | Question | Pass | Fallback |
   |---|---|---|---|
   | S1 | Does a trivial concise-syntax Marko 6 story render with `@storybook/marko-vite@5`, Storybook 10.6 and Vite 8, both in dev and in a static build, with `tokens.css` (which contains Tailwind's `@theme` at-rule) loaded by a preview without Tailwind? | Story renders in both | If only the `@theme` rule breaks the build: load `tokens.css` through `@tailwindcss/vite`, as the Astro preview does. Anything else: none; stop and report. |
   | S2 | Does the Astro Storybook compose the Marko one through a relative `refs` URL when the static build is served at `/` **and** at `/luxoticars-ui/`? | The Marko stories are listed and render in the host at both paths | An absolute URL from a `STORYBOOK_MARKO_URL` build variable set in the workflow. If composition itself fails: two Storybooks linked to each other, after checking with the maintainer. |
   | S3 | Installed from `npm pack` into a scratch Marko 6 app, is `<program-badge>` discovered through `marko.json`, does its TypeScript syntax compile, and does `mtc` in that app see its `Input` types? | All three | **Doesn't compile:** confirm `"script-lang": "ts"` is in the shipped `marko.json`. If it still fails, the tag is authored without TypeScript syntax and its `Input` moves to a `program-badge.d.marko` beside it. That is Sonata's published layout, and the Marko counterpart of this repo's JS + `.d.ts` convention. **Types don't reach the consumer:** commit the `.d.marko` that `@marko/type-check` emits beside the tag, and add a staleness check to verification (regenerate, then `git diff --exit-code`). |
   | S4 | Does the host's theme toolbar reach composed Marko stories? | Recorded either way | Acceptable if the theme can be switched in the Marko Storybook itself (`/marko/`) |

1. The framework-free files: icon data, resolver and its tests, stylesheet, shared types.
2. The Astro component and its stories.
3. The Marko tag, `marko.json`, exports, `.storybook-marko/` and its stories.
4. Verification, a minor changeset, and docs (README, CONTRIBUTING, CLAUDE.md).

## Verification

All of these must pass before the PR is raised:

1. `npm test`: resolver unit tests covering every row of the [Resolver](#resolver) table, plus class merging.
2. `npx astro check`: 0 errors (with `@astrojs/check` installed transiently).
3. `npx mtc -p tsconfig.marko.json`: 0 errors (with `@marko/type-check` installed transiently).
4. `npm run check:exports`.
5. `npm run build-storybook`: both builds succeed, and `storybook-static/marko/index.json` exists.
6. **Playwright against the built static Storybook**, served under a sub-path, in Chromium:
   1. Composition: the host sidebar lists the Marko ProgramBadge stories, and they render.
   2. Parity: for every case, the Astro and Marko stories produce the same element tree (tag names,
      attributes, trimmed text), compared in the DOM, not as strings.
   3. Names: with text, the `<svg>` has `aria-hidden="true"` and no `role` or `aria-label`. Icon-only, it is
      found by `getByRole("img", { name })` with the expected label, including the Malay one.
   4. Contrast: the icon against the canvas is at least 3:1, and the text against the canvas is at least
      4.5:1, in both Dark and Light themes.
   5. Size: the icon box is 16×16 by default and 24×24 at size 24.
7. **Real consumer apps**, from `npm pack`:
   1. A scratch Marko 6 app discovers `<program-badge>`, server-renders the expected markup, passes `mtc` on a
      valid usage, and fails `mtc` on `icon="nope"`.
   2. A scratch Astro app imports `@luxoticars/ui/astro/ui/ProgramBadge` and builds **without Marko
      installed**, proving the peer dependency really is optional.
8. `rm -rf .astro` before committing.

## Known limitations

- **The unprefixed Marko tag name.** Marko's custom-tag docs caution that when two installed packages
  export the same tag name, Marko uses the first one it finds, and they encourage library prefixes. A
  consumer's own `tags/program-badge.marko` would also take precedence over this one. Anyone affected can
  import by path: `import ProgramBadge from "@luxoticars/ui/marko/program-badge.marko"`.
- **Two dev servers** for the composed view in development.
- **The theme toolbar** may not reach composed Marko stories (spike S4).

## Follow-ups

- `createProgramBadge()`, the HTML builder, which will also export `./styles/program-badge.css`.
- More icons.
- A custom-icon option, if a programme needs artwork the package does not ship.
