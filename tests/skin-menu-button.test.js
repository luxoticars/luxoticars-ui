import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("menu-button CSS lives under src/styles/skin/", () => {
  assert.equal(existsSync(join(root, "src/styles/menu-button.css")), false);
  const css = read("src/styles/skin/menu-button.css");
  for (const selector of [".menu-button {", ".menu-button__button", ".menu-button__menu", ".menu-button__item", ".menu-button__badge", ".menu-button--end"]) {
    assert.ok(css.includes(selector), `${selector} is styled`);
  }
});

test("package exports the Skin path, the back-compat alias and the behaviour script, each typed", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/skin/menu-button.css"], "./src/styles/skin/menu-button.css");
  assert.equal(exports["./styles/menu-button.css"], "./src/styles/skin/menu-button.css");
  assert.deepEqual(exports["./scripts/menu-button"], {
    types: "./src/scripts/menu-button.d.ts",
    default: "./src/scripts/menu-button.js",
  });
});

test("the Astro component imports the Skin stylesheet", () => {
  assert.match(read("src/astro/ui/MenuButton.astro"), /styles\/skin\/menu-button\.css/);
});

test("the Skin story lives under stories/skin/ with a Skin/ title and loads the Skin path", () => {
  const src = read("stories/skin/menu-button.stories.ts");
  assert.match(src, /title:\s*["']Skin\/menu-button["']/);
  assert.match(src, /styles\/skin\/menu-button\.css/);
  assert.match(src, /scripts\/menu-button/);
});
