import type { DialogDismiss } from "../types";

export interface DialogOptionsInput {
  id: unknown;
  variant?: string;
  size?: string;
  side?: string;
  dismiss?: string;
  /** The ✕ button's accessible name; must be non-empty when the ✕ renders. @default "Close" */
  closeLabel?: string;
  /** Whether a non-empty title was supplied (slot or option). */
  hasTitle: boolean;
  /** Whether a non-empty description was supplied (slot or option). */
  hasDescription: boolean;
  /** Whether footer content was supplied (slot or option). Required for a confirm. */
  hasFooter: boolean;
}

export interface ResolvedDialog {
  /** BEM classes for the `<dialog>`, before any caller class is merged in. */
  classes: string;
  /** `alertdialog` for a confirm; `undefined` (the implicit `dialog`) otherwise. */
  role: "alertdialog" | undefined;
  closedby: DialogDismiss;
  titleId: string;
  /** Present only when a description was supplied. */
  descriptionId: string | undefined;
  /** Whether the header renders the ✕ button (never on a confirm). */
  showClose: boolean;
}

/**
 * Validates a dialog's options and derives its markup facts. Throws an
 * `Error` whose message starts `Dialog "<id>": `. Internal — shared by
 * `astro/ui/Dialog.astro` and `html/dialog.js`.
 */
export declare function resolveDialogOptions(input: DialogOptionsInput): ResolvedDialog;

/** The ✕ icon inside the close button. Decorative (`aria-hidden`). */
export declare const DIALOG_CLOSE_ICON: string;
