import type { ClassValue } from "clsx";
import type { MenuButtonAlign, MenuButtonItem, MenuButtonType } from "../types";

/** A selector matching every menu item, whatever its role. */
export declare const ENTRY: string;

export interface MenuButtonOptions {
  /** The button's visible text and accessible name. */
  label?: string | false | null;
  items?: readonly MenuButtonItem[];
  /** `undefined`, `false` and `null` mean a plain menu of actions. */
  type?: MenuButtonType | false | null;
  /** Form field name for a `checkbox` or `radio` menu. */
  name?: string | false | null;
  /** @default "start" */
  align?: MenuButtonAlign | false | null;
  /** Base for every generated id. A counter supplies one when unset. */
  id?: string | false | null;
  /** Waiting for something the menu started, such as a page that is loading. `false` and `null` mean not waiting. */
  busy?: boolean | null;
  /** What screen readers hear while `busy`. @default "Loading" */
  busyLabel?: string | false | null;
  /** The caller's classes, in any form `cn()` accepts. */
  className?: ClassValue;
  /** The BEM block the classes are built on. @default "menu-button" */
  block?: string;
}

export interface ResolvedMenuItem {
  /** Stable across renders: the value, else the index. Use it as a loop key. */
  key: string;
  id: string;
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  /** `aria-checked`, as the string ARIA expects. `undefined` for a plain menu. */
  checked: "true" | "false" | undefined;
  /** `aria-disabled`, as the string ARIA expects. */
  disabled: "true" | undefined;
  value: string | undefined;
  /** Choosing it unchecks the rest, and choosing another item unchecks it. */
  exclusive: boolean;
  label: string;
  /** Only an enabled link item has one. */
  href: string | undefined;
  isLink: boolean;
  prefix: { text: string; label: string | undefined } | null;
  /** `text` is shown; `label` is what screen readers hear. */
  badge: { text: string; label: string } | null;
}

export interface ResolvedMenuButton {
  className: string;
  id: string;
  buttonId: string;
  menuId: string;
  label: string;
  type: MenuButtonType | undefined;
  name: string | undefined;
  /** `aria-busy` for the button, as the string ARIA expects. `undefined` when not waiting. */
  busy: "true" | undefined;
  /** The status region's text: `busyLabel` while waiting, empty otherwise. */
  status: string;
  items: ResolvedMenuItem[];
}

/**
 * Validates a menu button's options and decides its markup. Throws, with a
 * message that names the item, on a missing label, an unknown type, a duplicate
 * or missing value, a link inside a checkbox or radio menu, or two checked
 * radio items.
 */
export declare function resolveMenuButton(options?: MenuButtonOptions): ResolvedMenuButton;

/**
 * What is checked after the user chooses `value`. A radio menu checks just that one. A checkbox menu
 * toggles it, except that an `exclusive` item unchecks the others, cannot be unchecked directly, and
 * comes back when the last other item is unchecked.
 */
export declare function toggleChecked(
  type: MenuButtonType,
  items: readonly { value: string | undefined; exclusive?: boolean }[],
  checked: readonly string[],
  value: string,
): string[];

/** Where focus goes on ArrowDown, ArrowUp, Home or End; `undefined` for any other key, `-1` when no item can take it. */
export declare function navigate(key: string, current: number, enabled: readonly boolean[]): number | undefined;

export interface TypeaheadState {
  query: string;
  /** When the last character was typed, in ms. */
  at: number;
}
/** Adds a typed character to a query, starting a new one after `timeout` ms (500) of quiet. */
export declare function extendQuery(state: TypeaheadState, char: string, now: number, timeout?: number): TypeaheadState;

export declare function isTypeaheadKey(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): boolean;

/** The next enabled item whose label starts with `query`, or -1. */
export declare function typeahead(query: string, current: number, labels: readonly string[], enabled: readonly boolean[]): number;
