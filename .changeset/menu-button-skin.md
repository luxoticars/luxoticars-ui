---
"@luxoticars/ui": minor
---

Make the menu button usable as a Skin (CSS only). The stylesheet moves to `src/styles/skin/menu-button.css` and is exported as `@luxoticars/ui/styles/skin/menu-button.css`; `@luxoticars/ui/styles/menu-button.css` keeps working as an alias. The behaviour script is now exported as `@luxoticars/ui/scripts/menu-button` (`initMenuButtons()`), so a page that writes the markup itself, shown in the new `Skin/menu-button` story, gets the same keyboard and ARIA behaviour as the Astro component.
