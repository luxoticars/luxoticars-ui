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

All components use accessibility-first defaults and Tailwind-friendly class names so they can be customized and extended.
