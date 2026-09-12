import { escapeHtml, joinClasses } from "./utils.js";

const panelClass =
  "w-full max-w-lg rounded-lg bg-white p-6 shadow-xl focus-visible:outline-none";

export const createDialog = ({
  id = "dialog",
  title = "Dialog title",
  description = "",
  content = "",
  open = false,
  className = ""
} = {}) => {
  const safeId = escapeHtml(id);
  const descriptionId = `${safeId}-description`;
  const descriptionHtml = description
    ? `<p id="${descriptionId}" class="mt-2 text-sm text-slate-600">${escapeHtml(description)}</p>`
    : "";

  return `<dialog id="${safeId}" role="dialog" aria-modal="true" aria-labelledby="${safeId}-title"${description ? ` aria-describedby="${descriptionId}"` : ""}${open ? " open" : ""} class="backdrop:bg-slate-900/40"><div class="${joinClasses(panelClass, className)}"><h2 id="${safeId}-title" class="text-lg font-semibold text-slate-900">${escapeHtml(title)}</h2>${descriptionHtml}<div class="mt-4">${content}</div></div></dialog>`;
};
