---
"@luxoticars/ui": minor
---

Add `<site-header>` and `<logo>`, the Marko twins of the Astro `SiteHeader` and `Logo`: same markup and styles, with the header's search field passed as `@search`. Both now take their links, new-tab attributes and button label from `resolveSiteHeader()`, and wire the phone menu with `wireSiteMenu()`, so they cannot drift. The Astro header's output is unchanged.
