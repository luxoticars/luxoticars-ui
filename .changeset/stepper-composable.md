---
"@luxoticars/ui": minor
---

`ProgressStepper` can now be composed. Each step has a slot for its own markup, named `content-<id>` (give the step an `id`) or `content-<index>` when it has none; the content sits under the step's label and description, in both orientations. New `labelPlacement="inline"` (horizontal) puts each step's text beside its marker, with the line running on after it, instead of under it. The Skin gains `.progress-stepper__body` and `.progress-stepper--labels-inline`. `.progress-stepper__content` is now a `<div>` rather than a `<span>` so it can hold block content; it is already `display: flex`, so nothing moves.
