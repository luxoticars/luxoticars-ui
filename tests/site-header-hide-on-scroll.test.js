import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  hideOnScrollEnabled,
  resetHideOnScrollSupport,
  wireHideOnScroll,
} from "../src/scripts/site-header-hide-on-scroll.js";
import { buildModel } from "../src/marko/lx-site-header/helper.ts";

/* No DOM in the test deps, so a window, getComputedStyle and a header are
   faked with just what the script touches. */

/** `scrolledQuery` is what the stylesheet's support probe left on the header. */
function setup({ scrolledQuery = "", attr = "" } = {}) {
  const win = new EventTarget();
  win.scrollY = 0;
  globalThis.window = win;
  globalThis.getComputedStyle = () => ({ getPropertyValue: (name) => (name === "--_scrolled-query" ? scrolledQuery : "") });

  const attrs = new Map(attr === null ? [] : [["data-hide-on-scroll", attr]]);
  const dataset = {};
  const header = {
    offsetHeight: 64,
    dataset,
    getAttribute: (name) => attrs.get(name) ?? null,
    removeAttribute: (name) => {
      if (name === "data-scroll-dir") delete dataset.scrollDir;
      attrs.delete(name);
    },
  };
  const scrollTo = (y) => {
    win.scrollY = y;
    win.dispatchEvent(new Event("scroll"));
  };
  return { header, scrollTo };
}

beforeEach(() => resetHideOnScrollSupport());

test("on unless the attribute is missing or \"false\"", () => {
  assert.equal(hideOnScrollEnabled(setup().header), true);
  assert.equal(hideOnScrollEnabled(setup({ attr: "true" }).header), true);
  assert.equal(hideOnScrollEnabled(setup({ attr: "false" }).header), false);
  assert.equal(hideOnScrollEnabled(setup({ attr: null }).header), false);
});

test("off: scrolling leaves the header alone", () => {
  for (const attr of [null, "false"]) {
    const { header, scrollTo } = setup({ attr });
    wireHideOnScroll(header, new AbortController().signal);
    scrollTo(500);
    assert.equal(header.dataset.scrollDir, undefined);
  }
});

test("where the stylesheet hides it on its own, the script does nothing", () => {
  const { header, scrollTo } = setup({ scrolledQuery: " 1" });
  wireHideOnScroll(header, new AbortController().signal);
  scrollTo(500);
  assert.equal(header.dataset.scrollDir, undefined);
});

test("support is read once, from the first header wired", () => {
  let reads = 0;
  const { header } = setup();
  globalThis.getComputedStyle = () => (reads++, { getPropertyValue: () => "" });
  wireHideOnScroll(header, new AbortController().signal);
  wireHideOnScroll(header, new AbortController().signal);
  assert.equal(reads, 1);
});

test("down hides, up shows; short scrolls change nothing", () => {
  const { header, scrollTo } = setup();
  wireHideOnScroll(header, new AbortController().signal);

  scrollTo(300);
  assert.equal(header.dataset.scrollDir, "down");
  scrollTo(295); // under the threshold
  assert.equal(header.dataset.scrollDir, "down");
  scrollTo(280);
  assert.equal(header.dataset.scrollDir, "up");
  scrollTo(285);
  assert.equal(header.dataset.scrollDir, "up");
  scrollTo(400);
  assert.equal(header.dataset.scrollDir, "down");
});

test("within the bar's height of the top it stays, and overscroll counts as the top", () => {
  const { header, scrollTo } = setup();
  wireHideOnScroll(header, new AbortController().signal);
  scrollTo(40); // down, but still inside the 64px bar
  assert.equal(header.dataset.scrollDir, "up");
  scrollTo(300);
  scrollTo(-30);
  assert.equal(header.dataset.scrollDir, "up");
});

test("abort stops listening and clears the direction", () => {
  const { header, scrollTo } = setup();
  const controller = new AbortController();
  wireHideOnScroll(header, controller.signal);
  scrollTo(300);
  assert.equal(header.dataset.scrollDir, "down");
  controller.abort();
  assert.equal(header.dataset.scrollDir, undefined);
  scrollTo(800);
  assert.equal(header.dataset.scrollDir, undefined);
});

test("Marko model: hideOnScroll defaults to on", () => {
  assert.equal(buildModel({}).hideOnScroll, true);
  assert.equal(buildModel({ hideOnScroll: false }).hideOnScroll, false);
});

/* The slide is opt-in: its rules live only in the optional stylesheets, which
   the package exports and no component or entry imports on its own. */
test("hide-on-scroll CSS ships only in the opt-in stylesheets", async () => {
  const { readFileSync } = await import("node:fs");
  const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  const rules = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const p of [
    "src/styles/site-header.css",
    "src/marko/lx-site-header/base.css",
    "src/marko/lx-site-header/desktop.css",
    "src/marko/lx-site-header/mobile.css",
  ]) {
    assert.doesNotMatch(rules(read(p)), /data-hide-on-scroll|scroll-state/, p);
  }
  for (const p of ["src/styles/site-header-hide-on-scroll.css", "src/marko/lx-site-header/hide-on-scroll.css"]) {
    assert.match(rules(read(p)), /data-hide-on-scroll/, p);
  }
  for (const p of [
    "src/astro/SiteHeader.astro",
    "src/marko/lx-site-header/base.marko",
    "src/marko/lx-site-header/desktop.entry.marko",
    "src/marko/lx-site-header/mobile.entry.marko",
    "src/marko/lx-site-header/index.marko",
  ]) {
    assert.doesNotMatch(read(p), /^\s*import\s+["'][^"'\n]*hide-on-scroll\.css/m, p);
  }
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/site-header-hide-on-scroll.css"], "./src/styles/site-header-hide-on-scroll.css");
  assert.equal(exports["./marko/lx-site-header/hide-on-scroll.css"], "./src/marko/lx-site-header/hide-on-scroll.css");
});
