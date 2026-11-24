---
"@luxoticars/ui": minor
---

`Button` (Astro): add a `radius` prop (`field` | `none` | `sm` | `md` | `lg` | `xl` | `2xl` | `full`) so a consumer can set the corner radius per button. `field`, the default, still follows the theme's `--radius-field`. `pill` keeps working as shorthand for `radius="full"` and is deprecated; `radius` wins when both are set.
