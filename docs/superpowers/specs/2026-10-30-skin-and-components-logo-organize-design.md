# Skin folder + Components/Logo Storybook organize

Date: 2026-10-30
Status: approved for planning

## Goal

1. Put the Astro Logo story under the same Storybook sidebar group as SiteHeader and Footer (`Components/`).
2. Introduce **Skin** as the home for small visual style primitives: move pill there now; more Skin items later.

## Non-goals

- Visual redesign of Logo or pill.
- New Skin components beyond relocating pill.
- Moving layout/component styles into Skin (`tokens.css`, `fonts`, `site-header*`, `footer`, `logo`, `dialog`, `section-head`, `listing-card`, `program-badge`).
- Renaming Marko Logo story title (`Components/logo` stays as-is).
- Moving `src/astro/Logo.astro` (it already sits beside SiteHeader/Footer).

## Current state (v0.15.4)

| Item | Today |
|------|--------|
| Astro Logo story | `stories/Logo.stories.ts`, title `Logo` (top-level) |
| SiteHeader / Footer / SectionHead | titles `Components/…` |
| Pill CSS | `src/styles/pill.css`, export `@luxoticars/ui/styles/pill.css` |
| Pill story | `stories/pill.stories.ts`, title `Styles/pill` |
| Marko Logo | `Components/logo` |

## Decisions

### A. Logo Storybook

- Change Astro title only: `Logo` → `Components/Logo`.
- File path `stories/Logo.stories.ts` may stay (optional move to `stories/` root is fine; no need for a `stories/components/` folder unless implementers prefer consistency with `stories/ui/`).
- Marko title unchanged.

### B. Skin package (style primitives)

Skin is a **folder + Storybook group** for small visual primitives (class-based CSS the consumer applies), not full Astro/Marko components.

**Now (pill):**

- Move `src/styles/pill.css` → `src/styles/skin/pill.css`.
- New export: `@luxoticars/ui/styles/skin/pill.css` → `./src/styles/skin/pill.css`.
- Keep alias: existing `./styles/pill.css` export continues to resolve to the same file (no consumer break).
- Move story to `stories/skin/pill.stories.ts` with title `Skin/pill`.
- Drop `Styles/pill` (no other `Styles/` stories today).
- Update story/test/docs imports that reference the old CSS path.

**Later (out of this change, but directory exists for them):**

- Additional primitives land under `src/styles/skin/` and `stories/skin/` with titles `Skin/<name>`.

### C. Release

- Patch changeset: Storybook organize + Skin folder + dual pill export paths.

## Success criteria

- Storybook sidebar shows `Components/Logo` and `Skin/pill`; no top-level `Logo`; no `Styles/pill`.
- `npm run check:exports` passes with both `@luxoticars/ui/styles/pill.css` and `@luxoticars/ui/styles/skin/pill.css`.
- Existing tests stay green; docs that mention the old pill path either still work via alias or are updated to the Skin path.
- No filesystem move of `Logo.astro`.

## Implementation notes (for the plan)

- Prefer a single branch/PR for Logo title + Skin pill move.
- `scripts/check-exports.mjs` must list the new Skin export; keep the old pill key as an alias to the moved file.
- Prefer documenting the Skin path as the canonical import in the pill story JSDoc; mention the alias for back-compat.
