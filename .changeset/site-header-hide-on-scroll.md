---
"@luxoticars/ui": patch
---

Site header: the sticky bar can now slide out of view while the page scrolls down and come back on scrolling up. It stays while its menu is open or it has focus, and never moves under reduced motion. Chrome 144+ does it in CSS alone (`scroll-state(scrolled)` container queries); other browsers get a small scroll-direction script.

The slide is an opt-in stylesheet, kept out of `styles/site-header.css` and the Marko entries' own CSS so pages that do not want it never download it. Import it once to turn it on:

- Astro `SiteHeader`: `import "@luxoticars/ui/styles/site-header-hide-on-scroll.css";`
- Marko `<lx-site-header>`: `import "@luxoticars/ui/marko/lx-site-header/hide-on-scroll.css"`

The `hideOnScroll` prop is on by default in both, but only marks the bar for that stylesheet; without the import the bar stays at the top as before. Turn it off per header with `hideOnScroll={false}` / `hideOnScroll=false`.
