import { escapeHtml, joinClasses } from "./utils.js";

const baseClass =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const createButton = ({
  label,
  type = "button",
  ariaLabel,
  className = "",
  disabled = false
} = {}) => {
  const text = escapeHtml(label ?? "Button");
  const aria = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
  const disabledAttr = disabled ? " disabled" : "";

  return `<button type="${escapeHtml(type)}" class="${joinClasses(baseClass, className)}"${aria}${disabledAttr}>${text}</button>`;
};
