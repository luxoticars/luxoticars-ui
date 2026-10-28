---
"@luxoticars/ui": minor
---

Breaking (Marko): `<site-header-desktop>` and `<site-header-mobile>` become one adaptive `<lx-site-header>`. The app picks the entry per request and passes it in (`entry=`), importing `@luxoticars/ui/marko/lx-site-header/desktop.entry.marko` or `mobile.entry.marko`; the package does not classify devices. Block classes are `lx-site-header`, each entry ships its own `style.css` (so it needs `styles/tokens.css` and no longer reads Tailwind/daisyUI colour names), and the phone entry has no media queries. The default menu is now Buy, Services, Reviews, About, with the desktop header switching to its menu button below 52rem; the phone entry shows only the first word of the call-to-action at every width.
