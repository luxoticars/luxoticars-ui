---
"@luxoticars/ui": minor
---

Breaking (Marko): `<selection-group>` is now `<lx-selection-group>`, its block class is `lx-selection-group` and its stylesheet moves beside the tag as `style.css`, so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names or fallbacks. `marko/selection-group` becomes `marko/lx-selection-group`.
