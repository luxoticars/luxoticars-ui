---
"@luxoticars/ui": patch
---

`<price-filter>` now works as a plain form: without a graph its range starts from the text fields' values, and when it has a form `action` and no `onPriceRangeChange` the browser submits the form itself instead of the filter swallowing the submit. A selected link option in `<selection-group>` now carries `aria-current="true"`, so screen readers announce it as the current choice.
