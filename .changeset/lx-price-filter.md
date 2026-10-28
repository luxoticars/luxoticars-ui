---
"@luxoticars/ui": minor
---

Breaking (Marko): `<price-filter>` is now `<lx-price-filter>` and `<price-distribution-graph>` is now `<lx-price-distribution-graph>`. Their block classes follow the tag names and each ships its own `style.css`, so they need `styles/tokens.css` and no longer read Tailwind/daisyUI colour names or fallbacks. `marko/price-filter` and `marko/price-distribution-graph` become `marko/lx-price-filter` and `marko/lx-price-distribution-graph`.
