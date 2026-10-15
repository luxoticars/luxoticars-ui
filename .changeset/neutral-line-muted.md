---
"@luxoticars/ui": minor
---

Tokens: new `--lux-neutral-line` (a hairline) and `--lux-neutral-muted` (quieter text) for use on the dark neutral background. SiteHeader reads them for its border and its muted text, after its own `--site-header-line` / `--site-header-muted` overrides; the values are the ones it used before, so it looks the same.
