---
"@luxoticars/ui": minor
---

Add `controlsPlacement` to `ScrollingItemCards` and `<lx-scrolling-item-cards>`. The default, `sides`, is unchanged. `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center` and `bottom-end` put Previous / Next together in a row above or below the track, so a thumb or a mouse has less far to travel and the buttons never cover a card. It is CSS only: the script is unchanged, the stylesheet grows by 73 B gzip, and an instance adds at most one wrapper `div` (50 B for `bottom-end`). The cost table is in the component's Storybook docs.
