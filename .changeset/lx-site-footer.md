---
"@luxoticars/ui": minor
---

Add `<lx-site-footer>` for Marko 6, the twin of the Astro `Footer`. It is adaptive: the app passes the `entry` for the request (`@luxoticars/ui/marko/lx-site-footer/desktop.entry.marko` or `mobile.entry.marko`) and the package does not classify devices. Each entry ships its own `style.css` (forked from `styles/footer.css`). It keeps the footer's grey literals, each behind its `--footer-*` override, and reads the accent from `--lux-marque-accent`, so it needs `styles/tokens.css`.
