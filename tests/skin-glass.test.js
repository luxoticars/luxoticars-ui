import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const tokens = read("src/styles/tokens.css");
const glass = read("src/styles/skin/glass.css");

/* Body of the first rule whose selector line matches. */
const block = (selector) => {
  const at = tokens.indexOf(selector);
  assert.notEqual(at, -1, `${selector} block not found`);
  const open = tokens.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < tokens.length; i++) {
    if (tokens[i] === "{") depth++;
    if (tokens[i] === "}" && --depth === 0) return tokens.slice(open + 1, i);
  }
  throw new Error(`${selector} block not closed`);
};
const value = (body, name) => body.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

test("package exports skin/glass.css", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/skin/glass.css"], "./src/styles/skin/glass.css");
});

test(":root declares the theme-independent glass numbers", () => {
  const root = block(":root {");
  for (const name of ["--lux-glass-opacity", "--lux-glass-blur", "--lux-glass-saturate", "--lux-glass-shadow", "--lux-glass-grain"]) {
    assert.ok(value(root, name), `${name} missing from :root`);
  }
});

/* The sheen and hairline change with the theme. Every block that sets a
   theme must set both, or a nested theme keeps the other theme's values. */
test("every theme block sets the glass highlight and line, light and dark differ", () => {
  const blocks = {
    root: block(":root {"),
    light: block('[data-theme="light"] {'),
    darkMedia: block(':root:not([data-theme="light"]) {'),
    dark: block('[data-theme="dark"] {'),
  };
  for (const [name, body] of Object.entries(blocks)) {
    assert.ok(value(body, "--lux-glass-highlight"), `--lux-glass-highlight missing in ${name}`);
    assert.ok(value(body, "--lux-glass-line"), `--lux-glass-line missing in ${name}`);
  }
  assert.equal(value(blocks.root, "--lux-glass-highlight"), value(blocks.light, "--lux-glass-highlight"));
  assert.equal(value(blocks.darkMedia, "--lux-glass-highlight"), value(blocks.dark, "--lux-glass-highlight"));
  assert.notEqual(value(blocks.light, "--lux-glass-highlight"), value(blocks.dark, "--lux-glass-highlight"));
});

test("glass mixes its tint at the element, never a composed token", () => {
  assert.match(glass, /\.glass\s*\{/);
  assert.match(glass, /color-mix\(in oklch, var\(--_tint\) var\(--_opacity\), transparent\)/);
  assert.doesNotMatch(tokens, /--lux-glass-[a-z-]+:\s*color-mix/);
});

test("glass falls back to a solid surface", () => {
  assert.match(glass, /@supports not \(\(-webkit-backdrop-filter: blur\(1px\)\) or \(backdrop-filter: blur\(1px\)\)\)/);
  assert.match(glass, /@media \(prefers-reduced-transparency: reduce\)/);
});

test("glass story lives under stories/skin/ with a Skin/ title", () => {
  const src = read("stories/skin/glass.stories.ts");
  assert.match(src, /title:\s*["']Skin\/glass["']/);
  assert.match(src, /styles\/skin\/glass\.css/);
});
