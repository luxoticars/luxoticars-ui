/*
  The one place a dialog's options are validated and turned into markup
  facts — classes, ids, role, `closedby`. `astro/ui/Dialog.astro` and
  `html/dialog.js` both call it, so the two APIs agree by construction rather
  than by being kept in step by hand. Internal: not in package.json#exports.
*/

const VARIANTS = ["lightbox", "confirm", "panel"];
const SIZES = ["narrow", "default", "wide", "large", "fullscreen"];
const SIDES = ["start", "end"];
const DISMISS = ["any", "closerequest", "none"];

/** Lucide "x". Decorative: the button carries the accessible name. */
export const DIALOG_CLOSE_ICON =
  '<svg class="dialog__close-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

export function resolveDialogOptions({
  id,
  variant = "lightbox",
  size = "default",
  side = "start",
  dismiss,
  closeLabel = "Close",
  hasTitle,
  hasDescription,
  hasFooter,
}) {
  const named = typeof id === "string" && id.trim() !== "";
  const fail = (message) => {
    throw new Error(`Dialog${named ? ` "${id}"` : ""}: ${message}`);
  };

  if (!named) fail("an `id` is required — triggers target it, and the title and description ids derive from it.");
  /* An id with whitespace cannot be referenced by aria-labelledby or
     commandfor, both of which take space-separated id lists or single ids. */
  if (/\s/.test(id)) fail("the `id` cannot contain whitespace.");
  if (!VARIANTS.includes(variant)) fail(`unknown variant "${variant}". Use one of: ${VARIANTS.join(", ")}.`);
  if (!SIZES.includes(size)) fail(`unknown size "${size}". Use one of: ${SIZES.join(", ")}.`);
  if (!SIDES.includes(side)) fail(`unknown side "${side}". Use one of: ${SIDES.join(", ")}.`);
  if (size !== "default" && variant !== "lightbox") fail("`size` applies to the lightbox variant only.");
  if (side !== "start" && variant !== "panel") fail("`side` applies to the panel variant only.");

  const closedby = dismiss ?? (variant === "confirm" ? "closerequest" : "any");
  if (!DISMISS.includes(closedby)) fail(`unknown dismiss "${closedby}". Use one of: ${DISMISS.join(", ")}.`);
  if (variant === "confirm" && closedby === "any") {
    fail('a confirm cannot be dismissed by a backdrop click — use dismiss "closerequest" (the default) or "none".');
  }

  if (!hasTitle) fail("a title is required — it is the dialog's accessible name (the `title` slot, or the `title` option).");
  if (variant === "confirm" && !hasDescription) {
    fail("a confirm needs a description — it is what the alertdialog announces (the `description` slot, or the `description` option).");
  }
  /* A confirm has no ✕ and ignores the backdrop, so without footer buttons a
     touch user (no Escape key) — or anyone, with dismiss "none" — is trapped. */
  if (variant === "confirm" && !hasFooter) {
    fail("a confirm needs a footer — its buttons are the only way out (no ✕, no backdrop dismiss).");
  }
  if (variant !== "confirm" && (typeof closeLabel !== "string" || closeLabel.trim() === "")) {
    fail("`closeLabel` cannot be empty — it is the ✕ button's accessible name.");
  }

  return {
    classes: [
      "dialog",
      `dialog--${variant}`,
      variant === "lightbox" && size !== "default" && `dialog--${size}`,
      variant === "panel" && side === "end" && "dialog--end",
    ]
      .filter(Boolean)
      .join(" "),
    role: variant === "confirm" ? "alertdialog" : undefined,
    closedby,
    titleId: `${id}-title`,
    descriptionId: hasDescription ? `${id}-desc` : undefined,
    showClose: variant !== "confirm",
  };
}
