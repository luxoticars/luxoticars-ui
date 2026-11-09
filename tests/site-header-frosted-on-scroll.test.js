import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const rules = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test("frosted-on-scroll CSS ships only in the opt-in stylesheets", () => {
  for (const p of [
    "src/styles/site-header.css",
    "src/marko/lx-site-header/base.css",
    "src/styles/site-header-hide-on-scroll.css",
  ]) {
    assert.doesNotMatch(rules(read(p)), /backdrop-filter/, p);
  }
  const css = read("src/styles/site-header-frosted-on-scroll.css");
  assert.match(css, /data-scroll-dir=["']up["']/);
  assert.match(css, /@supports/);
  assert.match(css, /backdrop-filter/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("header entries do not import frosted-on-scroll.css", () => {
  for (const p of ["src/astro/SiteHeader.astro", "src/marko/lx-site-header/index.marko", "src/marko/lx-site-header/base.marko"]) {
    assert.doesNotMatch(read(p), /^\s*import\s+["'][^"'\n]*frosted-on-scroll\.css/m, p);
  }
});

test("Marko frosted-on-scroll is stamped against the Astro source", () => {
  const css = read("src/marko/lx-site-header/frosted-on-scroll.css");
  assert.match(
    css,
    /Forked from src\/styles\/site-header-frosted-on-scroll\.css \[source-hash: [0-9a-f]{12}\]/,
  );
  assert.match(css, /\.lx-site-header\[data-hide-on-scroll\]:not\(\[data-hide-on-scroll="false"\]\)\[data-scroll-dir="up"\]/);
  assert.match(css, /@supports/);
  assert.match(css, /backdrop-filter:\s*blur\(12px\) saturate\(1\.2\)/);
  assert.match(css, /color-mix\(in srgb, var\(--_bg\) 72%, transparent\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(rules(css), /feTurbulence|url\(/);
});

test("frosted-on-scroll Astro and Marko package exports are both wired", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(
    exports["./styles/site-header-frosted-on-scroll.css"],
    "./src/styles/site-header-frosted-on-scroll.css",
  );
  assert.equal(
    exports["./marko/lx-site-header/frosted-on-scroll.css"],
    "./src/marko/lx-site-header/frosted-on-scroll.css",
  );
});

/* A bare function like `(color-mix(…))` is not a supports-feature: CSS reads
   it as <general-enclosed>, which is always false, so the whole block is dead.
   It must be a declaration: `(color: color-mix(…))`. */
test("@supports conditions in both opt-in sheets are declarations, not bare functions", () => {
  for (const p of [
    "src/styles/site-header-frosted-on-scroll.css",
    "src/marko/lx-site-header/frosted-on-scroll.css",
  ]) {
    const preludes = [...rules(read(p)).matchAll(/@supports\s+([^{]+)\{/g)].map((m) => m[1]);
    assert.ok(preludes.length > 0, `${p}: no @supports`);
    for (const prelude of preludes) {
      assert.doesNotMatch(prelude, /\(\s*(?!selector\(|font-tech\(|font-format\()[a-z-]+\(/i, `${p}: ${prelude}`);
      assert.match(prelude, /\(color:\s*color-mix\(/, `${p}: ${prelude}`);
    }
  }
});

test("frosted transition in both opt-in sheets keeps translate", () => {
  for (const p of [
    "src/styles/site-header-frosted-on-scroll.css",
    "src/marko/lx-site-header/frosted-on-scroll.css",
  ]) {
    const m = rules(read(p)).match(/transition:\s*([^;]+);/);
    assert.ok(m, `${p}: frosted transition missing`);
    assert.match(m[1], /(^|,)\s*translate\s+200ms ease-out/, p);
  }
});

/* #107: on narrow screens the search row has its own solid --_bg. While the
   bar is frosted the row must be cleared, or it paints a dark box. The Astro
   floating row sits outside the header, so it keeps its background there. */
test("frosted-on-scroll clears the search row's solid background", () => {
  const marko = rules(read("src/marko/lx-site-header/frosted-on-scroll.css"));
  assert.match(
    marko,
    /\[data-scroll-dir="up"\] \.lx-site-header__search \{\s*background-color: transparent;/,
  );
  const astro = rules(read("src/styles/site-header-frosted-on-scroll.css"));
  assert.match(
    astro,
    /\[data-scroll-dir="up"\]:not\(\[data-search-floating\]\) \.site-header__search \{\s*background-color: transparent;/,
  );
});
