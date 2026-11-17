import { test } from "node:test";
import assert from "node:assert/strict";
import { extendQuery, isTypeaheadKey, navigate, resolveMenuButton, toggleChecked, typeahead } from "../src/utils/menu-button.js";
import { cases } from "../stories/menu-button-cases.ts";

/* The resolver decides everything a menu button renders, so the Astro component and
   the Marko tag only print its answer and cannot disagree. The keyboard rules are
   pure functions both call. */

const items = [{ label: "One" }, { label: "Two" }];
const make = (extra = {}) => resolveMenuButton({ label: "Menu", id: "m", items, ...extra });

test("ids hang off one base, so aria-controls and aria-labelledby can match", () => {
  const menu = make();
  assert.equal(menu.buttonId, "m-button");
  assert.equal(menu.menuId, "m-menu");
  assert.deepEqual(menu.items.map((i) => i.id), ["m-item-0", "m-item-1"]);
});

test("an unset id gets a generated one, different each time", () => {
  const a = resolveMenuButton({ label: "A", items });
  const b = resolveMenuButton({ label: "B", items });
  assert.notEqual(a.id, b.id);
});

test("the role follows the type", () => {
  assert.deepEqual(make().items.map((i) => i.role), ["menuitem", "menuitem"]);
  const withValues = [{ label: "One", value: "1" }, { label: "Two", value: "2" }];
  assert.equal(make({ type: "checkbox", items: withValues }).items[0].role, "menuitemcheckbox");
  assert.equal(make({ type: "radio", items: withValues }).items[0].role, "menuitemradio");
});

test("aria-checked is the string ARIA expects, and absent in a plain menu", () => {
  const withValues = [{ label: "One", value: "1", checked: true }, { label: "Two", value: "2" }];
  const menu = make({ type: "checkbox", items: withValues });
  assert.deepEqual(menu.items.map((i) => i.checked), ["true", "false"]);
  assert.equal(make().items[0].checked, undefined);
});

test("a badge is read from badgeLabel, else from its own text; 0 is a value", () => {
  const menu = make({ items: [{ label: "A", badge: 99, badgeLabel: "99 new" }, { label: "B", badge: 3 }, { label: "C", badge: 0 }, { label: "D", badge: false }, { label: "E" }] });
  assert.deepEqual(menu.items[0].badge, { text: "99", label: "99 new" });
  assert.deepEqual(menu.items[1].badge, { text: "3", label: "3" });
  assert.deepEqual(menu.items[2].badge, { text: "0", label: "0" });
  assert.equal(menu.items[3].badge, null);
  assert.equal(menu.items[4].badge, null);
});

test("a prefix is decorative unless it has a label", () => {
  const menu = make({ items: [{ label: "A", prefix: "RM", prefixLabel: "Ringgit" }, { label: "B", prefix: "RM" }, { label: "C", prefix: "  " }] });
  assert.deepEqual(menu.items[0].prefix, { text: "RM", label: "Ringgit" });
  assert.deepEqual(menu.items[1].prefix, { text: "RM", label: undefined });
  assert.equal(menu.items[2].prefix, null);
});

test("a disabled link has no href, so it cannot be followed", () => {
  const menu = make({ items: [{ label: "A", href: "/a" }, { label: "B", href: "/b", disabled: true }] });
  assert.equal(menu.items[0].href, "/a");
  assert.equal(menu.items[1].href, undefined);
  assert.equal(menu.items[1].disabled, "true");
});

test("align end adds the modifier; the caller's class comes last", () => {
  assert.equal(make().className, "menu-button");
  assert.equal(make({ align: "end", className: ["x", { y: true }] }).className, "menu-button menu-button--end x y");
  assert.equal(make({ block: "lx-menu-button" }).className, "lx-menu-button");
});

test("mistakes fail loudly, naming the item", () => {
  const v = [{ label: "One", value: "1" }];
  assert.throws(() => make({ label: "  " }), /label/);
  assert.throws(() => make({ items: [] }), /at least one/);
  assert.throws(() => make({ type: "toggle", items: v }), /unknown type "toggle"/);
  assert.throws(() => make({ align: "middle" }), /unknown align/);
  assert.throws(() => make({ id: "a b" }), /whitespace/);
  assert.throws(() => make({ items: [{ label: "" }] }), /item 0 needs a non-empty/);
  assert.throws(() => make({ type: "checkbox", items: [{ label: "One" }] }), /"One" needs a `value`/);
  assert.throws(() => make({ type: "checkbox", items: [{ label: "A", value: "x" }, { label: "B", value: "x" }] }), /share the value "x"/);
  assert.throws(() => make({ type: "checkbox", items: [{ label: "A", value: "x", href: "/a" }] }), /cannot also be a link/);
  assert.throws(() => make({ items: [{ label: "A", checked: true }] }), /no `type`/);
  assert.throws(() => make({ name: "q" }), /`name` only applies/);
  assert.throws(() => make({ type: "radio", items: [{ label: "A", value: "a", checked: true }, { label: "B", value: "b", checked: true }] }), /only one checked/);
});

test("every shared story case resolves", () => {
  for (const [name, c] of Object.entries(cases)) assert.doesNotThrow(() => resolveMenuButton(c), name);
});

test("navigate: arrows wrap and skip disabled items; Home and End jump", () => {
  const on = [true, false, true, true];
  assert.equal(navigate("ArrowDown", 0, on), 2);
  assert.equal(navigate("ArrowDown", 3, on), 0);
  assert.equal(navigate("ArrowUp", 0, on), 3);
  assert.equal(navigate("ArrowUp", 2, on), 0);
  assert.equal(navigate("Home", 3, on), 0);
  assert.equal(navigate("End", 0, on), 3);
  assert.equal(navigate("Home", -1, [false, true]), 1);
  assert.equal(navigate("ArrowDown", -1, on), 0);
  assert.equal(navigate("ArrowUp", -1, on), 3);
  assert.equal(navigate("ArrowDown", 0, [false, false]), -1);
  assert.equal(navigate("a", 0, on), undefined);
});

test("typeahead: a letter cycles, more letters narrow, disabled items are skipped", () => {
  const labels = ["Apple", "Avocado", "Banana", "Apricot"];
  const on = [true, true, true, true];
  assert.equal(typeahead("a", 0, labels, on), 1);
  assert.equal(typeahead("a", 3, labels, on), 0);
  assert.equal(typeahead("b", 0, labels, on), 2);
  assert.equal(typeahead("ap", 0, labels, on), 0);
  assert.equal(typeahead("apr", 0, labels, on), 3);
  assert.equal(typeahead("aa", 0, labels, on), 1);
  assert.equal(typeahead("a", 0, labels, [true, false, true, true]), 3);
  assert.equal(typeahead("z", 0, labels, on), -1);
});

test("the typeahead query resets after a pause", () => {
  let state = { query: "", at: 0 };
  state = extendQuery(state, "A", 1000);
  state = extendQuery(state, "p", 1200);
  assert.equal(state.query, "ap");
  state = extendQuery(state, "b", 2000);
  assert.equal(state.query, "b");
});

test("only a plain character is typeahead; Space and shortcuts are not", () => {
  assert.equal(isTypeaheadKey({ key: "a" }), true);
  assert.equal(isTypeaheadKey({ key: " " }), false);
  assert.equal(isTypeaheadKey({ key: "Enter" }), false);
  assert.equal(isTypeaheadKey({ key: "a", ctrlKey: true }), false);
});

const filter = [{ value: "any", exclusive: true }, { value: "new" }, { value: "used" }, { value: "recon" }];

test("toggleChecked: a checkbox toggles; a radio checks only the chosen item", () => {
  const plain = [{ value: "a" }, { value: "b" }];
  assert.deepEqual(toggleChecked("checkbox", plain, [], "a"), ["a"]);
  assert.deepEqual(toggleChecked("checkbox", plain, ["a"], "b"), ["a", "b"]);
  assert.deepEqual(toggleChecked("checkbox", plain, ["a", "b"], "a"), ["b"]);
  assert.deepEqual(toggleChecked("checkbox", plain, ["a"], "a"), [], "with no exclusive item, nothing is a valid state");
  assert.deepEqual(toggleChecked("radio", plain, ["a"], "b"), ["b"]);
});

test("toggleChecked: an exclusive item clears the rest and is not cleared by a click", () => {
  assert.deepEqual(toggleChecked("checkbox", filter, ["new", "used"], "any"), ["any"]);
  assert.deepEqual(toggleChecked("checkbox", filter, ["any"], "any"), ["any"]);
});

test("toggleChecked: another item unchecks the exclusive one, and the last one out brings it back", () => {
  assert.deepEqual(toggleChecked("checkbox", filter, ["any"], "used"), ["used"]);
  assert.deepEqual(toggleChecked("checkbox", filter, ["used"], "new"), ["used", "new"]);
  assert.deepEqual(toggleChecked("checkbox", filter, ["used", "new"], "used"), ["new"]);
  assert.deepEqual(toggleChecked("checkbox", filter, ["new"], "new"), ["any"]);
});

test("exclusive: at most one, checkbox menus only, and never checked with others", () => {
  const v = (extra) => [{ label: "Any", value: "any", exclusive: true, ...extra }, { label: "New", value: "new" }];
  assert.equal(make({ type: "checkbox", items: v() }).items[0].exclusive, true);
  assert.equal(make({ type: "checkbox", items: v() }).items[1].exclusive, false);
  assert.throws(() => make({ type: "radio", items: v() }), /only applies to a `checkbox` menu/);
  assert.throws(() => make({ items: [{ label: "Any", exclusive: true }] }), /only applies to a `checkbox` menu/);
  assert.throws(() => make({ type: "checkbox", items: [...v(), { label: "Two", value: "two", exclusive: true }] }), /only one item can be `exclusive`/);
  assert.throws(() => make({ type: "checkbox", items: [{ label: "Any", value: "any", exclusive: true, checked: true }, { label: "New", value: "new", checked: true }] }), /cannot be checked together/);
});
