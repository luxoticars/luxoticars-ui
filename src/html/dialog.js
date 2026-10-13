import { escapeHtml, joinClasses } from "./utils.js";
import { createButton } from "./button.js";
import { DIALOG_CLOSE_ICON, resolveDialogOptions } from "../utils/dialog.js";

/*
  The HTML twin of `astro/ui/Dialog.astro`. Both emit the same tree, both get
  their classes, ids and role from `utils/dialog.js`, and both are styled by
  `styles/dialog.css` — which a caller of this builder loads itself, along
  with the runtime fallbacks:

      import "@luxoticars/ui/styles/dialog.css";
      import { installDialogFallbacks } from "@luxoticars/ui/scripts/dialog";
      installDialogFallbacks();
*/

const filled = (value) => typeof value === "string" && value.trim() !== "";

export const createDialog = ({
  id,
  variant,
  size,
  side,
  dismiss,
  closeLabel,
  title,
  description,
  body = "",
  footer = "",
  className = "",
} = {}) => {
  const d = resolveDialogOptions({
    id,
    variant,
    size,
    side,
    dismiss,
    closeLabel,
    hasTitle: filled(title),
    hasDescription: filled(description),
    hasContent: filled(body),
    hasFooter: filled(footer),
  });
  const eid = escapeHtml(id);

  const dialogAttributes = [
    `id="${eid}"`,
    `class="${escapeHtml(joinClasses(d.classes, className))}"`,
    d.role && `role="${d.role}"`,
    `aria-labelledby="${escapeHtml(d.titleId)}"`,
    d.descriptionId && `aria-describedby="${escapeHtml(d.descriptionId)}"`,
    `closedby="${d.closedby}"`,
  ]
    .filter(Boolean)
    .join(" ");

  const close = d.parts.close
    ? `<button type="button" class="dialog__close" command="close" commandfor="${eid}" aria-label="${escapeHtml(d.closeLabel)}">${DIALOG_CLOSE_ICON}</button>`
    : "";
  const descriptionHtml = d.descriptionId
    ? `<div id="${escapeHtml(d.descriptionId)}" class="dialog__description">${escapeHtml(description)}</div>`
    : "";
  const bodyHtml = d.parts.body ? `<div class="dialog__body">${descriptionHtml}${body}</div>` : "";
  const footerHtml = d.parts.footer ? `<form method="dialog" class="dialog__footer">${footer}</form>` : "";

  return `<dialog ${dialogAttributes}><div class="dialog__header"><h2 id="${escapeHtml(d.titleId)}" class="dialog__title">${escapeHtml(title)}</h2>${close}</div>${bodyHtml}${footerHtml}</dialog>`;
};

/* Built on createButton so a trigger looks like every other HTML-API button;
   the two invoker attributes are spliced into its opening tag. */
export const createDialogTrigger = ({ for: target, label, className = "" } = {}) => {
  if (typeof target !== "string" || target.trim() === "" || /\s/.test(target)) {
    throw new Error("DialogTrigger: `for` must be the id of the dialog to open, with no whitespace.");
  }
  return createButton({ label, className }).replace(
    "<button ",
    `<button command="show-modal" commandfor="${escapeHtml(target)}" `,
  );
};
