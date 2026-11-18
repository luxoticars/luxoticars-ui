/** The `detail` of the `menu-button:select` event. */
export interface MenuButtonSelectDetail {
  /** The item's `value`, when it has one. */
  value: string | undefined;
  label: string;
  /** Whether the item is checked now. Always `false` for a plain item. */
  checked: boolean;
}

/**
 * Wires one `.menu-button`: open and close, arrow-key roving focus, Home/End,
 * type-ahead, Escape, and toggling of checkbox and radio items. Safe to call
 * twice on the same root. Dispatches a bubbling `menu-button:select` CustomEvent
 * on the root when an item is chosen.
 */
export declare function initMenuButton(root: Element): void;

/**
 * Wires every `.menu-button` under `scope` (the document by default). `astro/ui/MenuButton` does this
 * itself; call it when you write the Skin's markup by hand:
 *
 * ```js
 * import { initMenuButtons } from "@luxoticars/ui/scripts/menu-button";
 * initMenuButtons();
 * ```
 */
export declare function initMenuButtons(scope?: ParentNode): void;

/**
 * Marks a menu button as waiting, or not: `aria-busy` on the button (the Skin draws a spinner in place of
 * the chevron) and `label` in its status region, which screen readers read out. For the Skin's markup;
 * `astro/ui/MenuButton` and `<lx-menu-button>` take a `busy` prop instead.
 *
 * ```js
 * import { setMenuButtonBusy } from "@luxoticars/ui/scripts/menu-button";
 * setMenuButtonBusy(root, true, "Updating results…");
 * ```
 */
export declare function setMenuButtonBusy(root: Element, busy: boolean, label?: string): void;
