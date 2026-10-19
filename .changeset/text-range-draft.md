---
"@luxoticars/ui": patch
---

`<text-range>` no longer loses what is being typed in one field when the other field is committed. Typing a minimum, moving to the maximum and typing there used to drop the maximum if the parent updated in between.
