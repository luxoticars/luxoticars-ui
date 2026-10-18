---
"@luxoticars/ui": minor
---

`<text-range>` can be a real GET form. Give it an `action` and each field submits under its `key`, `hiddenFields` carry the rest of the page's state, and the submit button stays enabled, so the range works before any JavaScript has loaded. With JS and an `onChange` handler the submit is intercepted and reported through `onChange` as before.
