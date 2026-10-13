import { createDialog, createDialogTrigger } from "../src/html/dialog";
import type { DialogOptions } from "../src/html/dialog";
import { installDialogFallbacks } from "../src/scripts/dialog.js";
import { copy, IMAGE_SRC } from "./dialog-content";
/*
  The builder ships markup only, so the story loads the stylesheet and
  installs the runtime fallbacks the way a consumer would.
*/
import "../src/styles/dialog.css";

installDialogFallbacks();

/* Story-only button styling, close to `Button`'s outline and default variants.
   Footer actions in a real page are whatever buttons the app uses. */
const BUTTON = "inline-flex h-9 items-center justify-center rounded-[var(--radius-field)] px-4 text-sm font-medium cursor-pointer";
const action = (label: string, value: string, primary = false, extra = "") =>
  `<button type="submit" value="${value}"${extra} class="${BUTTON} ${
    primary ? "bg-primary text-primary-content" : "border border-base-300 bg-base-100 text-base-content"
  }">${label}</button>`;

type Scenario = keyof typeof copy;
/* Story controls (size, side, dismiss, …) overlaid on a scenario's defaults.
   Loosely typed on purpose: createDialog validates at runtime, and a control
   set to a combination the types forbid shows its error on the canvas. */
type Overrides = Record<string, unknown>;

const scenarios: Record<Scenario, (args: Overrides) => DialogOptions> = {
  lightbox: (args) => ({
    id: "demo-lightbox",
    title: copy.lightbox.title,
    body: `<p>${copy.lightbox.body}</p>`,
    footer: action("Not now", "cancel") + action("Save search", "save", true),
    ...args,
  }) as DialogOptions,
  confirm: (args) => ({
    id: "demo-confirm",
    variant: "confirm",
    title: copy.confirm.title,
    description: copy.confirm.description,
    footer: action("Cancel", "cancel") + action("Delete", "delete", true),
    ...args,
  }) as DialogOptions,
  panel: (args) => ({
    id: "demo-panel",
    variant: "panel",
    title: copy.panel.title,
    body: `<ul>${copy.panel.items.map((i) => `<li>${i}</li>`).join("")}</ul>`,
    footer: action("Show results", "apply", true),
    ...args,
  }) as DialogOptions,
  form: (args) => ({
    id: "demo-form",
    title: copy.form.title,
    description: copy.form.description,
    dismiss: "closerequest",
    body: `<form id="demo-form-fields" method="post" action="/enquiries" style="display:grid;gap:0.75rem">
      <label style="display:grid;gap:0.25rem">Name <input name="name" required autocomplete="name" style="border:1px solid;padding:0.5rem;border-radius:0.25rem"></label>
      <label style="display:grid;gap:0.25rem">Email <input name="email" type="email" required autocomplete="email" style="border:1px solid;padding:0.5rem;border-radius:0.25rem"></label>
    </form>`,
    footer: action("Cancel", "cancel") + action("Send enquiry", "send", true, ' form="demo-form-fields"'),
    ...args,
  }) as DialogOptions,
  image: (args) => ({
    id: "demo-image",
    title: copy.image.title,
    size: "large",
    body: `<img src="${IMAGE_SRC}" alt="${copy.image.alt}" style="display:block;inline-size:100%;block-size:100%;object-fit:contain">`,
    ...args,
  }) as DialogOptions,
  long: (args) => ({
    id: "demo-long",
    title: copy.long.title,
    body: copy.long.paragraphs.map((p) => `<p>${p}</p>`).join(""),
    footer: action("I agree", "accept", true),
    ...args,
  }) as DialogOptions,
};

type StoryArgs = Overrides & { scenario: Scenario };

/**
 * `createDialog` is the HTML twin of the Astro `Dialog`: same options, same
 * markup, same stylesheet. Each story renders a trigger from
 * `createDialogTrigger` next to the dialog, because a closed dialog is
 * invisible — click it to open.
 */
export default {
  title: "HTML/createDialog",
  tags: ["autodocs"],
  render: ({ scenario, ...args }: StoryArgs) => {
    const options = scenarios[scenario](args);
    const host = document.createElement("div");
    host.style.padding = "2rem";
    host.innerHTML = createDialogTrigger({ for: options.id, label: copy[scenario].trigger }) + createDialog(options);
    return host;
  },
  argTypes: {
    scenario: { control: "select", options: Object.keys(scenarios) },
    size: { control: "inline-radio", options: ["narrow", "default", "wide", "large", "fullscreen"] },
    side: { control: "inline-radio", options: ["start", "end"] },
    dismiss: { control: "inline-radio", options: ["any", "closerequest", "none"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Returns a native `<dialog>` as an HTML string. Load " +
          "`@luxoticars/ui/styles/dialog.css` and call `installDialogFallbacks()` " +
          "from `@luxoticars/ui/scripts/dialog` once. `title`, `description` and " +
          "`closeLabel` are escaped; `body` and `footer` are trusted HTML.",
      },
    },
  },
};

export const Lightbox = { args: { scenario: "lightbox" } };
export const Narrow = { args: { scenario: "lightbox", size: "narrow" } };
export const Wide = { args: { scenario: "lightbox", size: "wide" } };
export const Large = { args: { scenario: "lightbox", size: "large" } };
export const Fullscreen = { args: { scenario: "lightbox", size: "fullscreen" } };
/** A forced choice: alertdialog, no ✕, Escape cancels, the backdrop does nothing. */
export const Confirm = { args: { scenario: "confirm" } };
export const Panel = { args: { scenario: "panel" } };
export const PanelEnd = { args: { scenario: "panel", side: "end" } };
/** The body's own form, submitted by a footer button through its `form` attribute. Escape-only dismiss. */
export const Form = { args: { scenario: "form" } };
export const Image = { args: { scenario: "image" } };
export const LongContent = { args: { scenario: "long" } };
/** Neither Escape nor the backdrop closes it; only its own buttons do. */
export const NoDismiss = { args: { scenario: "lightbox", dismiss: "none" } };
/** Caller text is escaped: the title below renders as text, not markup. */
export const EscapesContent = {
  args: { scenario: "lightbox", title: 'Save "this" <script>search</script>?', closeLabel: 'Close "now"' },
};
