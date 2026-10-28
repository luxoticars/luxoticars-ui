---
"@luxoticars/ui": minor
---

Breaking (Marko): `<program-badge>` is now `<lx-program-badge>`, its block class is `lx-program-badge` and it ships its own `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/program-badge` becomes `marko/lx-program-badge`. The Astro `ProgramBadge` is unchanged.
