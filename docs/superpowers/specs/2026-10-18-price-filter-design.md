# Price filter: design

## Intent

A price filter for search results: choose a range by picking a preset, typing a
min and max, or dragging two knobs on a price distribution graph, with all three
kept in step. It is reusable and composable, so each part is a tag of its own and
`<price-filter>` only composes them.

## Parts (Marko 6 only, Tags API, concise syntax)

| Tag | Job |
| --- | --- |
| `<selection-group>` | Checkboxes or radios; controlled (`selected` per option, `onSelect`). An absolute http(s) `url` renders the option as a link. |
| `<text-range>` | Min and max fields with a submit button. Keeps drafts until committed; validates; `onBlur` and `onChange`. |
| `<price-distribution-graph>` | Histogram with two knobs that snap to bucket edges and stay one bucket apart; read-only with `showKnobs` off. `onChange` on release. |
| `<price-filter>` | Composes the three around one `{min, max}`; reports `onSelectionChange` and `onPriceRangeChange`. |

`utils/price-range` holds every rule (parsing, validation, boundaries, knob
snapping and restriction, label placement) so the tags only print its answers.

## Decisions

- **Matches the reference component's behaviour and layout**, rewritten for Marko 6 rather than copied. Colours, fonts and spacing come from the luxoticars tokens.
- **No URL knowledge.** `onPriceRangeChange` reports `[{ paramKey, paramValue }, …]` under each field's `key`, defaulting to `price_min` and `price_max`.
- **Selection is tracked by the filter**: a preset is selected until the text range or graph changes the range, then cleared.
- **No effects.** Drafts and knob drags are kept only while the committed values are unchanged, so a value fed back by the parent replaces them without a `<script>`.

## Not in this version

- The reference's custom field and label renderers for the selection group, and per-option icons.
- A no-JS fallback (a plain GET form). The text range and graph need JS.
