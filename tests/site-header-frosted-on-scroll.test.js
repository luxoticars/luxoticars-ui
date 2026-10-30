import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const rules = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test("frosted-on-scroll CSS ships only in the Astro opt-in stylesheet (Marko fork next)", () => {
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

test("frosted-on-scroll Astro package export is wired", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(
    exports["./styles/site-header-frosted-on-scroll.css"],
    "./src/styles/site-header-frosted-on-scroll.css",
  );
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
