---
"@luxoticars/ui": minor
---

Give the menu button a waiting state. `busy` (and `busyLabel`) on `MenuButton` and `<lx-menu-button>`, or `setMenuButtonBusy(root, busy, label)` from `@luxoticars/ui/scripts/menu-button` for the Skin, puts `aria-busy` on the button, swaps its chevron for a spinner, and has a screen reader say the label. The spinner stops for reduced motion.
