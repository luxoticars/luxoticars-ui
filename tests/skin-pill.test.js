import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
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

/*
  Load the pill story module in Node: drop its CSS import (Node cannot import
  CSS) and let Node strip the TypeScript. `render` touches `document`, but
  nothing here calls it; only the story objects are read.
*/
const loadPillStories = async () => {
  const src = read("stories/skin/pill.stories.ts").replace(/^import\s+["'][^"']+\.css["'];?[ \t]*$/m, "");
  const file = join(mkdtempSync(join(tmpdir(), "pill-story-")), "pill.stories.mts");
  writeFileSync(file, src);
  return import(pathToFileURL(file).href);
};

const pillImport = 'import "@luxoticars/ui/styles/skin/pill.css";';

test("pill Show code (Default) is the CSS import and the markup, not args", async () => {
  const { Default } = await loadPillStories();
  const { language, code } = Default.parameters.docs.source;
  assert.equal(language, "html");
  assert.ok(code.includes(pillImport), code);
  assert.ok(code.includes('<a class="pill" href="#">Coupe</a>'), code);
  assert.ok(code.includes('<a class="pill" href="#" aria-current="true">SUV</a>'), code);
  assert.ok(code.includes('class="pill pill--selected"'), code);
  assert.ok(!code.includes("pill--sm"), code);
  assert.ok(!code.includes("args"), code);
});

test("pill Show code (Small) uses pill--sm", async () => {
  const { Small } = await loadPillStories();
  const { language, code } = Small.parameters.docs.source;
  assert.equal(language, "html");
  assert.ok(code.includes(pillImport), code);
  assert.ok(code.includes('<a class="pill pill--sm" href="#">Coupe</a>'), code);
  assert.ok(code.includes('<a class="pill pill--sm" href="#" aria-current="true">SUV</a>'), code);
  assert.ok(code.includes('class="pill pill--sm pill--selected"'), code);
  assert.ok(!code.includes("args"), code);
});

test("pill render and Show code share one markup helper", () => {
  const src = read("stories/skin/pill.stories.ts");
  assert.match(src, /const pillMarkup = /);
  assert.match(src, /const pillSource = /);
  assert.match(src, /innerHTML = pillMarkup\(size\)/);
  assert.match(src, /code: pillSource\("default"\)/);
  assert.match(src, /code: pillSource\("sm"\)/);
});
