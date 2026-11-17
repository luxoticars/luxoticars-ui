/*
  The interaction checks both renderers' stories run, so the Astro component and
  the Marko tag are held to the same behaviour. They drive the DOM with real
  events and read the ARIA state back, the way assistive tech would.
*/
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export interface Parts {
  root: HTMLElement;
  button: HTMLButtonElement;
  menu: HTMLElement;
  items: HTMLElement[];
}

export function parts(canvasElement: HTMLElement, block: string): Parts {
  const root = canvasElement.querySelector<HTMLElement>(`.${block}`);
  const button = root?.querySelector<HTMLButtonElement>(`.${block}__button`);
  const menu = root?.querySelector<HTMLElement>(`.${block}__menu`);
  if (!root || !button || !menu) throw new Error(`missing .${block}`);
  return { root, button, menu, items: [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')] };
}

const assert = (ok: unknown, message: string) => {
  if (!ok) throw new Error(message);
};

async function press(key: string) {
  const target = document.activeElement ?? document.body;
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  await frame();
}

/** Names, roles and state: what a screen reader is told before anyone presses a key. */
export async function checkSemantics(canvasElement: HTMLElement, block: string) {
  const { button, menu, items } = parts(canvasElement, block);
  assert(button.getAttribute("aria-haspopup") === "menu", "the button announces a menu");
  assert(button.getAttribute("aria-expanded") === "false", "closed to start");
  assert(button.getAttribute("aria-controls") === menu.id, "aria-controls points at the menu");
  assert(menu.getAttribute("role") === "menu", "role=menu");
  assert(menu.getAttribute("aria-labelledby") === button.id, "the menu is named by the button");
  assert(menu.hidden, "the menu starts hidden");
  assert(items.length > 0 && items.every((item) => item.tabIndex === -1), "items use roving focus: none is in the tab order");
}

/** Click opens and moves focus in; Escape closes and brings it back. */
export async function checkOpenAndClose(canvasElement: HTMLElement, block: string) {
  const { button, menu, items } = parts(canvasElement, block);
  button.focus();
  button.click();
  await frame();
  assert(!menu.hidden && button.getAttribute("aria-expanded") === "true", "click opens");
  assert(document.activeElement === items.find((i) => i.getAttribute("aria-disabled") !== "true"), "focus lands on the first enabled item");
  await press("Escape");
  assert(menu.hidden && button.getAttribute("aria-expanded") === "false", "Escape closes");
  assert(document.activeElement === button, "Escape returns focus to the button");
}

/** The chevron points down when the menu is closed and up when it is open. */
export async function checkChevron(canvasElement: HTMLElement, block: string) {
  const { button, menu } = parts(canvasElement, block);
  const chevron = button.querySelector<SVGElement>(`.${block}__chevron`);
  assert(chevron, "the button has a chevron");
  const rotation = () => getComputedStyle(chevron!).rotate;
  const down = (value: string) => value === "none" || value === "0deg";
  if (!menu.hidden) button.click();
  await frame();
  assert(down(rotation()), `closed: the chevron points down, rotate is "${rotation()}"`);
  button.click();
  await frame();
  assert(rotation() === "180deg", `open: the chevron points up, rotate is "${rotation()}"`);
  button.click();
  await frame();
  assert(down(rotation()), "closed again: points down");
}

/** ArrowDown / ArrowUp wrap, Home / End jump, a disabled item is skipped, a letter jumps. */
export async function checkNavigation(canvasElement: HTMLElement, block: string) {
  const { button, menu, items } = parts(canvasElement, block);
  const enabled = items.filter((i) => i.getAttribute("aria-disabled") !== "true");
  button.focus();
  await press("ArrowDown");
  assert(!menu.hidden && document.activeElement === enabled[0], "ArrowDown on the button opens on the first item");
  await press("ArrowDown");
  assert(document.activeElement === enabled[1], "ArrowDown moves on, skipping a disabled item");
  await press("End");
  assert(document.activeElement === enabled.at(-1), "End goes to the last item");
  await press("ArrowDown");
  assert(document.activeElement === enabled[0], "ArrowDown wraps");
  await press("ArrowUp");
  assert(document.activeElement === enabled.at(-1), "ArrowUp wraps");
  await press("Home");
  assert(document.activeElement === enabled[0], "Home goes to the first item");
  const target = enabled.find((i) => i.getAttribute("aria-checked") !== null && /^[a-z]/i.test(i.textContent ?? ""));
  if (target) {
    const letter = (target.querySelector(`.${block}__text`)?.textContent ?? "").trim()[0].toLowerCase();
    await press(letter);
    const first = enabled.find((i) => (i.querySelector(`.${block}__text`)?.textContent ?? "").trim().toLowerCase().startsWith(letter));
    assert(document.activeElement === first, `typing "${letter}" jumps to an item starting with it`);
  }
  await press("Escape");
}

/** A checkbox toggles and the menu stays open; the state is in aria-checked. */
export async function checkCheckboxes(canvasElement: HTMLElement, block: string) {
  const { button, menu, items } = parts(canvasElement, block);
  const box = items.find((i) => i.getAttribute("role") === "menuitemcheckbox" && i.getAttribute("aria-disabled") !== "true" && i.getAttribute("aria-checked") === "false");
  assert(box, "needs an unchecked checkbox item");
  button.focus();
  button.click();
  await frame();
  box!.focus();
  await press(" ");
  assert(box!.getAttribute("aria-checked") === "true", "Space checks it");
  assert(!menu.hidden, "a checkbox menu stays open");
  box!.click();
  await frame();
  assert(box!.getAttribute("aria-checked") === "false", "a click unchecks it");
  await press("Escape");
}

/** An exclusive "Any" item: it clears the others, and comes back when they are all cleared. */
export async function checkExclusive(canvasElement: HTMLElement, block: string) {
  const { button, items } = parts(canvasElement, block);
  const label = (el: HTMLElement) => (el.querySelector(`.${block}__text`)?.textContent ?? "").trim();
  const checked = () => items.filter((i) => i.getAttribute("aria-checked") === "true").map(label);
  const [any, fresh, used] = items;
  assert(checked().join() === label(any), "starts on the exclusive item");
  button.focus();
  button.click();
  await frame();
  fresh.click();
  await frame();
  assert(checked().join() === label(fresh), "choosing another item unchecks the exclusive one");
  used.click();
  await frame();
  assert(checked().join() === `${label(fresh)},${label(used)}`, "other items can be checked together");
  any.click();
  await frame();
  assert(checked().join() === label(any), "choosing the exclusive item unchecks the rest");
  any.click();
  await frame();
  assert(checked().join() === label(any), "the exclusive item cannot be unchecked directly");
  used.click();
  await frame();
  used.click();
  await frame();
  assert(checked().join() === label(any), "unchecking the last other item brings the exclusive one back");
  await press("Escape");
}

/** Choosing a radio item unchecks the others. */
export async function checkRadios(canvasElement: HTMLElement, block: string) {
  const { button, items } = parts(canvasElement, block);
  const radios = items.filter((i) => i.getAttribute("role") === "menuitemradio");
  assert(radios.length > 1, "needs radio items");
  assert(radios.filter((i) => i.getAttribute("aria-checked") === "true").length === 1, "exactly one starts checked");
  button.focus();
  button.click();
  await frame();
  const other = radios.find((i) => i.getAttribute("aria-checked") === "false")!;
  other.click();
  await frame();
  assert(other.getAttribute("aria-checked") === "true", "the chosen one is checked");
  assert(radios.filter((i) => i.getAttribute("aria-checked") === "true").length === 1, "and only that one");
  await press("Escape");
}

/** Focus leaving the menu closes it. */
export async function checkFocusLeaves(canvasElement: HTMLElement, block: string) {
  const { button, menu, items } = parts(canvasElement, block);
  button.focus();
  button.click();
  await frame();
  items[0].focus();
  const outside = document.createElement("button");
  canvasElement.append(outside);
  outside.focus();
  await frame();
  assert(menu.hidden, "moving focus away closes the menu");
  outside.remove();
}

/** Focus going to a known outside element closes the menu even right after a press inside. */
export async function checkOutsideFocusAfterPress(canvasElement: HTMLElement, block: string) {
  const { button, menu } = parts(canvasElement, block);
  const outside = document.createElement("button");
  canvasElement.append(outside);
  button.focus();
  button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  button.click();
  await frame();
  assert(!menu.hidden, "open after the click");
  outside.focus();
  await frame();
  assert(menu.hidden, "focus moving to an outside element closes it, even within the press grace period");
  outside.remove();
}

/** A badge is hidden from assistive tech and its `label` is read instead. */
export async function checkBadges(canvasElement: HTMLElement, block: string) {
  const { items } = parts(canvasElement, block);
  for (const item of items) {
    const badge = item.querySelector(`.${block}__badge`);
    if (!badge) continue;
    assert(badge.getAttribute("aria-hidden") === "true", "the visible badge is aria-hidden");
    const spoken = item.querySelector(`.${block}__sr`)?.textContent ?? "";
    assert(spoken.trim() && spoken.trim() !== "" , "a screen-reader label follows the badge");
  }
}

export { frame };
