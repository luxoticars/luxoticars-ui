/*
  The one place a progress stepper's options are validated and turned into
  markup facts: which state each step is in, which step is the current one,
  the classes, and the text screen readers hear for each state.
  `astro/ui/ProgressStepper.astro` prints exactly what this returns, and the
  Skin story builds its markup from it, so the markup cannot drift.
  Internal: not in package.json#exports.
*/
import { clsx } from "clsx";

const STATES = ["complete", "current", "upcoming", "loading", "error"];
const ORIENTATIONS = ["horizontal", "vertical"];

/* What a screen reader hears after the step's label. Colour and the marker's
   shape carry the state for sighted people; this carries it for everyone else. */
const DEFAULT_STATUS = {
  complete: "Completed",
  current: "Current step",
  upcoming: "Upcoming",
  loading: "Loading",
  error: "Error",
};

/* Stroked 24px paths, drawn with `stroke="currentColor"` and no fill. */
const ICONS = {
  complete: "M5.5 12.5 10 17l8.5-9.5",
  error: "M12 6.5v7M12 17.5v.01",
};

const fail = (message) => {
  throw new Error(`ProgressStepper: ${message}`);
};

/* `false` means "not set" for every option, so `x={cond && "…"}` works in Astro. */
const isUnset = (value) => value == null || value === false;

/**
 * `block` is the BEM block the classes are built on. The Astro renderer and the
 * Skin use the default.
 */
export function resolveProgressStepper({ steps, current, orientation, label, statusLabels, className, block = "progress-stepper" } = {}) {
  if (!Array.isArray(steps) || steps.length === 0) fail("`steps` needs at least one step.");

  const direction = isUnset(orientation) ? "horizontal" : orientation;
  if (!ORIENTATIONS.includes(direction)) fail(`unknown orientation "${orientation}". Use one of: ${ORIENTATIONS.join(", ")}.`);

  /* `current` counts from 0. `steps.length` is allowed: every step is complete. */
  const at = isUnset(current) ? 0 : Number(current);
  if (!Number.isInteger(at) || at < 0 || at > steps.length) {
    fail(`\`current\` must be a whole number from 0 to ${steps.length} (counting from 0), not "${current}".`);
  }

  const status = { ...DEFAULT_STATUS };
  for (const [state, text] of Object.entries(statusLabels ?? {})) {
    if (!STATES.includes(state)) fail(`unknown status label "${state}". Use: ${STATES.join(", ")}.`);
    if (!isUnset(text) && String(text).trim()) status[state] = String(text).trim();
  }

  const name = isUnset(label) || !String(label).trim() ? "Progress" : String(label).trim();

  let marked = false;
  const items = steps.map((step, index) => {
    const text = isUnset(step?.label) ? "" : String(step.label).trim();
    if (!text) fail(`step ${index + 1} needs a \`label\`.`);

    const given = isUnset(step.state) ? undefined : step.state;
    if (given !== undefined && !STATES.includes(given)) {
      fail(`step ${index + 1} has unknown state "${step.state}". Use one of: ${STATES.join(", ")}.`);
    }
    const state = given ?? (index < at ? "complete" : index === at ? "current" : "upcoming");

    /* aria-current marks one step: the first that still needs the person. */
    const isCurrent = !marked && (state === "current" || state === "loading" || state === "error");
    if (isCurrent) marked = true;

    const description = isUnset(step.description) ? "" : String(step.description).trim();
    return {
      state,
      className: clsx(`${block}__item`, `${block}__item--${state}`),
      number: String(index + 1),
      icon: state === "complete" || state === "error" ? ICONS[state] : undefined,
      ariaCurrent: isCurrent ? "step" : undefined,
      label: text,
      description: description || undefined,
      status: status[state],
    };
  });

  return {
    className: clsx(block, `${block}--${direction}`, className),
    label: name,
    /* True while any step is loading, for `aria-busy` on the list. */
    busy: items.some((item) => item.state === "loading"),
    items,
  };
}
