---
"@luxoticars/ui": minor
---

Breaking (Marko): `<text-range>` is now `<lx-text-range>`, its block class is `lx-text-range` and its stylesheet moves beside the tag as `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/text-range` becomes `marko/lx-text-range`.
