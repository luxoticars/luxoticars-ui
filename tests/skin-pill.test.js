import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("pill CSS lives under src/styles/skin/, not src/styles/pill.css", () => {
  assert.equal(existsSync(join(root, "src/styles/pill.css")), false);
  assert.equal(existsSync(join(root, "src/styles/skin/pill.css")), true);
  const css = read("src/styles/skin/pill.css");
  assert.match(css, /\.pill\s*\{/);
  assert.match(css, /\.pill--sm/);
  assert.match(css, /\.pill--selected|aria-current/);
});

test("package exports Skin path and back-compat alias for pill.css", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/skin/pill.css"], "./src/styles/skin/pill.css");
  assert.equal(exports["./styles/pill.css"], "./src/styles/skin/pill.css");
});

test("Astro Logo story is under Components/", () => {
  const src = read("stories/Logo.stories.ts");
  assert.match(src, /title:\s*["']Components\/Logo["']/);
  assert.doesNotMatch(src, /title:\s*["']Logo["']/);
});

test("pill story lives under stories/skin/ with Skin/ title", () => {
  assert.equal(existsSync(join(root, "stories/pill.stories.ts")), false);
  assert.equal(existsSync(join(root, "stories/skin/pill.stories.ts")), true);
  const src = read("stories/skin/pill.stories.ts");
  assert.match(src, /title:\s*["']Skin\/pill["']/);
  assert.match(src, /styles\/skin\/pill\.css/);
  assert.doesNotMatch(src, /title:\s*["']Styles\/pill["']/);
});
