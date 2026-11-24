---
"@luxoticars/ui": minor
---

`Button` is now Tailwind-free and has a Marko twin, `<lx-button>`. Both print what one resolver (`utils/button`) decides; the Astro button reads `styles/button.css` (also exported as `@luxoticars/ui/styles/button.css`) and the Marko tag its own forked `style.css`.

- **Radius:** a `radius` prop (`field` | `none` | `sm` | `md` | `lg` | `xl` | `2xl` | `full`). `field`, the default, still follows `--radius-field`. `pill` keeps working as shorthand for `radius="full"` and is deprecated; `radius` wins when both are set.
- **Accessibility:** `aria-expanded` (accordions and disclosures), `aria-haspopup` (menus and modals: `true`, `menu`, `listbox`, `tree`, `grid`, `dialog`) and `aria-controls` are validated and printed as the strings ARIA expects, so `aria-expanded={false}` still says `"false"`. An open button keeps its pressed look.
- **Restyling:** set `--button-radius`, `--button-bg`, `--button-bg-hover`, `--button-fg`, `--button-height`, `--button-padding-inline`, `--button-font-size` or `--button-ring` on a button.
- **Behaviour change:** Tailwind utilities passed as `class` no longer override the button's own styles (they sit in a lower layer than plain CSS). Use the props or the `--button-*` hooks instead.
- **Site header:** the call-to-action in both `SiteHeader` and `<lx-site-header>` is now this button, rendering as before.
