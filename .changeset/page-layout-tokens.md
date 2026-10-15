---
"@luxoticars/ui": minor
---

Tokens: new `--page-max` (80rem) and `--page-gutter` (`clamp(1rem, 4vw, 3rem)`) set the page width and side padding, so a site's own sections can line up with the header and footer. The width includes the padding. Footer: its content now reads them and is `border-box`, so it is 80rem wide with Tailwind's reset or without it (before, a site without the reset got 80rem plus padding). Its side padding grows from 1.5rem/2rem to the new gutter, which is 1rem on small phones and 3rem on wide screens.
