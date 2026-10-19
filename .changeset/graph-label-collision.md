---
"@luxoticars/ui": patch
---

`<price-distribution-graph>` no longer lets its two value labels run into each other when the knobs sit close together and the prices are long, as with six-digit prices: it pushes them apart. A new `compactLabels` option shortens them (`RM100k` for `RM100000`).
