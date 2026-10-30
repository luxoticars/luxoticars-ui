# Storybook shell host with composed Astro + Marko refs

Date: 2026-10-30
Status: approved for planning

## Goal

1. The sidebar shows the Astro components under a composed **Astro** ref, a peer
   of the existing **Marko** ref: `Astro → Components → Logo`, and likewise
   Footer, SiteHeader, SectionHead, Button, Dialog and ProgramBadge.
2. **HTML** and **Skin** stay at the root of the **host** Storybook. They are
   not moved under Astro.
3. Skin/pill **Show code** shows what a consumer writes (the CSS import and the
   markup), not the CSF args object `{ args: { size: "default" } }`.

## Non-goals

- Renaming Marko story titles (kebab-case such as `Components/logo` stays).
- Moving `src/astro/Logo.astro` or any other component file.
- Putting HTML or Skin stories under the Astro ref.
- Changing the Marko Storybook's internals (`.storybook-marko/`); only the
  host's `refs` entry for it is touched.
- Any visual change to pill or to any component CSS.
- Moving story files on disk. Every story keeps its current path under
  `stories/`; which Storybook picks it up is decided by globs alone.

## Current state (upstream/main, v0.15.5)

| Item | Today |
|------|-------|
| `.storybook/` | Astro host (`@storybook-astro/framework`, `renderMode: "static"`), stories glob `../stories/**/*.stories.ts`, `refs.marko` |
| `.storybook-marko/` | Marko Storybook, stories `../src/marko/**/stories.ts`, built into `storybook-static/marko/` |
| Sidebar root | `HTML/*`, `Skin/pill`, `Components/*` (Astro) and the `Marko` ref |
| Scripts | `storybook` (6006), `storybook:marko` (6007), `build-storybook` (host + Marko) |
| Vitest | `vitest.config.ts` projects: `vitest.astro.config.ts` (`configDir: ".storybook"`), `vitest.marko.config.ts` |
| Skin/pill Show code | CSF fallback: `{ args: { size: "default" } }` |

Story files under `stories/` and their titles:

| File | Title | Belongs to |
|------|-------|-----------|
| `stories/Button.stories.ts` | `HTML/createButton` | host |
| `stories/createDialog.stories.ts` | `HTML/createDialog` | host |
| `stories/createFooter.stories.ts` | `HTML/createFooter` | host |
| `stories/createListingCard.stories.ts` | `HTML/createListingCard` | host |
| `stories/createLogo.stories.ts` | `HTML/createLogo` | host |
| `stories/skin/pill.stories.ts` | `Skin/pill` | host |
| `stories/Footer.stories.ts` | `Components/Footer` | Astro |
| `stories/Logo.stories.ts` | `Components/Logo` | Astro |
| `stories/SectionHead.stories.ts` | `Components/SectionHead` | Astro |
| `stories/SiteHeader.stories.ts` | `Components/SiteHeader` | Astro |
| `stories/ui/Button.stories.ts` | `Components/Button` | Astro |
| `stories/ui/Dialog.stories.ts` | `Components/Dialog` | Astro |
| `stories/ui/ProgramBadge.stories.ts` | `Components/ProgramBadge` | Astro |

Note the two Button files: `stories/Button.stories.ts` is the plain HTML
`createButton` (host); `stories/ui/Button.stories.ts` is `Button.astro` (Astro).

## Architecture: shell host + two refs

Three Storybooks, one sidebar:

```
host  .storybook/          HTML/*, Skin/*           storybook-static/
 ├─ ref "Astro"  .storybook-astro/   Components/*   storybook-static/astro/
 └─ ref "Marko"  .storybook-marko/   Components/*   storybook-static/marko/
```

### Host — `.storybook/`

- Framework stays `@storybook-astro/framework` with `renderMode: "static"` and
  the existing `viteFinal` (Tailwind). The HTML and Skin stories already render
  there (they return their own DOM node and skip the Astro pipeline), so no new
  renderer dependency is added.
- Stories glob, exactly:

  ```ts
  stories: [
    "../stories/create*.stories.ts",   // HTML/createDialog, createFooter, createListingCard, createLogo
    "../stories/Button.stories.ts",    // HTML/createButton
    "../stories/skin/**/*.stories.ts", // Skin/*
  ],
  ```

- `refs`, following the existing Marko pattern (localhost in development,
  relative URL in the static build so it works at the custom-domain root and
  under a fork's `/luxoticars-ui/` path):

  ```ts
  refs: (_config, { configType }) => ({
    astro: {
      title: "Astro",
      url: configType === "DEVELOPMENT" ? "http://localhost:6008" : "./astro",
    },
    marko: {
      title: "Marko",
      url: configType === "DEVELOPMENT" ? "http://localhost:6007" : "./marko",
    },
  }),
  ```

- `preview.ts`, `preview.css` and `ThemeFrame.astro` stay as they are. The
  ThemeFrame decorator becomes a no-op on the host (no story there has an Astro
  component) but is left in place to keep this change small; removing it is an
  optional follow-up.
- Addons unchanged (`addon-docs`, `addon-a11y`, `addon-vitest`).

### Astro — `.storybook-astro/` (new)

- Created by copying today's `.storybook/main.ts`, `preview.ts`, `preview.css`
  and `ThemeFrame.astro`. Same framework, `renderMode: "static"`, addons and
  `viteFinal`.
- No `refs` (refs live only on the host).
- Stories glob, exactly:

  ```ts
  stories: [
    "../stories/Footer.stories.ts",
    "../stories/Logo.stories.ts",
    "../stories/SectionHead.stories.ts",
    "../stories/SiteHeader.stories.ts",
    "../stories/ui/*.stories.ts",
  ],
  ```

- Story titles stay `Components/*`; inside the composed ref they appear as
  `Astro → Components → Logo`.
- Relative imports in the stories (`../src/astro/...`, `./SiteHeaderScrollDemo.astro`,
  `../../src/scripts/dialog.js`) are unaffected, since files do not move.

### Marko — `.storybook-marko/`

Unchanged. Only its header comment, which says the *Astro* Storybook composes
it, is updated to say the host does.

### Guard against a story landing in neither (or both) Storybooks

Explicit globs mean a new file under `stories/` could silently be picked up by
no Storybook. Add a small check (a `node --test` test under `tests/`) that:

1. lists every `stories/**/*.stories.ts`;
2. asserts each one matches exactly one of the host or Astro globs (import the
   two arrays from a shared module, e.g. `.storybook/story-globs.ts`, so the
   configs and the test read the same source);
3. asserts host files have titles starting `HTML/` or `Skin/`, and Astro files
   have titles starting `Components/` (read the `title:` string from the file).

Rule for new stories, documented in CONTRIBUTING: Astro component stories go in
`stories/ui/` (or are added to the Astro glob list); HTML factory stories are
named `create*.stories.ts`; Skin stories go in `stories/skin/`.

## Scripts and ports

```json
"storybook": "storybook dev -p 6006",
"storybook:astro": "storybook dev -p 6008 -c .storybook-astro",
"storybook:marko": "storybook dev -p 6007 -c .storybook-marko",
"build-storybook": "storybook build && storybook build -c .storybook-astro -o storybook-static/astro && storybook build -c .storybook-marko -o storybook-static/marko"
```

- The host builds first (it owns `storybook-static/`); the two refs build into
  subfolders afterwards, as Marko does today.
- In development, run all three servers to see the full sidebar. A ref whose
  server is not running shows Storybook's usual "ref failed to load" entry,
  exactly as the Marko ref does today.
- The GitHub Pages workflow (`.github/workflows/storybook.yml`) already runs
  `npm run build-storybook` and uploads `storybook-static/`; no workflow change.

## Vitest (`npm run test:stories`)

Three projects instead of two, one per Storybook:

- `vitest.astro.config.ts` → `storybookTest({ configDir: ".storybook-astro" })`
  (keeps `fileParallelism: false` and the `cjs-esm-interop` removal).
- New `vitest.host.config.ts` → `storybookTest({ configDir: ".storybook" })`,
  same shape as the Astro one (same framework), project name `storybook-host`.
- `vitest.marko.config.ts` unchanged.
- `vitest.config.ts`: `projects: ["vitest.host.config.ts", "vitest.astro.config.ts", "vitest.marko.config.ts"]`.

## Skin/pill Show code

File: `stories/skin/pill.stories.ts`. No CSS change.

1. Extract the markup into one helper used by both `render` and the docs
   snippet, so they cannot drift:

   ```ts
   const pillMarkup = (size: Args["size"]) => {
     const sm = size === "sm" ? " pill--sm" : "";
     return `<a class="pill${sm}" href="#">Coupe</a>
   <a class="pill${sm}" href="#" aria-current="true">SUV</a>
   <a class="pill${sm}" href="#">Sedan</a>
   <a class="pill${sm} pill--selected" href="#" aria-label="Remove condition Used">Used ×</a>`;
   };

   const pillSource = (size: Args["size"]) =>
     `<!-- once, in your app entry or layout:
        import "@luxoticars/ui/styles/skin/pill.css"; -->
   ${pillMarkup(size)}`;
   ```

2. Set the snippet per story (the meta-level default would otherwise be the
   same for both):

   ```ts
   export const Default = {
     args: { size: "default" },
     parameters: { docs: { source: { language: "html", code: pillSource("default") } } },
   };
   export const Small = {
     args: { size: "sm" },
     parameters: { docs: { source: { language: "html", code: pillSource("sm") } } },
   };
   ```

3. The snippet shows the import, plain `pill`, `pill--sm` (Small),
   `aria-current="true"` for the current choice, and `pill--selected` for the
   removable filter, matching the meta JSDoc description.

Known limitation: the snippet is static per story. Changing the `size` control
on the docs page does not rewrite it; the two stories cover both sizes.

## Documentation updates

- `README.md` and `CONTRIBUTING.md`: three Storybooks, ports 6006 / 6008 / 6007,
  `npm run storybook:astro`, the sidebar layout (HTML, Skin at root; Astro and
  Marko refs), and the story-placement rule above. Extend the existing note that
  the host theme toolbar does not reach composed refs to cover Astro too (open
  `/astro/` or port 6008 to switch theme for Astro components).
- `CLAUDE.md`: Astro story ids now come from `storybook-static/astro/index.json`
  and prerendered markup from `storybook-static/astro/astro-prerendered-stories.json`;
  host (HTML/Skin) ids stay in `storybook-static/index.json`.
- No changeset: nothing in the published package (`src/`, exports) changes.

## Files touched

| File | Change |
|------|--------|
| `.storybook/main.ts` | Host globs, `refs.astro` + `refs.marko`, comment update |
| `.storybook/story-globs.ts` (new) | Host and Astro glob arrays shared with the guard test |
| `.storybook-astro/main.ts`, `preview.ts`, `preview.css`, `ThemeFrame.astro` (new) | Astro Storybook, copied from today's host |
| `.storybook-marko/main.ts` | Comment only |
| `package.json` | `storybook:astro`, `build-storybook` |
| `vitest.config.ts`, `vitest.astro.config.ts`, `vitest.host.config.ts` (new) | Three story-test projects |
| `stories/skin/pill.stories.ts` | `pillMarkup` / `pillSource`, per-story `docs.source` |
| `tests/storybook-globs.test.js` (new) | Guard test |
| `README.md`, `CONTRIBUTING.md`, `CLAUDE.md` | Docs |

## Success criteria

1. Live sidebar (published site and local dev with all three servers):
   - host root: `HTML/createButton`, `HTML/createDialog`, `HTML/createFooter`,
     `HTML/createListingCard`, `HTML/createLogo`, `Skin/pill`;
   - `Astro → Components → Button, Dialog, Footer, Logo, ProgramBadge, SectionHead, SiteHeader`;
   - `Marko → Components → logo` (and the other Marko tags), unchanged.
   - No `Components/*` entry at the host root.
2. Skin/pill docs page: Show code on Default and Small shows the
   `@luxoticars/ui/styles/skin/pill.css` import and the pill markup, not an args object.
3. `npm run build-storybook` produces `storybook-static/index.json` (HTML + Skin
   only), `storybook-static/astro/index.json` (Components only) and
   `storybook-static/marko/index.json`.
4. `npm run test:stories` and `npm test` (including the guard test) pass.
5. Prerendered Astro markup in `storybook-static/astro/astro-prerendered-stories.json`
   matches today's `storybook-static/astro-prerendered-stories.json` for every
   Components story (diff before/after).
