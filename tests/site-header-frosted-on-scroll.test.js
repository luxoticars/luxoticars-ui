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
