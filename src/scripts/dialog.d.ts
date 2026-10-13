/**
 * Installs the runtime fallbacks every `.dialog` relies on. Call it once per
 * page; further calls are no-ops, and it does nothing outside a browser.
 *
 * - Clears `dialog.returnValue` when a dialog opens or is cancelled, so a
 *   dismissal never reports the previous choice.
 * - Where the browser lacks `closedby` (Safari): closes `closedby="any"`
 *   dialogs on a backdrop click, and keeps Escape from closing
 *   `closedby="none"` ones.
 *
 * `astro/ui/Dialog` installs these itself. Call this only with the HTML API:
 *
 * ```js
 * import { installDialogFallbacks } from "@luxoticars/ui/scripts/dialog";
 * installDialogFallbacks();
 * ```
 */
export declare function installDialogFallbacks(doc?: Document): void;
