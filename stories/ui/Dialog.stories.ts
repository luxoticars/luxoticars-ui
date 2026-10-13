import DialogDemo from "./DialogDemo.astro";
import { installDialogFallbacks } from "../../src/scripts/dialog.js";
/*
  Astro components are prerendered to markup by the Storybook framework, so
  the shared stylesheet reaches the story as a module here, as it does for
  Logo and Footer. The component's own <script> may not run in that
  prerender, so the story installs the fallbacks as well — installation is
  idempotent, and a no-op where there is no document.
*/
import "../../src/styles/dialog.css";

installDialogFallbacks();

/**
 * `Dialog` composed with `DialogTrigger` and `Button`, as an app writes it:
 *
 * ```astro
 * <DialogTrigger for="delete-car" variant="destructive">Delete listing</DialogTrigger>
 * <Dialog id="delete-car" variant="confirm">
 *   <Fragment slot="title">Delete this listing?</Fragment>
 *   <Fragment slot="description">The car and its photos are removed for good.</Fragment>
 *   <Fragment slot="footer">
 *     <Button type="submit" value="cancel" variant="outline">Cancel</Button>
 *     <Button type="submit" value="delete" variant="destructive">Delete</Button>
 *   </Fragment>
 * </Dialog>
 * ```
 *
 * The props table below belongs to this story's demo wrapper. `Dialog`'s own
 * props and slots are documented in its JSDoc (`src/astro/ui/Dialog.astro`).
 */
export default {
  title: "Components/Dialog",
  component: DialogDemo,
  tags: ["autodocs"],
  argTypes: {
    scenario: { control: "select", options: ["lightbox", "confirm", "panel", "form", "image", "long"] },
    size: { control: "inline-radio", options: ["narrow", "default", "wide", "large", "fullscreen"] },
    side: { control: "inline-radio", options: ["start", "end"] },
    dismiss: { control: "inline-radio", options: ["any", "closerequest", "none"] },
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
