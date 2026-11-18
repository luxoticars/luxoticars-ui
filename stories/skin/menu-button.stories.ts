/*
  A stylesheet, not a component: the story writes the markup a consumer would and loads
  `@luxoticars/ui/styles/skin/menu-button.css` (canonical). The CSS draws the button and the menu;
  it does not open anything. `@luxoticars/ui/scripts/menu-button` does that for this exact markup,
  and the play functions below run it, so the markup shown here is known to work with it.
*/
import "../../src/styles/skin/menu-button.css";
import { initMenuButton, setMenuButtonBusy } from "../../src/scripts/menu-button.js";
import { checkBusyState, checkChevron, checkExclusive, checkNavigation, checkRadios, checkSemantics, checkCheckboxes, checkBadges, parts } from "../menu-button-play";

const CHEVRON = `<svg class="menu-button__chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3.5 6.5 8 11l4.5-4.5"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24" fill="currentColor" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;

interface Item {
  value?: string;
  label: string;
  checked?: boolean;
  exclusive?: boolean;
  badge?: string;
  badgeLabel?: string;
  prefix?: string;
  prefixLabel?: string;
}

/**
 * The markup a consumer writes; `render` and Show code both use it, so they cannot drift. `open` is
 * only for showing the menu in Storybook: shipped, the menu is `hidden` and `aria-expanded` is "false".
 */
const menuMarkup = (id: string, label: string, type: "checkbox" | "radio" | undefined, items: Item[], open: boolean, busy = false) => {
  const role = type === "checkbox" ? "menuitemcheckbox" : type === "radio" ? "menuitemradio" : "menuitem";
  const rows = items
    .map((item) => {
      const control = type ? `\n      <span class="menu-button__control" aria-hidden="true">${type === "checkbox" ? CHECK : ""}</span>` : "";
      const prefix = item.prefix ? `\n      <span class="menu-button__prefix" aria-hidden="true">${item.prefix}</span>` : "";
      const prefixSr = item.prefixLabel ? `\n      <span class="menu-button__sr">${item.prefixLabel}</span>` : "";
      const badge = item.badge
        ? `\n      <span class="menu-button__badge" aria-hidden="true">${item.badge}</span>\n      <span class="menu-button__sr">${item.badgeLabel ?? item.badge}</span>`
        : "";
      const attrs = [
        `class="menu-button__item"`,
        `role="${role}"`,
        `tabindex="-1"`,
        type ? `aria-checked="${item.checked ? "true" : "false"}"` : "",
        item.value ? `data-value="${item.value}"` : "",
        `data-label="${item.label}"`,
        item.exclusive ? "data-exclusive" : "",
      ].filter(Boolean);
      return `    <div ${attrs.join(" ")}>${control}${prefix}${prefixSr}
      <span class="menu-button__text">${item.label}</span>${badge}
    </div>`;
    })
    .join("\n");
  return `<div class="menu-button">
  <button type="button" class="menu-button__button" id="${id}-button" aria-haspopup="menu" aria-expanded="${open}" aria-controls="${id}-menu"${busy ? ' aria-busy="true"' : ""}>
    <span class="menu-button__label">${label}</span>
    ${CHEVRON}
    <span class="menu-button__spinner" aria-hidden="true"></span>
  </button>
  <span class="menu-button__sr" role="status">${busy ? "Updating results…" : ""}</span>
  <div class="menu-button__menu" id="${id}-menu" role="menu" aria-labelledby="${id}-button"${open ? "" : " hidden"}>
${rows}
  </div>
</div>`;
};

const condition: Item[] = [
  { value: "any", label: "Any Condition", checked: true, exclusive: true },
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "recon", label: "Recon" },
];
const badged: Item[] = [
  { label: "item 1 that has very long text", badge: "1", badgeLabel: "1 new message" },
  { label: "item 2", badge: "99", badgeLabel: "99 new messages" },
  { label: "item 3", badge: "10", badgeLabel: "10 new messages" },
];
const sort: Item[] = [
  { value: "best", label: "Best match", checked: true },
  { value: "price-asc", label: "Price: lowest first" },
  { value: "price-desc", label: "Price: highest first" },
];
const budget: Item[] = [
  { value: "under-100", label: "Under 100,000", prefix: "RM", prefixLabel: "Ringgit" },
  { value: "100-300", label: "100,000 to 300,000", prefix: "RM", prefixLabel: "Ringgit", checked: true },
  { value: "over-300", label: "Over 300,000", prefix: "RM", prefixLabel: "Ringgit" },
];

/** Show code: the shipped markup (closed), after the two lines that load the styles and the behaviour. */
const source = (markup: string) =>
  `<!-- once, in your app entry or layout:
     import "@luxoticars/ui/styles/skin/menu-button.css";
     import { initMenuButtons } from "@luxoticars/ui/scripts/menu-button";
     initMenuButtons(); -->
${markup}`;

const hostFor = (markup: string) => {
  const host = document.createElement("div");
  // Room for the open menu, which hangs below the button.
  host.style.cssText = "padding:1rem 1rem 16rem";
  host.innerHTML = markup;
  return host;
};

type Ctx = { canvasElement: HTMLElement };
const BLOCK = "menu-button";

const waiting: Item[] = [
  { value: "any", label: "Any Condition", exclusive: true },
  { value: "new", label: "New" },
  { value: "used", label: "Used", checked: true },
];

/** Wires the story's own menu, then closes it (it is drawn open) so the checks start from a shipped state. */
const wire = async (canvasElement: HTMLElement) => {
  const { root, button } = parts(canvasElement, BLOCK);
  initMenuButton(root);
  button.click();
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
};

/**
 * `menu-button` styles a button that opens a menu. It is a stylesheet only: it draws the button, the
 * menu, the mark of a checkbox or radio item, a badge and a prefix. State is read from ARIA, so the
 * markup below is the whole contract. `@luxoticars/ui/scripts/menu-button` opens and closes it,
 * moves focus with the arrow keys, Home, End and typing, and toggles checked items, for exactly this
 * markup: call `initMenuButtons()` once.
 *
 * You must provide: unique ids that `aria-controls` and `aria-labelledby` point at; the `hidden`
 * attribute on the menu, and `aria-expanded="false"` on the button; the spinner `span` in the button and the
 * `role="status"` `span` after it (both empty and idle until the button waits); `tabindex="-1"` on every item;
 * `aria-checked` on checkbox and radio items; and `data-value` and `data-label` on items, which the
 * script reports. Mark the one "Any" item of a checkbox filter with `data-exclusive`.
 *
 * The menu is positioned under the button, so an ancestor with `overflow: hidden` would clip it.
 * Add `menu-button--end` to the outer `div` to line the menu up with the button's end edge.
 */
export default {
  title: "Skin/menu-button",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { story: { height: "420px" } } },
};

/** A checkbox filter whose first item, "Any Condition", is exclusive. */
export const Condition = {
  render: () => hostFor(menuMarkup("condition", "Condition", "checkbox", condition, true)),
  play: async ({ canvasElement }: Ctx) => {
    await wire(canvasElement);
    await checkSemantics(canvasElement, BLOCK);
    await checkChevron(canvasElement, BLOCK);
    await checkNavigation(canvasElement, BLOCK);
    await checkCheckboxes(canvasElement, BLOCK);
    await checkExclusive(canvasElement, BLOCK);
  },
  parameters: { docs: { source: { language: "html", code: source(menuMarkup("condition", "Condition", "checkbox", condition, false)) } } },
};

/** Plain items, each with a badge. The badge is `aria-hidden`; the `menu-button__sr` text after it is what is read. */
export const Badged = {
  render: () => hostFor(menuMarkup("badged", "Messages", undefined, badged, true)),
  play: async ({ canvasElement }: Ctx) => {
    await wire(canvasElement);
    await checkSemantics(canvasElement, BLOCK);
    await checkBadges(canvasElement, BLOCK);
  },
  parameters: { docs: { source: { language: "html", code: source(menuMarkup("badged", "Messages", undefined, badged, false)) } } },
};

/** Pick one of several. */
export const Radio = {
  render: () => hostFor(menuMarkup("sort", "Sort", "radio", sort, true)),
  play: async ({ canvasElement }: Ctx) => {
    await wire(canvasElement);
    await checkRadios(canvasElement, BLOCK);
  },
  parameters: { docs: { source: { language: "html", code: source(menuMarkup("sort", "Sort", "radio", sort, false)) } } },
};

/** A prefix before the label. It is `aria-hidden`; give it a `menu-button__sr` label if it carries meaning. */
export const Prefix = {
  render: () => hostFor(menuMarkup("budget", "Budget", "radio", budget, true)),
  play: async ({ canvasElement }: Ctx) => {
    await wire(canvasElement);
    await checkRadios(canvasElement, BLOCK);
  },
  parameters: { docs: { source: { language: "html", code: source(menuMarkup("budget", "Budget", "radio", budget, false)) } } },
};

/**
 * Waiting for something the menu started, such as the page a choice loads. `setMenuButtonBusy(root, true,
 * "Updating results…")` puts `aria-busy` on the button, which swaps the chevron for the `menu-button__spinner`,
 * and fills the status region so a screen reader says the label. `setMenuButtonBusy(root, false)` puts it all back.
 * The menu stays usable while it waits. The spinner stops turning for `prefers-reduced-motion`.
 */
export const Busy = {
  render: () => hostFor(menuMarkup("busy", "Condition", "checkbox", waiting, false, true)),
  play: async ({ canvasElement }: Ctx) => {
    const { root } = parts(canvasElement, BLOCK);
    initMenuButton(root);
    await checkBusyState(canvasElement, BLOCK, "Updating results…");
    setMenuButtonBusy(root, false);
    await checkBusyState(canvasElement, BLOCK, null);
    setMenuButtonBusy(root, true, "Updating results…");
    await checkBusyState(canvasElement, BLOCK, "Updating results…");
  },
  parameters: { docs: { source: { language: "html", code: `${source(menuMarkup("busy", "Condition", "checkbox", waiting, false, true))}\n<!-- then, from your script:\n     setMenuButtonBusy(root, true, "Updating results…");  // and false when it is done -->` } } },
};
