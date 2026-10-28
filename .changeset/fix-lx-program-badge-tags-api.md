---
"@luxoticars/ui": patch
---

Fix `<lx-program-badge>` so it compiles under the Marko tags API. Derived state uses `const/` instead of `$` scriptlets; the rendered badge is unchanged.
