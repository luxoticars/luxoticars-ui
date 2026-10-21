---
"@luxoticars/ui": minor
---

Tokens: new `--lux-marque-accent`, the logo's accent blue, mapped to `--color-marque-accent` in `@theme`. The logo, header and footer read it from there, so changing it in `tokens.css` changes all three. An app that sets `--color-marque-accent` itself (luxoticars-homepage does) keeps its own value. The colour itself is unchanged.
