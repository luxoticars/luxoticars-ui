import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveButton } from "../src/utils/button.js";

/* The resolver decides what both buttons print (astro/ui/Button.astro and
   marko/lx-button), so they cannot disagree. */

test("defaults: a <button type=button> with the default variant and nothing else", () => {
  const { tag, className, attrs } = resolveButton();
  assert.equal(tag, "button");
  assert.equal(className, "button button--default");
  assert.equal(attrs.type, "button");
  assert.equal(attrs.disabled, undefined);
});

test("variant, size, radius and iconOnly become modifiers; the defaults add none", () => {
  const { className } = resolveButton({ variant: "outline", size: "lg", radius: "xl", iconOnly: true });
  assert.equal(className, "button button--outline button--lg button--radius-xl button--icon");
  assert.equal(resolveButton({ size: "default", radius: "field" }).className, "button button--default");
});

test("the block is the renderer's own, and a caller's class goes last", () => {
  assert.equal(resolveButton({ block: "lx-button", className: ["x", { y: true, z: false }] }).className, "lx-button lx-button--default x y");
});

test("pill is shorthand for radius full, and an explicit radius wins", () => {
  assert.match(resolveButton({ pill: true }).className, /button--radius-full/);
  assert.match(resolveButton({ pill: true, radius: "none" }).className, /button--radius-none/);
  assert.doesNotMatch(resolveButton({ pill: true, radius: "none" }).className, /radius-full/);
});

test("an unknown variant, size or radius throws, naming the choices", () => {
  assert.throws(() => resolveButton({ variant: "primary" }), /unknown variant "primary".*default, destructive/);
  assert.throws(() => resolveButton({ size: "huge" }), /unknown size "huge"/);
  assert.throws(() => resolveButton({ radius: "round" }), /unknown radius "round".*field, none/);
});

test("`false` means not set, so `variant={cond && 'outline'}` works", () => {
  assert.equal(resolveButton({ variant: false, size: false, radius: false }).className, "button button--default");
});

test("href makes an <a> and keeps the caller's role, tabindex and target", () => {
  const { tag, attrs } = resolveButton({ attrs: { href: "/inventory", target: "_blank", rel: "noopener", tabindex: 3 } });
  assert.equal(tag, "a");
  assert.deepEqual([attrs.href, attrs.target, attrs.rel, attrs.tabindex], ["/inventory", "_blank", "noopener", 3]);
  assert.equal(attrs.type, undefined); // a link gets no default button type
});

test("a link keeps its own type, the MIME type of its target, and gets no default one", () => {
  const pdf = resolveButton({ attrs: { href: "/brochure.pdf", type: "application/pdf" } }).attrs;
  assert.equal(pdf.type, "application/pdf");
  assert.equal(resolveButton({ attrs: { href: "/x" } }).attrs.type, undefined);
  assert.equal(resolveButton({ attrs: { href: "/x", type: "application/pdf", disabled: true } }).attrs.type, "application/pdf");
});

test("a disabled link drops href and cannot be re-enabled by the caller's own attributes", () => {
  const { tag, attrs } = resolveButton({
    attrs: { href: "/x", disabled: true, tabindex: 5, "aria-disabled": "false", role: "button" },
  });
  assert.equal(tag, "a");
  assert.equal(attrs.href, undefined);
  assert.deepEqual([attrs.role, attrs.tabindex, attrs["aria-disabled"]], ["link", -1, "true"]);
});

test("type is defaulted, and a caller's own type survives", () => {
  assert.equal(resolveButton({ attrs: { type: "submit" } }).attrs.type, "submit");
  assert.equal(resolveButton({ attrs: {} }).attrs.type, "button");
});

test("a disabled button gets the disabled attribute, an enabled one none", () => {
  assert.equal(resolveButton({ attrs: { disabled: true } }).attrs.disabled, true);
  assert.equal(resolveButton({ attrs: { disabled: false } }).attrs.disabled, undefined);
});

test("other attributes pass through untouched", () => {
  const { attrs } = resolveButton({ attrs: { "aria-label": "Close", "data-id": "7", form: "f" } });
  assert.deepEqual([attrs["aria-label"], attrs["data-id"], attrs.form], ["Close", "7", "f"]);
});

/* ---- aria-expanded, aria-haspopup, aria-controls ----------------------- */

test("aria-expanded is printed as the string ARIA expects, false included", () => {
  const state = (value) => resolveButton({ attrs: { "aria-expanded": value } }).attrs["aria-expanded"];
  assert.equal(state(true), "true");
  assert.equal(state(false), "false"); // an accordion that is closed still says so
  assert.equal(state("true"), "true");
  assert.equal(state("false"), "false");
  assert.equal(state(undefined), undefined); // not a disclosure: no attribute
  assert.throws(() => state("yes"), /aria-expanded must be true or false/);
});

test("aria-haspopup: true, a popup kind, or nothing", () => {
  const popup = (value) => resolveButton({ attrs: { "aria-haspopup": value } }).attrs["aria-haspopup"];
  assert.equal(popup(true), "true");
  for (const kind of ["menu", "listbox", "tree", "grid", "dialog"]) assert.equal(popup(kind), kind);
  assert.equal(popup(false), undefined); // opens nothing: no attribute, not "false"
  assert.equal(popup("false"), undefined);
  assert.equal(popup(undefined), undefined);
  assert.throws(() => popup("modal"), /unknown aria-haspopup "modal"/);
});

test("aria-controls is trimmed, may list several ids, and cannot be empty", () => {
  const controls = (value) => resolveButton({ attrs: { "aria-controls": value } }).attrs["aria-controls"];
  assert.equal(controls(" faq-1 "), "faq-1");
  assert.equal(controls("a b"), "a b");
  assert.equal(controls(undefined), undefined);
  assert.throws(() => controls("  "), /aria-controls needs the id/);
});

test("the three ARIA states work together on a link as well as a button", () => {
  const aria = { "aria-expanded": false, "aria-haspopup": "dialog", "aria-controls": "filters" };
  for (const attrs of [aria, { ...aria, href: "#filters" }]) {
    const out = resolveButton({ attrs }).attrs;
    assert.deepEqual([out["aria-expanded"], out["aria-haspopup"], out["aria-controls"]], ["false", "dialog", "filters"]);
  }
});
