---
"@luxoticars/ui": patch
---

Site header hide-on-scroll keeps working when a browser understands `scroll-state` but does not hide the bar with `scroll-state(scrolled: bottom)`. The scroll-direction script now always sets `data-scroll-dir`, so scrolling down slides the bar away and scrolling up brings it back. The direction query stays as a progressive enhancement where it really applies.
