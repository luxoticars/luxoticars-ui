---
"@luxoticars/ui": minor
---

Add `ProgramBadge`, an icon and/or a short label such as "Top rated seller", and the package's first Marko component.

- Astro: `import ProgramBadge from "@luxoticars/ui/astro/ui/ProgramBadge"`.
- Marko 6: `<program-badge>`, discovered through the package's new `marko.json`, or imported from `@luxoticars/ui/marko/program-badge`.

Marko is an optional peer dependency, so Astro-only apps install nothing new. The published Storybook now includes a Marko Storybook, composed into the same sidebar.
