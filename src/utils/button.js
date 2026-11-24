/*
  The one place a button's options are validated and turned into markup facts:
  the element, the classes, and every attribute whose value depends on another
  (a disabled link, the default `type`, the ARIA states). `astro/ui/Button.astro`
  and `marko/lx-button` print exactly what this returns, so the two renderers
  agree by construction.

  Internal: not in package.json#exports.
*/
/* clsx, not cn(): this module also runs in the browser (Marko tags resolve on the
   client), and the stylesheet is plain BEM, so there are no Tailwind conflicts to fold. */
import { clsx } from "clsx";

export const BUTTON_VARIANTS = ["default", "destructive", "outline", "secondary", "ghost", "link", "success", "warning", "info"];
export const BUTTON_SIZES = ["xs", "sm", "default", "lg", "xl"];
export const BUTTON_RADII = ["field", "none", "sm", "md", "lg", "xl", "2xl", "full"];
const POPUPS = ["menu", "listbox", "tree", "grid", "dialog"];

const fail = (message) => {
  throw new Error(`Button: ${message}`);
};

/* `false` and `null` mean "not set", so `variant={cond && "outline"}` works in Astro and Marko. */
const isUnset = (value) => value == null || value === false;

const pick = (name, value, allowed, fallback) => {
  if (isUnset(value)) return fallback;
  if (!allowed.includes(value)) fail(`unknown ${name} "${value}". Use one of: ${allowed.join(", ")}.`);
  return value;
};

/* ARIA states are enumerated strings. Astro leaves out an attribute whose value is `false`, and Marko
   writes a bare `true` as an empty value, so every state is printed as the string ARIA expects. */
function resolveExpanded(value) {
  if (value == null) return undefined;
  if (value === true || value === "true") return "true";
  if (value === false || value === "false") return "false";
  return fail(`aria-expanded must be true or false, not "${value}".`);
}

/* `false` is a real answer here: "this button opens nothing", so no attribute at all. */
function resolvePopup(value) {
  if (value == null || value === false || value === "false") return undefined;
  if (value === true || value === "true") return "true";
  if (POPUPS.includes(value)) return value;
  return fail(`unknown aria-haspopup "${value}". Use true, or one of: ${POPUPS.join(", ")}.`);
}

function resolveControls(value) {
  if (isUnset(value)) return undefined;
  const ids = String(value).trim();
  if (!ids) fail("aria-controls needs the id of the element the button controls (several, space-separated).");
  return ids;
}

/**
 * `block` is the BEM block the classes are built on. The Astro renderer uses the
 * default; the Marko tag passes its own (`lx-button`), which has its own stylesheet.
 *
 * `attrs` is everything else the caller passed: `href`, `type`, `disabled`, `role`,
 * `aria-*`, `data-*`. The returned `attrs` is that, with the decisions below applied, and
 * is what to spread on the element. Keys the resolver owns are taken out of the caller's
 * spread rather than written after it: an HTML parser keeps the FIRST of two attributes
 * with the same name, so a value written after the spread would never reach the DOM.
 */
export function resolveButton({ variant, size, radius, pill, iconOnly, className, block = "button", attrs = {} } = {}) {
  const kind = pick("variant", variant, BUTTON_VARIANTS, "default");
  const scale = pick("size", size, BUTTON_SIZES, "default");
  /* An explicit radius wins over the older `pill` shorthand. */
  const corner = pick("radius", radius, BUTTON_RADII, pill ? "full" : "field");

  const {
    href,
    disabled,
    type,
    role,
    tabindex,
    "aria-disabled": ariaDisabled,
    "aria-expanded": expanded,
    "aria-haspopup": popup,
    "aria-controls": controls,
    ...rest
  } = attrs;

  const isLink = href !== undefined && href !== null && href !== false;
  const off = Boolean(disabled) && disabled !== "false";
  /* An `<a>` ignores `disabled`, so a disabled link drops its `href` (it cannot be activated),
     is removed from the tab order and says so with `aria-disabled`, as a `<button disabled>` would. */
  const deadLink = isLink && off;

  const shared = {
    ...rest,
    "aria-expanded": resolveExpanded(expanded),
    "aria-haspopup": resolvePopup(popup),
    "aria-controls": resolveControls(controls),
  };

  return {
    tag: isLink ? "a" : "button",
    className: clsx(
      block,
      `${block}--${kind}`,
      scale !== "default" && `${block}--${scale}`,
      corner !== "field" && `${block}--radius-${corner}`,
      iconOnly && `${block}--icon`,
      className,
    ),
    attrs: isLink
      ? deadLink
        ? { ...shared, role: "link", tabindex: -1, "aria-disabled": "true" }
        : { ...shared, href: String(href), role, tabindex, "aria-disabled": ariaDisabled }
      : /* `type` is defaulted here, not written next to the spread: a plain `type="button"`
           beside it would duplicate a caller's own `type="submit"` and the form never submits. */
        { ...shared, type: type ?? "button", disabled: off || undefined, role, tabindex, "aria-disabled": ariaDisabled },
  };
}
