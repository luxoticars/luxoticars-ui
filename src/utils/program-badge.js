/*
  The one place a program badge's options are validated and turned into
  markup facts: its classes, its text, and whether the icon is hidden (the
  text names the badge) or named (it is the badge's only content).
  `astro/ui/ProgramBadge.astro` and `marko/program-badge.marko` print exactly
  what this returns, so the two renderers agree by construction rather than by
  being kept in step by hand.
  Internal: not in package.json#exports.
*/
import { cn } from "./cn.js";
import { PROGRAM_BADGE_ICONS } from "../data/program-badge-icons.js";

const SIZES = [16, 24];
const ICONS = Object.keys(PROGRAM_BADGE_ICONS);

const fail = (message) => {
  throw new Error(`ProgramBadge: ${message}`);
};

export function resolveProgramBadge({ text, icon, size, iconLabel, className } = {}) {
  /* A numeric string counts: an HTML attribute or a Storybook control may send "24". */
  const px = Number(size ?? 16);
  if (!SIZES.includes(px)) fail(`unknown size "${size}". Use one of: ${SIZES.join(", ")}.`);

  const hasIcon = icon != null && icon !== "";
  /* Object.hasOwn, not `in` or a plain lookup: "toString" and "__proto__" are
     keys of every object and must be rejected like any other unknown name. */
  if (hasIcon && !Object.hasOwn(PROGRAM_BADGE_ICONS, icon)) {
    fail(`unknown icon "${icon}". Use one of: ${ICONS.join(", ")}.`);
  }

  /* Whitespace-only text is no text. Counting it would hide the icon next to a
     label nobody can see or hear, leaving the badge with no name at all. */
  const label = text == null ? "" : String(text).trim();
  if (!hasIcon && !label) return null;

  return {
    className: cn("program-badge", px === 24 && "program-badge--24", className),
    text: label || undefined,
    icon: hasIcon ? resolveIcon(PROGRAM_BADGE_ICONS[icon], label, iconLabel) : null,
  };
}

/* `hidden` is the string "true", never a boolean: ARIA attributes are
   enumerated strings, and Marko writes a boolean `true` as an empty value. */
function resolveIcon(artwork, label, iconLabel) {
  if (label) return { paths: artwork.paths, role: undefined, label: undefined, hidden: "true" };

  const name = iconLabel == null ? artwork.label : String(iconLabel).trim();
  if (!name) fail("an icon-only badge needs a non-empty `iconLabel` — it is the badge's only accessible name.");
  return { paths: artwork.paths, role: "img", label: name, hidden: undefined };
}
