import assert from "node:assert/strict";
import { test } from "node:test";
import { markoSnippet, tagNameFromFile } from "../.storybook-marko/marko-source.ts";

test("tagNameFromFile: a folder's stories.ts is the folder's tag; a flat story file is its own name", () => {
  assert.equal(tagNameFromFile("./src/marko/lx-logo/stories.ts"), "lx-logo");
  assert.equal(tagNameFromFile("./stories-marko/price-filter.stories.ts"), "price-filter");
  assert.equal(tagNameFromFile(undefined), undefined);
});

test("markoSnippet: attributes in concise syntax; true is bare, unset and functions are left out", () => {
  assert.equal(
    markoSnippet("lx-logo", { siteTitle: "Acme", accent: true, variant: undefined, onClick: () => {}, size: 24, hidden: false }),
    'lx-logo siteTitle="Acme" accent size=24 hidden=false',
  );
});

test("markoSnippet: objects are JS literals, and a long tag wraps one attribute per line", () => {
  const snippet = markoSnippet("lx-text-range", {
    minField: { label: "Min", value: "" },
    maxField: { label: "Max", "data-x": 1 },
    prefixLabel: "$",
  });
  assert.equal(
    snippet,
    'lx-text-range\n  ,minField={ label: "Min", value: "" }\n  ,maxField={ label: "Max", "data-x": 1 }\n  ,prefixLabel="$"',
  );
});

test("markoSnippet: circular values, class instances and functions are left out, not recursed into", () => {
  const circular = { name: "x" };
  circular.self = circular;
  class Template {}
  assert.equal(
    markoSnippet("lx-site-header", { entry: new Template(), loop: circular, onClick: () => {}, siteTitle: "Acme" }),
    'lx-site-header loop={ name: "x" } siteTitle="Acme"',
  );
});
