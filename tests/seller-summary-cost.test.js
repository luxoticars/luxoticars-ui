import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

/*
  SellerSummary.astro tells consumers what the component costs a page. These
  keep that note true: when one fails, either trim what was added or raise the
  ceiling here and the figures in the component's JSDoc together.
*/

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/* Close to what a bundler's minifier produces (within a few bytes of
   Lightning CSS on these files), with no dependency: comments out, whitespace
   collapsed. */
const minify = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};:,])\s*/g, "$1")
    .trim();
const gzip = (text) => gzipSync(text, { level: 9 }).length;

test("cost: the CSS a page pays for a seller summary stays within what the docs say", () => {
  const own = minify(read("src/styles/seller-summary.css"));
  const badge = minify(read("src/styles/program-badge.css"));
  assert.ok(own.length <= 3200, `seller-summary.css is ${own.length} bytes minified; the docs say about 3.1 kB`);
  assert.ok(gzip(own) <= 1100, `seller-summary.css is ${gzip(own)} bytes gzipped; the docs say about 1.1 kB`);
  assert.ok((own + badge).length <= 4150, `both sheets are ${(own + badge).length} bytes minified; the docs say about 4.0 kB`);
  assert.ok(gzip(own + badge) <= 1300, `both sheets are ${gzip(own + badge)} bytes gzipped; the docs say about 1.3 kB`);
});

test("cost: the component ships no JavaScript", () => {
  for (const file of ["src/astro/ui/SellerSummary.astro", "src/astro/ui/ProgramBadge.astro"]) {
    const [, , template = ""] = read(file).split(/^---$/m);
    assert.doesNotMatch(template, /<script\b/i, `${file} has a <script>`);
    assert.doesNotMatch(template, /\bclient:/, `${file} hydrates something`);
  }
});
