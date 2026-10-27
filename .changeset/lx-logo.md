---
"@luxoticars/ui": minor
---

Breaking (Marko): `<logo>` is now `<lx-logo>`, its block class is `lx-logo` and it ships its own `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names. `marko/logo` becomes `marko/lx-logo`. Adds `npm run new:tag`, and `npm test` now fails when a Marko tag's forked CSS falls behind the shared stylesheet it came from.
