---
"@luxoticars/ui": patch
---

`<price-distribution-graph>` no longer lets its two value labels run into each other when the knobs sit close together and the prices are long, as with six-digit prices: it pushes them apart. A new `compactLabels` option shortens them (`RM100k` for `RM100000`), and `labels.currencyCaption` (for example "Amounts in RM") shows the currency once under bare-number labels. Each knob's value now includes the currency for screen readers, and the visible labels next to the knobs are hidden from them to avoid reading each value twice.
