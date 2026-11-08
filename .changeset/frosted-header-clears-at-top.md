---
"@luxoticars/ui": patch
---

SiteHeader / `<lx-site-header>`: the frosted bar now returns to its solid background when the page scrolls back to the top. The hide-on-scroll script clears `data-scroll-dir` within the bar's own height of the top (instead of setting it to `up`), and does so before the scroll threshold, so a short last step to the top still counts.
