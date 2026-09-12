import { escapeHtml, joinClasses } from "./utils.js";

const labelClass = "mb-2 block text-sm font-medium text-slate-900";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const createInput = ({
  id = "field",
  name,
  label = "Label",
  type = "text",
  value = "",
  placeholder = "",
  describedBy,
  required = false,
  className = ""
} = {}) => {
  const safeId = escapeHtml(id);
  const safeName = escapeHtml(name || id);
  const classes = joinClasses(inputClass, escapeHtml(className));
  const describedByAttr = describedBy
    ? ` aria-describedby="${escapeHtml(describedBy)}"`
    : "";
  const requiredAttr = required ? " required aria-required=\"true\"" : "";

  return `<label for="${safeId}" class="${labelClass}">${escapeHtml(label)}</label><input id="${safeId}" name="${safeName}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" class="${classes}"${describedByAttr}${requiredAttr} />`;
};
