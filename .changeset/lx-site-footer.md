---
"@luxoticars/ui": minor
---

Add `<lx-site-footer>` for Marko 6, the twin of the Astro `Footer`. It is adaptive: the app passes the `entry` for the request (`@luxoticars/ui/marko/lx-site-footer/desktop.entry.marko` or `mobile.entry.marko`) and the package does not classify devices. Each entry ships its own `style.css` (forked from `styles/footer.css`, `--lux-*` tokens only, so it needs `styles/tokens.css`). The Marko footer is drawn in the neutral tokens (`--lux-neutral`, like the header), not the Astro footer's grey literals.
