/*
  Behaviour for `.menu-button`, the ARIA Authoring Practices "menu button"
  pattern. `MenuButton.astro` installs it through a processed <script>, which
  Astro bundles once per page. With the Skin (`styles/skin/menu-button.css`) and
  the markup in its story, call `initMenuButtons()` yourself. The markup is the contract: roles, `aria-checked`
  and `hidden` are the state, so there is nothing to keep in step.

  Focus stays on the items (roving, tabindex -1) and the menu closes when focus
  leaves it, so a click elsewhere, Tab and Escape all close it, and the first
  two need no document listener.
*/
import { ENTRY, extendQuery, isTypeaheadKey, navigate, toggleChecked, typeahead } from "../utils/menu-button.js";

export function initMenuButton(root) {
  /* An attribute, not a WeakSet: a second copy of this module (a story and a page
     script are bundled separately) must see that the root is already wired, or each
     click would toggle twice and the menu would never open. */
  if (root.hasAttribute("data-menu-button-ready")) return;
  root.setAttribute("data-menu-button-ready", "");

  const button = root.querySelector(".menu-button__button");
  const menu = root.querySelector(".menu-button__menu");
  if (!button || !menu) return;

  const items = () => [...menu.querySelectorAll(ENTRY)];
  const enabled = (list) => list.map((item) => item.getAttribute("aria-disabled") !== "true");
  let typed = { query: "", at: 0 };
  /* Safari does not focus a button on click, so focus leaving the menu for the
     button reports no relatedTarget. A press inside the component is never
     "outside", and the focus change comes within a few ms of the press. */
  let pressedAt = -Infinity;

  const isOpen = () => !menu.hidden;

  function open(where) {
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    const list = items();
    const index = where === "last" ? navigate("End", 0, enabled(list)) : navigate("Home", -1, enabled(list));
    if (index >= 0) list[index].focus();
  }

  function close({ returnFocus }) {
    if (!isOpen()) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    typed = { query: "", at: 0 };
    if (returnFocus) button.focus();
  }

  function focusAt(list, index) {
    if (index >= 0) list[index]?.focus();
  }

  function choose(item) {
    if (item.getAttribute("aria-disabled") === "true") return;
    const role = item.getAttribute("role");
    let checked = false;
    if (role !== "menuitem") {
      const type = role === "menuitemradio" ? "radio" : "checkbox";
      const marked = items().filter((el) => el.getAttribute("role") === role);
      const rules = marked.map((el) => ({ value: el.dataset.value, exclusive: el.hasAttribute("data-exclusive") }));
      const now = marked.filter((el) => el.getAttribute("aria-checked") === "true").map((el) => el.dataset.value);
      const next = toggleChecked(type, rules, now, item.dataset.value);
      for (const el of marked) el.setAttribute("aria-checked", String(next.includes(el.dataset.value)));
      checked = next.includes(item.dataset.value);
    }
    /* Form support: a checked item's hidden input is enabled, so it submits. */
    for (const field of menu.querySelectorAll("input[type=hidden]")) {
      const owner = field.closest(ENTRY);
      if (owner) field.disabled = owner.getAttribute("aria-checked") !== "true";
    }
    root.dispatchEvent(
      new CustomEvent("menu-button:select", {
        bubbles: true,
        detail: { value: item.dataset.value, label: item.dataset.label ?? item.textContent.trim(), checked },
      }),
    );
    /* A checkbox or radio keeps the menu open, so several can be changed. An action closes it. */
    if (role === "menuitem") close({ returnFocus: true });
  }

  root.addEventListener("pointerdown", () => {
    pressedAt = performance.now();
  });

  root.addEventListener("focusout", (event) => {
    if (!isOpen()) return;
    /* Focus going to a known element is never ambiguous: outside closes, inside stays. */
    if (event.relatedTarget) {
      if (!root.contains(event.relatedTarget)) close({ returnFocus: false });
      return;
    }
    /* No target: a press inside (Safari's button) or focus leaving the page. Only the first is ignored. */
    if (performance.now() - pressedAt < 300) return;
    close({ returnFocus: false });
  });

  button.addEventListener("click", () => {
    if (isOpen()) close({ returnFocus: true });
    else open("first");
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!isOpen()) open(event.key === "ArrowUp" ? "last" : "first");
  });

  menu.addEventListener("click", (event) => {
    const item = event.target.closest?.(ENTRY);
    if (item && menu.contains(item)) choose(item);
  });

  menu.addEventListener("keydown", (event) => {
    const list = items();
    const current = list.indexOf(event.target.closest?.(ENTRY));

    const to = navigate(event.key, current, enabled(list));
    if (to !== undefined) {
      event.preventDefault();
      focusAt(list, to);
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close({ returnFocus: true });
        return;
      case "Tab":
        /* Focus goes to the button first, so Tab moves on from there, in either direction. */
        button.focus();
        close({ returnFocus: false });
        return;
      case "Enter":
      case " ":
        if (current < 0) return;
        event.preventDefault();
        /* A click, so a link follows its href and everything goes through one path. */
        list[current].click();
        return;
    }

    if (isTypeaheadKey(event)) {
      typed = extendQuery(typed, event.key, performance.now());
      const match = typeahead(typed.query, current, list.map((i) => i.dataset.label ?? i.textContent.trim()), enabled(list));
      focusAt(list, match);
    }
  });
}

export function initMenuButtons(scope = document) {
  for (const root of scope.querySelectorAll(".menu-button")) initMenuButton(root);
}

/**
 * Marks a menu button as waiting, or not: `aria-busy` on the button (the Skin runs an arc around the button for it) and
 * `label` in the status region, which a screen reader reads out. Safe to call as often as you like.
 */
export function setMenuButtonBusy(root, busy, label = "Loading") {
  const button = root.querySelector(".menu-button__button");
  const status = root.querySelector('.menu-button__sr[role="status"]');
  if (!button) return;
  if (busy) button.setAttribute("aria-busy", "true");
  else button.removeAttribute("aria-busy");
  if (status) status.textContent = busy ? label : "";
}
