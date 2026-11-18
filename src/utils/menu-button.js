/*
  The one place a menu button's options are validated and turned into markup
  facts: ids, roles, ARIA states, classes, and the text screen readers hear for
  a badge or a prefix. `astro/ui/MenuButton.astro` and
  `marko/lx-menu-button` print exactly what this returns, so the two
  renderers agree by construction.

  Also holds the pure keyboard rules (`navigate`, `extendQuery`, `typeahead`), which the
  Astro script (`scripts/menu-button.js`) and the Marko tag both call, so a
  key does the same thing in both.

  Internal: not in package.json#exports.
*/
/* clsx, not cn(): this module also runs in the browser (the Marko tag resolves on the client),
   and cn() would add tailwind-merge, about 8.5 kB gzip, to fold away Tailwind conflicts that
   a BEM component has none of. */
import { clsx } from "clsx";

/** Matches every menu item, whatever its role. */
export const ENTRY = '[role^="menuitem"]';

const TYPES = ["checkbox", "radio"];
const ALIGNS = ["start", "end"];

const fail = (message) => {
  throw new Error(`MenuButton: ${message}`);
};

/* `false` means "not set", so `badge={cond && 3}` works in Astro and Marko. */
const isUnset = (value) => value == null || value === false;
const text = (value) => String(value).trim();

/* The ARIA role of an item. A plain menu holds actions; a `checkbox` menu holds
   independent choices; a `radio` menu holds one choice of several. */
const ROLES = { undefined: "menuitem", checkbox: "menuitemcheckbox", radio: "menuitemradio" };

let counter = 0;

/**
 * `block` is the BEM block the classes are built on. The Astro renderer uses
 * the default; the Marko tag passes its own (`lx-menu-button`), which has its own
 * stylesheet.
 */
export function resolveMenuButton({ label, items, type, name, align, id, className, busy, busyLabel, block = "menu-button" } = {}) {
  const buttonText = isUnset(label) ? "" : text(label);
  if (!buttonText) fail("`label` is required: it is the button's visible text and its accessible name.");

  const kind = isUnset(type) ? undefined : type;
  if (kind !== undefined && !TYPES.includes(kind)) fail(`unknown type "${type}". Use one of: ${TYPES.join(", ")}, or leave it unset.`);

  const side = isUnset(align) ? "start" : align;
  if (!ALIGNS.includes(side)) fail(`unknown align "${align}". Use one of: ${ALIGNS.join(", ")}.`);

  if (!Array.isArray(items) || items.length === 0) fail("`items` needs at least one item.");

  /* Waiting: the button says so with `aria-busy`, draws a spinner where its chevron was, and a status
     region says `busyLabel` aloud, since aria-busy on a button is not announced by itself. */
  const waiting = Boolean(busy);
  const status = isUnset(busyLabel) || text(busyLabel) === "" ? "Loading" : text(busyLabel);

  const inputName = isUnset(name) ? "" : text(name);
  if (inputName && !kind) fail("`name` only applies to a `checkbox` or `radio` menu: a plain menu holds actions, not values.");

  const base = isUnset(id) || text(id) === "" ? `menu-button-${(counter += 1)}` : text(id);
  if (/\s/.test(base)) fail("`id` must not contain whitespace.");

  const seen = new Set();
  let checkedCount = 0;
  let exclusiveCount = 0;
  let exclusiveChecked = false;

  const resolved = items.map((item, index) => {
    if (item == null || typeof item !== "object") fail(`item ${index} must be an object.`);
    const itemLabel = isUnset(item.label) ? "" : text(item.label);
    if (!itemLabel) fail(`item ${index} needs a non-empty \`label\`.`);

    const value = isUnset(item.value) ? undefined : String(item.value);
    if (kind) {
      if (value === undefined || value === "") fail(`item "${itemLabel}" needs a \`value\`: a ${kind} item reports it when chosen.`);
      if (seen.has(value)) fail(`two items share the value "${value}".`);
      seen.add(value);
    }

    const href = isUnset(item.href) || item.href === "" ? undefined : String(item.href);
    if (href && kind) fail(`item "${itemLabel}" has an \`href\`, but a ${kind} item toggles a value; it cannot also be a link.`);

    const exclusive = Boolean(item.exclusive);
    if (exclusive && kind !== "checkbox") fail(`item "${itemLabel}" is \`exclusive\`, which only applies to a \`checkbox\` menu.`);
    if (exclusive) exclusiveCount += 1;

    const checked = kind ? Boolean(item.checked) : false;
    if (item.checked && !kind) fail(`item "${itemLabel}" is \`checked\`, but the menu has no \`type\`. Set type="checkbox" or type="radio".`);
    if (checked) checkedCount += 1;
    if (checked && exclusive) exclusiveChecked = true;

    const badgeText = isUnset(item.badge) ? "" : text(item.badge);
    const prefixText = isUnset(item.prefix) ? "" : text(item.prefix);
    const prefixLabel = isUnset(item.prefixLabel) ? "" : text(item.prefixLabel);

    return {
      key: value ?? `${index}`,
      id: `${base}-item-${index}`,
      role: ROLES[kind],
      /* ARIA states are enumerated strings, and Marko writes a boolean `true` as an empty value. */
      checked: kind ? (checked ? "true" : "false") : undefined,
      disabled: item.disabled ? "true" : undefined,
      value,
      exclusive,
      label: itemLabel,
      href: item.disabled ? undefined : href,
      isLink: Boolean(href),
      prefix: prefixText ? { text: prefixText, label: prefixLabel || undefined } : null,
      /* A bare number tells a screen reader little ("item 2 99"), so `badgeLabel` is
         what is heard when given, e.g. "99 new messages". The badge itself is
         hidden from assistive tech either way, so it is read once, not twice. */
      badge: badgeText ? { text: badgeText, label: (isUnset(item.badgeLabel) ? "" : text(item.badgeLabel)) || badgeText } : null,
    };
  });

  if (exclusiveCount > 1) fail("only one item can be `exclusive`.");
  if (exclusiveChecked && checkedCount > 1) fail("an `exclusive` item cannot be checked together with other items.");
  if (kind === "radio" && checkedCount > 1) fail("a radio menu can have only one checked item.");

  return {
    className: clsx(block, side === "end" && `${block}--end`, className),
    id: base,
    buttonId: `${base}-button`,
    menuId: `${base}-menu`,
    label: buttonText,
    type: kind,
    name: inputName || undefined,
    /* `aria-busy` on the button, as the string ARIA expects, and the text of the status region ("" when not waiting). */
    busy: waiting ? "true" : undefined,
    status: waiting ? status : "",
    items: resolved,
  };
}

/* ---- checked state ----------------------------------------------------- */

/**
 * What is checked after the user chooses `value`. `items` are `{ value, exclusive }` and `checked` the
 * values checked now. A radio menu checks just the chosen one. In a checkbox menu the chosen item
 * toggles, with one rule for an `exclusive` item (the "Any" of a filter): choosing it unchecks every other
 * item and it cannot be unchecked directly; choosing any other item unchecks it; and unchecking the last
 * other item brings it back, so a filter is never left with nothing. Pure, so the Astro script and the
 * Marko tag apply the same rule.
 */
export function toggleChecked(type, items, checked, value) {
  if (type === "radio") return [value];
  const exclusive = items.find((item) => item.exclusive)?.value;
  if (value === exclusive) return [value];
  const next = checked.includes(value) ? checked.filter((v) => v !== value) : [...checked.filter((v) => v !== exclusive), value];
  return next.length === 0 && exclusive !== undefined ? [exclusive] : next;
}

/* ---- keyboard rules ---------------------------------------------------- */

/**
 * Where focus goes on a navigation key, skipping disabled items. `enabled` is
 * one boolean per item and `current` the focused index (-1 for none). ArrowDown
 * and ArrowUp wrap, as the ARIA Authoring Practices menu does. Returns `-1`
 * when nothing can take focus, and `undefined` for a key that is not navigation.
 */
export function navigate(key, current, enabled) {
  const count = enabled.length;
  const ok = (i) => enabled[i];
  const scan = (from, step) => {
    for (let n = 1; n <= count; n += 1) {
      const i = (((from + step * n) % count) + count) % count;
      if (ok(i)) return i;
    }
    return -1;
  };
  switch (key) {
    case "ArrowDown":
      return scan(current, 1);
    case "ArrowUp":
      return scan(current < 0 ? 0 : current, -1);
    case "Home":
      return scan(-1, 1);
    case "End":
      return scan(0, -1);
    default:
      return undefined;
  }
}

/**
 * Adds a typed character to a type-ahead query. Characters typed within
 * `timeout` ms of each other build one query; later ones start a new one. Pure,
 * so a Marko tag can keep the state in a `<let>` (which must be serialisable)
 * and a test can pass the clock. Start from `{ query: "", at: 0 }`.
 */
export function extendQuery(state, char, now, timeout = 500) {
  const fresh = now - state.at > timeout;
  return { query: (fresh ? "" : state.query) + char.toLowerCase(), at: now };
}

/** Is this key press a character that starts or extends a type-ahead query? */
export const isTypeaheadKey = (event) =>
  event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey;

/**
 * The index of the next enabled item whose label starts with `query`, searching
 * from after `current` and wrapping. Typing one letter repeatedly cycles through
 * the items that start with it. Returns -1 for no match.
 */
export function typeahead(query, current, labels, enabled) {
  const count = labels.length;
  const same = query.length > 1 && [...query].every((c) => c === query[0]);
  const needle = same ? query[0] : query;
  /* From the current item when more than one character is typed, so extending the
     query keeps the item you are already on; from the next one when it is a single
     letter (or the same letter repeated), so it moves on. */
  const start = query.length > 1 && !same ? current : current + 1;
  for (let n = 0; n < count; n += 1) {
    const i = (((start + n) % count) + count) % count;
    if (enabled[i] && labels[i].toLowerCase().startsWith(needle)) return i;
  }
  return -1;
}
