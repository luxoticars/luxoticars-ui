import type { ClassValue } from "clsx";
import type { ProgressStepperOrientation, ProgressStepperState, ProgressStepperStep } from "../types";

export interface ProgressStepperOptions {
  /** The steps, in order. At least one; each needs a `label`. */
  steps?: ProgressStepperStep[];
  /** Index of the current step, counting from 0. `steps.length` marks every step complete. `false` counts as not set. @default 0 */
  current?: number | `${number}` | false | null;
  /** `false` counts as not set. @default "horizontal" */
  orientation?: ProgressStepperOrientation | false | null;
  /** The accessible name of the navigation landmark. @default "Progress" */
  label?: string | false | null;
  /** Replaces what screen readers hear for a state, e.g. for another language. */
  statusLabels?: Partial<Record<ProgressStepperState, string>>;
  /** The caller's classes, in any form `clsx()` accepts. */
  className?: ClassValue;
  /** The BEM block the classes are built on. @default "progress-stepper" */
  block?: string;
}

export interface ResolvedProgressStepperItem {
  state: ProgressStepperState;
  /** The item class and its state modifier, e.g. `progress-stepper__item progress-stepper__item--complete`. */
  className: string;
  /** The step's position from 1, as text, for the marker. */
  number: string;
  /** A stroked 24px path for the marker (a tick or an exclamation mark); `undefined` shows the number. */
  icon: string | undefined;
  /** `"step"` on the first step that is current, loading or in error. */
  ariaCurrent: "step" | undefined;
  label: string;
  description: string | undefined;
  /** The hidden text after the label that names the state. */
  status: string;
}

export interface ResolvedProgressStepper {
  /** The block, its orientation modifier, then the caller's classes. */
  className: string;
  label: string;
  /** True while any step is loading; renderers set `aria-busy` on the list. */
  busy: boolean;
  items: ResolvedProgressStepperItem[];
}

/** Validates a progress stepper's options and decides its markup. Throws on a step with no label, an unknown state or orientation, or a `current` outside the steps. */
export declare function resolveProgressStepper(options?: ProgressStepperOptions): ResolvedProgressStepper;
