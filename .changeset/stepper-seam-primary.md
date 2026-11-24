---
"@luxoticars/ui": patch
---

The progress stepper's markers are now filled with `--lux-primary` and carry `--lux-primary-content`, as in the Luxoticars design, instead of the darker `--lux-accent`. Complete and current markers (and the loading arc) are filled primary with a ring and rail pulled towards the text colour, which keeps 3:1 or better against the page in both themes. The footer's top seam is now a hairline in the brand primary instead of grey. `ProgressStepper` and `.footer__seam` / `.lx-site-footer__seam` change colour; no markup or props change.

`ProgramBadge` (Astro and `<lx-program-badge>`) now paints every icon with `--lux-primary` when text names the badge, not only the blue tick and the verified tick. An icon-only badge still uses `--lux-accent`, since primary is about 1.95:1 on white and WCAG asks 3:1 for an icon that stands alone.
