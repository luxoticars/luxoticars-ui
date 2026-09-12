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

In CI, a personal access token also works:

```bash
npm install git+https://<TOKEN>@github.com/luxoticars/luxoticars-ui.git
```

## HTML API

```js
import { createButton, createInput, createDialog } from "@luxoticars/ui";

const button = createButton({ label: "Continue" });
const input = createInput({ id: "email", label: "Email" });
const dialog = createDialog({ id: "confirm", title: "Confirm action" });
```

## Astro API

```astro
---
import Button from "@luxoticars/ui/astro/Button.astro";
import Input from "@luxoticars/ui/astro/Input.astro";
import Dialog from "@luxoticars/ui/astro/Dialog.astro";
---

<Input id="email" label="Email" />
<Button>Save</Button>
<Dialog id="confirm" title="Confirm">
  <p>Are you sure?</p>
</Dialog>
```

You can also use extensionless Astro imports:

```astro
import Button from "@luxoticars/ui/astro/Button";
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

## Styling approach

Components carry their own scoped CSS and CSS custom properties rather than Tailwind
utility classes in the markup. Only one of the two consuming apps loads Tailwind, so a
utility baked into shipped markup is dead text in the other. Custom properties work in
both, and a Tailwind app can still restyle via the token table above.
