# @luxoticars/ui

Accessible Luxoticars components for HTML, Astro and Tailwind CSS.

## Installation

```bash
npm install @luxoticars/ui
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
