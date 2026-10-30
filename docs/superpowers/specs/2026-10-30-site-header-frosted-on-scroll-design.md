# Site header frosted glass on scroll-up

Date: 2026-10-30
Status: approved for planning

## Goal

When the site header is revealed again after hide-on-scroll (scroll direction up), optionally show a frosted-glass background instead of the solid bar. Ship only where the browser supports backdrop blur. Do not use SVG `feTurbulence` / displacement for this effect.

## Non-goals

- Frosted state at the top of the page while `data-scroll-dir` is unset or `down`.
- New scroll JS beyond the existing hide-on-scroll wiring.
- SVG noise / gloss texture filters.
- Changing hide-on-scroll behaviour, thresholds, or default `hideOnScroll`.

## Trigger

Reuse the existing attribute from hide-on-scroll:

- Marko: `.lx-site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"]`
- Astro: `.site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"]`

No extra top-of-page threshold. If `data-scroll-dir="up"` near the top, frosted still applies. At true top after overscroll / clear, direction is cleared today — bar returns to solid.

## Progressive enhancement

Wrap frosted styles in:

```css
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  /* frosted rules */
}
```

Unsupported browsers keep solid `background-color: var(--_bg)`.

Under `prefers-reduced-motion: reduce`, keep solid background (no blur transition). Optional: still allow instantaneous frosted without animating blur if we later want parity; v1 keeps solid for reduce.

## Visual recipe (v1 defaults)

Inside the support query, for the frosted selector:

- `background-color: color-mix(in srgb, var(--_bg) 72%, transparent);`
- `backdrop-filter: blur(12px) saturate(1.2);`
- `-webkit-backdrop-filter: blur(12px) saturate(1.2);`
- Short transition on `background-color` / `backdrop-filter` only when `prefers-reduced-motion: no-preference`

Tune values in Storybook; keep them as CSS custom properties on the header if useful (`--_frosted-bg`, `--_frosted-blur`) without requiring consumers to set them.

## Delivery shape (opt-in CSS)

Mirror hide-on-scroll opt-in:

- Marko: e.g. `src/marko/lx-site-header/frosted-on-scroll.css` — not imported by base entry; consumer imports `@luxoticars/ui/marko/lx-site-header/frosted-on-scroll.css`.
- Astro: e.g. `src/styles/site-header-frosted-on-scroll.css` — same opt-in rule for `.site-header`.
- Stamp Marko fork against Astro source via `scripts/style-forks.mjs` when shared.

Consumers that already import hide-on-scroll may add frosted independently. Frosted without hide-on-scroll wiring does nothing visible (no `data-scroll-dir`).

## Storybook

- Extend desktop scroll demos (Marko + Astro) to import frosted CSS and document that frosted appears on scroll-up after hide.
- Control or note: opt-in file must be imported.

## Testing

- Unit/style: frosted rules live only in opt-in sheets; `@supports` present; reduced-motion keeps solid.
- Manual: Storybook scroll up/down — solid at rest / down; frosted on `data-scroll-dir=up` in supporting browsers; solid fallback when backdrop-filter unsupported (DevTools emulation if available).

## Risks

- `backdrop-filter` + sticky + `translate` hide can be expensive on low-end devices — keep blur modest (12px).
- Opaque children (search row, menu panel) may need the frosted background only on the sticky header surface, not on nested solid panels.
- Safari needs `-webkit-backdrop-filter`.

## Out of scope follow-ups

- SVG frosted noise.
- Separate `data-frosted` JS flag.
