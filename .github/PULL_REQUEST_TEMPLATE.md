<!--  Delete any sections below that are not relevant to this PR -->

## Description

<!--- What are the changes? -->

## Context

<!--- Why did you make these changes, and why in this particular way? -->

## Definition of Done

### Accessibility (WCAG 2.2 AA, see `.github/instructions/a11y.instructions.md`)
- [ ] Every new or changed story passes the a11y check in `npm run test:stories`. No new `a11y: { test: "todo" }` or `"off"`; if one is unavoidable, the story comment says why and a follow-up is linked.
- [ ] Keyboard: reachable with Tab, usable with Enter/Space/Escape/arrows as appropriate, visible focus, no keyboard trap.
- [ ] Name, role and state: interactive elements have an accessible name; state changes (expanded, selected, invalid) are in ARIA attributes, not only styling.
- [ ] Contrast: text is at least 4.5:1 (3:1 for large text and UI) in both light and dark themes, checked by hand for dark since the test run only renders light.
- [ ] Touch targets are at least 24×24 CSS px, content reflows at 320px, and motion respects `prefers-reduced-motion`.
- [ ] If a renderer exists in more than one form (Astro, Marko, HTML), the other forms behave the same.
- [ ] Not applicable: explain why in one line instead of leaving it unticked.

### Quality
- [ ] `npm test` and `npm run test:stories` pass (the `Test` workflow)
- [ ] `astro check` and `mtc` report 0 errors; `npm run build-storybook` succeeds
- [ ] Changeset added (`npx changeset`, or `--empty` for docs and tooling only)
- [ ] Props, slots and examples are documented in the story, not in the README
- [ ] If applicable: follow-up ticket linked for any TODO

## References

<!-- Include links to Github issue, whatsapp screenshot, telegram screenshot etc. if appropriate -->

## Screenshots

<!-- Upload screenshots if appropriate-->
