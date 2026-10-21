import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/* Each stylesheet keeps a literal fallback so it renders without tokens.css.
   Those copies must stay equal to the token, or an app without tokens.css
   shows a different blue in one component. */

const read = (name) => readFileSync(new URL(`../src/styles/${name}`, import.meta.url), "utf8");
const token = read("tokens.css").match(/--lux-marque-accent:\s*([^;]+);/)?.[1];

for (const name of ["logo.css", "footer.css", "site-header.css"]) {
  test(`marque accent: ${name} falls back to the tokens.css value`, () => {
    assert.ok(token, "tokens.css should define --lux-marque-accent");
    assert.ok(
      read(name).replace(/\s+/g, " ").includes(`var(--color-marque-accent, var(--lux-marque-accent, ${token}))`),
      `${name} should read the marque accent chain ending in ${token}`,
    );
  });
}
