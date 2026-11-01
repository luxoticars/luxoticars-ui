---
"@luxoticars/ui": patch
---

Fix the frosted glass on scroll-up for `SiteHeader` and `<lx-site-header>`: its `@supports` condition used a bare `color-mix()` that browsers always read as false, so the effect never applied.
