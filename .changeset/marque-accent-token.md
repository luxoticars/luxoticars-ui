---
"@luxoticars/ui": patch
---

`tokens.css` defines the logo's accent blue as `--lux-marque-accent`, mapped to `--color-marque-accent` in `@theme`. The logo, header and footer read it from there, so an app can change it in one place. The colour itself is unchanged.
