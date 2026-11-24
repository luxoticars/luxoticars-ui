/*
  A stylesheet, not a component: the story writes the markup a consumer would
  and loads `@luxoticars/ui/styles/skin/progress-stepper.css`. The markup is
  built from the same resolver `ProgressStepper.astro` prints, so the two agree.
*/
import "../../src/styles/skin/progress-stepper.css";
import { resolveProgressStepper } from "../../src/utils/progress-stepper.js";
import { cases, contentSlots, type ProgressStepperCase } from "../progress-stepper-cases";

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The markup a consumer writes; `render` and Show code both use it, so they cannot drift. */
const stepperMarkup = ({ dir, style, content, ...options }: ProgressStepperCase) => {
  const stepper = resolveProgressStepper(options);
  const bodies = contentSlots(content);
  const items = stepper.items
    .map((item) => {
      const marker = item.icon
        ? `<svg class="progress-stepper__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="${item.icon}"/></svg>`
        : item.number;
      const description = item.description ? `\n      <span class="progress-stepper__description">${escape(item.description)}</span>` : "";
      const body = bodies[item.contentSlot] ? `\n      <div class="progress-stepper__body">${bodies[item.contentSlot]}</div>` : "";
      return `  <li class="${item.className}"${item.ariaCurrent ? ` aria-current="step"` : ""}>
    <span class="progress-stepper__marker" aria-hidden="true">${marker}</span>
    <div class="progress-stepper__content">
      <span class="progress-stepper__label">${escape(item.label)}</span>
      <span class="progress-stepper__status">${escape(item.status)}</span>${description}${body}
    </div>
  </li>`;
    })
    .join("\n");
  const attrs = `${dir ? ` dir="${dir}"` : ""}${style ? ` style="${style}"` : ""}`;
  return `<nav class="${stepper.className}" aria-label="${escape(stepper.label)}"${attrs}>
<ol class="progress-stepper__list"${stepper.busy ? ` aria-busy="true"` : ""}>
${items}
</ol>
</nav>`;
};

const stepperSource = (kase: ProgressStepperCase) =>
  `<!-- once, in your app entry or layout:
     import "@luxoticars/ui/styles/skin/progress-stepper.css"; -->
${stepperMarkup(kase)}`;

const story = (kase: ProgressStepperCase) => ({
  args: { ...kase },
  render: (args: ProgressStepperCase) => {
    const host = document.createElement("div");
    host.style.padding = "1.5rem";
    host.innerHTML = stepperMarkup(args);
    return host;
  },
  parameters: { docs: { source: { language: "html", code: stepperSource(kase) } } },
});

/**
 * `progress-stepper` shows how far someone is through a task. Put the classes on
 * a `<nav>` with an `aria-label`, holding an `<ol>`; mark the step they are on
 * with `aria-current="step"`, and keep the visually hidden `__status` text:
 * it is how a screen reader hears each state. The marker is `aria-hidden`.
 *
 * Put anything you like in a `<div class="progress-stepper__body">` after the
 * description to compose a step's own content. `--labels-inline` on a
 * `--horizontal` stepper puts each step's text beside its marker.
 *
 * `--horizontal` is a row only where its own container is 40rem or wider, and
 * stacks below that. `dir="rtl"` on the `<nav>` or an ancestor mirrors it.
 */
export default {
  title: "Skin/progress-stepper",
  tags: ["autodocs"],
};

export const Horizontal = story(cases.Horizontal);
export const Vertical = story(cases.Vertical);
export const VerticalUpcoming = story(cases.VerticalUpcoming);
export const Rtl = story(cases.Rtl);
export const VerticalRtl = story(cases.VerticalRtl);
export const ErrorState = story(cases.Error);
export const LoadingState = story(cases.Loading);
export const Complete = story(cases.Complete);
export const SmallViewport = story(cases.SmallViewport);
export const HorizontalInline = story(cases.HorizontalInline);
export const VerticalContent = story(cases.VerticalContent);
export const HorizontalInlineContent = story(cases.HorizontalInlineContent);
