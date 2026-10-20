---
"@luxoticars/ui": minor
---

Add `<site-header-desktop>`, `<site-header-mobile>` and `<logo>`, the Marko twins of the Astro `SiteHeader` and `Logo`: same styles, with the header's search field passed as `@search`. The app picks the header per request: the phone one keeps the links in its menu only, so it ships less HTML and script. All of them take their links, new-tab attributes and button label from `resolveSiteHeader()`, and wire the menu with `wireSiteMenu()`, so they cannot drift. The Astro header's output is unchanged.
