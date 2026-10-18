---
"@luxoticars/ui": minor
---

Add `<site-header>`, the Marko twin of the Astro `SiteHeader`: same markup and styles, with the search field passed as `@search`. Both now take their links, new-tab attributes and button label from `resolveSiteHeader()`, and wire the phone menu with `wireSiteMenu()`, so they cannot drift. The Astro header's output is unchanged.
