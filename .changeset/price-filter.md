---
"@luxoticars/ui": minor
---

Add the price filter as four Marko 6 tags: `<price-filter>`, which composes `<selection-group>` (preset ranges), `<text-range>` (min and max fields) and `<price-distribution-graph>` (a histogram with two knobs) around one shared range. Each part also works on its own. The decisions live in `utils/price-range`, which the tags share.
