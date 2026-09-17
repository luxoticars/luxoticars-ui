# @luxoticars/ui

Accessible Luxoticars components for HTML, Astro and Tailwind CSS.

## Installation

This package is not published to npm. Install it straight from the Git repository:

```bash
npm install github:luxoticars/luxoticars-ui
# or
pnpm add github:luxoticars/luxoticars-ui
# or
yarn add luxoticars/luxoticars-ui
```

This adds a dependency named `@luxoticars/ui` to your `package.json`, so all imports below work unchanged:

```json
{
  "dependencies": {
    "@luxoticars/ui": "github:luxoticars/luxoticars-ui"
  }
}
```

### Pinning a version

Append a tag, branch or commit to lock the version you depend on:

```bash
npm install github:luxoticars/luxoticars-ui#v0.1.0
npm install github:luxoticars/luxoticars-ui#main
```

Without a suffix the default branch is used and `npm update` will pick up new commits.

### Private repository access

If this repository is private, the machine running `npm install` needs Git access to it.
Use the SSH form and an SSH key that can read the repo:

```bash
npm install git+ssh://git@github.com/luxoticars/luxoticars-ui.git
```

In CI, a personal access token also works (prefer an environment variable so it isn’t written into shell history):

    npm install git+https://x-access-token:${GITHUB_TOKEN}@github.com/luxoticars/luxoticars-ui.git

## HTML API

String builders for contexts that render markup without Astro.

```js
import { createButton, createFooter, createLogo } from "@luxoticars/ui";

const button = createButton({ label: "Continue" });
const footer = createFooter({ siteTitle: "Luxoticars" });
const logo = createLogo({ siteTitle: "Luxoticars" });
```

The two builders get their styling from different places, and neither ships any:

- `createButton` writes Tailwind utility classes, so it is styled in an app that
  loads Tailwind and has the `@source` line below.
- `createFooter` and `createLogo` write plain class names styled by
  `@luxoticars/ui/styles/footer.css` and `@luxoticars/ui/styles/logo.css`, the
  same stylesheets `astro/Footer` and `astro/Logo` use. Import them once,
  anywhere in your CSS or JS bundle. No Tailwind needed:

  ```js
  import "@luxoticars/ui/styles/footer.css";
  import "@luxoticars/ui/styles/logo.css";
  ```

  A footer left with its built-in wordmark needs both, because that wordmark is
  `createLogo` — its own block, with its own stylesheet.

Each builder takes the same options as its Astro component and defaults to the
same content, so the two render identical markup. Everything except `logo` — the
string-builder stand-in for the component's `logo` slot — is HTML-escaped.

## Astro API

Astro components are imported by subpath. Both the extensionless and `.astro`
forms resolve to the same file:

```astro
---
import Footer from "@luxoticars/ui/astro/Footer";
import Button from "@luxoticars/ui/astro/ui/Button";
// same component, if you prefer the explicit form:
// import Footer from "@luxoticars/ui/astro/Footer.astro";
---
```

**Per-component props, slots and examples are not documented here.** They live in
Storybook, generated from each component's own types and JSDoc, so they cannot
drift from the code the way a hand-written table in this file does. Run
`npm run storybook`, or read the published build.

## Design tokens

Colour comes from one shared token table, `@luxoticars/ui/styles/tokens.css`. The
names are daisyUI's (`primary` / `primary-content`, `base-100..300`, `base-content`,
`error`, `success`, `warning`, `info`, `accent`, `neutral`) and the values are copied
from luxoticars-dash's `randomshark` themes, so a component renders identically in the
dash and on luxoticars.cc.

**In a Tailwind app without daisyUI** (luxoticars-web), import the tokens and point
Tailwind at the package. The `@source` line is not optional: Tailwind v4 does not scan
`node_modules`, so without it every class in this package is treated as unused and
purged, and components render as unstyled text.

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "@luxoticars/ui/styles/tokens.css";
@source "../../node_modules/@luxoticars/ui/src";
```

**In an app that already has daisyUI** (luxoticars-dash), do *not* import
`tokens.css` — daisyUI already emits the same token names and the two definitions
would fight. Keep the `@source` line.

Light is the base theme. Dark applies under `prefers-color-scheme: dark`, and
`data-theme="light"` / `data-theme="dark"` on `<html>` pins either one explicitly.

Two rules the values encode, worth knowing before you reach for a token:

- `primary` is the brand cyan and it is a **fill** colour. On a button it reads
  11.14:1 against `primary-content`; as text on the light canvas it reads 1.35:1.
  Use `accent` when you need the brand colour as text.
- `-content` colours are calibrated against their solid fill. On a tinted background
  (`bg-error/10`) use the status colour itself as text, not `error-content`.
- Components may only use tokens **daisyUI also defines**, because the dash gets its
  tokens from daisyUI rather than from this file. A token that exists only here
  silently produces no utility there — that is how the focus ring went missing on the
  dash before it used `ring-accent`.

## Storybook

Storybook is where components are reviewed and where their documentation lives.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development and testing guide.

```bash
npm install
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in storybook-static/
```

Astro components have no browser runtime, so they cannot render in a story on
their own. [`@storybook-astro/framework`](https://github.com/storybook-astro/storybook-astro)
bridges that with Astro's Container API: in dev it renders through middleware
over HMR, so args and the Controls panel drive a real Astro render; the static
build pre-renders each story ahead of time, which is why Controls are inert on
the published site.

Write a story with plain args. Slot content goes under the reserved `slots` key:

```ts
import Button from "../../src/astro/ui/Button.astro";

export default {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
};

export const Outline = {
  args: { variant: "outline", slots: { default: "Enquire now" } },
};
```

`tags: ["autodocs"]` is what generates a component's documentation page. The
props table and every description come from the component's own `Props` type and
frontmatter JSDoc, so documenting a prop means writing the JSDoc next to it —
not editing this file. That extraction needs `typescript` installed and a
`tsconfig.json` at the repo root; without them the build still succeeds and the
tables are silently empty.

Stories live in `stories/` rather than beside their components, because
`package.json#files` ships all of `src/` and co-located stories would land in
every consumer's `node_modules`.

Storybook is a development-only concern. It is not part of the published package:
`files` limits the package to `src` and the README, and installing this package
from Git pulls none of the Storybook dependencies.

### Published Storybook

`.github/workflows/storybook.yml` builds the Storybook and deploys it to GitHub
Pages on every push to `main`, publishing to
`https://luxoticars.github.io/luxoticars-ui/`.

It uses the "GitHub Actions" Pages source rather than "Deploy from a branch", so
the build output never has to be committed. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**; until then
the deploy job fails.

## Styling approach

Two conventions coexist, deliberately.

The footer predates the token table and is styled by `styles/footer.css`, which
reads design tokens as custom properties with literal fallbacks, so it renders in
an app with no Tailwind at all. That one stylesheet serves both APIs:
`Footer.astro` pulls it into its scoped `<style>` with an `@import`, which Astro
scopes exactly as it would inline rules, while `createFooter` has no build step
and leaves the import to the caller. One copy of the rules, so the two footers
cannot drift apart. `styles/logo.css` and the `logo` block work the same way, for
the wordmark both footers fall back to.

Class names in both are BEM — `footer`/`logo` as the block, `block__element` for every part, `block__element--modifier` for every variant — so a consuming app has a stable hook on every node.

The only tag-based selector is the focus ring for whatever fills the footer’s `logo` slot, since that slot can contain arbitrary markup.

Everything under `astro/ui/` ships Tailwind utility classes resolved against the
shared tokens. These are the design-system primitives; they assume Tailwind v4 and
the `@source` line above. `cn` (`clsx` + `tailwind-merge`) is exported as
`@luxoticars/ui/utils/cn` so a consumer can drop their own copy and keep a single
`tailwind-merge` in the bundle.

Tree-shaking: Astro components are reached one subpath at a time and there is no
barrel re-exporting them, so importing `Button` pulls in nothing else. Do not add an
`index.ts` that re-exports `.astro` files — that barrel is not shakeable and would
drag every component into every page's build graph.
