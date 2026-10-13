import type { DialogDismiss, DialogSide, DialogSize } from "../types";

interface DialogBase {
  /** Required. Triggers target it; `<id>-title` and `<id>-desc` derive from it. No whitespace. */
  id: string;
  /** Required. The accessible name, rendered as the `<h2>`. Escaped. */
  title: string;
  /** Rendered first in the body and referenced by `aria-describedby`. Escaped. */
  description?: string;
  /** Body HTML. **Not escaped** — trusted markup supplied by the caller. */
  body?: string;
  /**
   * Footer HTML, placed inside `<form method="dialog">`: a submit button there
   * closes the dialog and its `value` becomes `dialog.returnValue`.
   * **Not escaped** — trusted markup supplied by the caller.
   */
  footer?: string;
  /** Extra classes on the `<dialog>`. Escaped. */
  className?: string;
}

/** Options for {@link createDialog}, discriminated on `variant` like the Astro props. */
export type DialogOptions =
  | (DialogBase & {
      variant?: "lightbox";
      /** @default "default" (616px) */
      size?: DialogSize;
      side?: never;
      /** @default "any" */
      dismiss?: DialogDismiss;
      /** Accessible name of the ✕ button. Escaped. @default "Close" */
      closeLabel?: string;
    })
  | (DialogBase & {
      variant: "panel";
      /** @default "start" */
      side?: DialogSide;
      size?: never;
      /** @default "any" */
      dismiss?: DialogDismiss;
      /** Accessible name of the ✕ button. Escaped. @default "Close" */
      closeLabel?: string;
    })
  | (DialogBase & {
      variant: "confirm";
      /** Required for a confirm: it is what the alertdialog announces. */
      description: string;
      /** Required for a confirm: with no ✕ and no backdrop dismiss, its buttons are the only way out. */
      footer: string;
      /** A confirm is never dismissed by a backdrop click. @default "closerequest" */
      dismiss?: Exclude<DialogDismiss, "any">;
      size?: never;
      side?: never;
      closeLabel?: never;
    });

/** Options for {@link createDialogTrigger}. */
export interface DialogTriggerOptions {
  /** The `id` of the dialog this button opens. */
  for: string;
  /** Visible label. Escaped. */
  label: string;
  /** Extra classes. */
  className?: string;
}

/**
 * Returns a native `<dialog>` as an HTML string — the twin of
 * `astro/ui/Dialog.astro`, with the same markup and the same stylesheet.
 * Throws when the dialog would be inaccessible or the options are invalid.
 *
 * The caller loads the stylesheet and installs the runtime fallbacks once:
 *
 * ```js
 * import "@luxoticars/ui/styles/dialog.css";
 * import { installDialogFallbacks } from "@luxoticars/ui/scripts/dialog";
 * installDialogFallbacks();
 * ```
 */
export declare function createDialog(options: DialogOptions): string;

/**
 * Returns a `<button>` that opens the dialog with the given id, using invoker
 * commands (`command="show-modal"`) — no script. Styled like `createButton`.
 */
export declare function createDialogTrigger(options: DialogTriggerOptions): string;
