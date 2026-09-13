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
import { createButton } from "@luxoticars/ui";

const button = createButton({ label: "Continue" });
```

## Astro API

Astro components are imported by subpath. Both the extensionless and `.astro`
forms resolve to the same file:

```astro
---
import Footer from "@luxoticars/ui/astro/Footer";
// same component, if you prefer the explicit form:
// import Footer from "@luxoticars/ui/astro/Footer.astro";
---
```

## Footer

The site footer shared by `luxoticars-homepage` and `luxoticars-vi`. It renders the
full masthead, brand/company/enquiries columns and legal bar with no configuration:

```astro
---
import Footer from "@luxoticars/ui/astro/Footer";
---

<Footer />
```

Every piece of content is a prop, so a site overrides only what differs:

```astro
---
import Footer from "@luxoticars/ui/astro/Footer";
import Logo from "../components/Logo.astro";
import type { FooterLink } from "@luxoticars/ui/types";

const companyLinks: FooterLink[] = [
  { label: "About Us", href: "/a/" },
  { label: "Clients", href: "/a/clients" },
  { label: "Car Reviews", href: "/a/reviews" },
];
---

<Footer brandsHeading="Shop" companyLinks={companyLinks}>
  <Logo slot="logo" heading={false} />
</Footer>
```

### Props

| Prop | Default | Notes |
| --- | --- | --- |
| `siteTitle` | `"Luxoticars"` | Used by the fallback wordmark, social labels and copyright line. |
| `homeHref` | `"/"` | Target of the fallback wordmark. |
| `tagline` | shared copy | Set to `""` to drop the paragraph. |
| `brandsHeading` | `"Shop by Brand"` | `luxoticars-vi` currently uses `"Shop"`. |
| `brandLinks` | 10 marques | |
| `companyHeading` | `"Luxoticars"` | |
| `companyLinks` | About / Clients / Car Reviews | Slugs differ per site, so pass your own. |
| `enquiriesHeading` | `"Enquiries"` | |
| `enquiriesText` | shared copy | |
| `contacts` | email + WhatsApp | `icon` is `"email"` or `"whatsapp"`. |
| `socials` | 5 networks | Pass `[]` to hide the row. |
| `legalLinks` | Privacy / Terms | |
| `copyright` | `© <year> <siteTitle>. All rights reserved.` | Overrides the whole line. |
| `year` | current year | |
| `idPrefix` | `"footer"` | Only matters if a page renders two footers. |
| `class` | `""` | Appended to the root `<footer>`. |

Any link may set `external: true`, which adds `target="_blank"`, the matching `rel`,
and a visually hidden "(opens in a new tab)" note.

The `logo` slot replaces the built-in wordmark. Leave it empty and the component
renders `siteTitle` as a home link, which is deliberately not an `<h1>`: a heading
down in the footer gives every page a second level-1 heading after its real one.

Defaults are importable on their own if you want to extend rather than replace a list:

```ts
import { brandLinks } from "@luxoticars/ui/data/footer";
```

### Theming

The footer ships its own scoped CSS and does not require Tailwind. It reads these
custom properties when the host app defines them and falls back to the Luxoticars
palette when it does not:

| Property | Fallback |
| --- | --- |
| `--color-marque-accent` | `oklch(0.74 0.16 232.661)` |
| `--footer-bg` | `oklch(0.145 0 0)` |
| `--footer-fg` | `oklch(0.87 0 0)` |
| `--footer-muted` | `oklch(0.708 0 0)` |
| `--footer-hairline` | `oklch(0.269 0 0)` |
| `--font-futura` | inherited |

It also resets its own list markers, link underlines and heading margins rather than
assuming the host provides a reset. `luxoticars-vi` loads Tailwind and gets that from
preflight; `luxoticars-homepage` ships no reset at all, and the same markup renders
there with bullet points and underlined links unless the component handles it.

## Storybook

Every component has stories so a maintainer can eyeball it before release.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development and testing guide.

```bash
npm install
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in storybook-static/
```

Astro components have no browser runtime, and their scoped CSS is emitted by
Astro's build rather than inlined into the rendered markup, so a `.astro` file
cannot render inside a story on its own. The Vite plugin in
`.storybook/astro-stories.ts` bridges that: it runs Astro's own pipeline in Node,
renders each variant with the Container API, pulls the matching scoped CSS out of
Astro's virtual style module, and hands both to the story. What you see in
Storybook is the real compiled markup with its real styles.

The consequence is that Astro stories are driven by a fixed list of variants
rather than live Storybook controls. To add one, edit the component's variants
file:

```ts
// stories/Footer.variants.ts
const variants: Record<string, Variant> = {
  Default: {},
  Minimal: { props: { socials: [], tagline: "" } },
  CustomLogo: { slots: { logo: '<a href="/">ACME</a>' } },
};
```

Then export a story for it in `stories/Footer.stories.ts`. Plain JavaScript
builders like `createButton` have no such constraint and use normal Storybook
controls.

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

Components carry their own scoped CSS and CSS custom properties rather than Tailwind
utility classes in the markup. Only one of the two consuming apps loads Tailwind, so a
utility baked into shipped markup is dead text in the other. Custom properties work in
both, and a Tailwind app can still restyle via the token table above.
