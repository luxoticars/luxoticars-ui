import ProgressStepper from "../../src/astro/ui/ProgressStepper.astro";
import { cases } from "../progress-stepper-cases";

/*
  Astro components are prerendered to markup by the Storybook framework, so
  the stylesheet is imported by the component itself.
*/

/**
 * The cases come from `stories/progress-stepper-cases.ts`, which the Skin story
 * reads too, so both are shown with the same inputs.
 *
 * Open the Accessibility panel on any of them: they are checked as stories too.
 */
export default {
  title: "Components/ProgressStepper",
  component: ProgressStepper,
  tags: ["autodocs"],
};

/** A row of steps. The current step has a ring, the finished ones a tick. */
export const Horizontal = { args: cases.Horizontal };

/** Stacked, with a line under each step saying what it is. */
export const Vertical = { args: cases.Vertical };

/** Nothing done yet: step one is current and the rest are upcoming, with dashed lines. */
export const VerticalUpcoming = { args: cases.VerticalUpcoming };

/** `dir="rtl"` mirrors the row, and the labels and state words are in Arabic. */
export const Rtl = { args: cases.Rtl };

export const VerticalRtl = { args: cases.VerticalRtl };

/** A step that failed: an exclamation mark, and the reason in its `description`. */
export const ErrorState = { args: cases.Error };

/** A step that is waiting: a turning arc (still under reduced motion), `aria-busy` on the list, and "Loading" for screen readers. */
export const LoadingState = { args: cases.Loading };

/** Every step done: no current step. */
export const Complete = { args: cases.Complete };

/** A 20rem-wide container, as on a phone: the row stacks by itself, with no breakpoint from the page. */
export const SmallViewport = { args: cases.SmallViewport };
