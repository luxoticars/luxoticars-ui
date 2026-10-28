---
"@luxoticars/ui": patch
---

Fix `<lx-program-badge>`: it used `$` scriptlets, which the Marko Tags API rejects, so the tag failed to compile. Back to `const/` tag variables, and `npm test` now fails if any Marko tag uses a `$` scriptlet.
