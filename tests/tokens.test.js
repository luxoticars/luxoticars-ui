import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const aliases = (block) => [...block.matchAll(/--color-[a-z0-9-]+: var\(--lux-[a-z0-9-]+\);/g)].map((m) => m[0]).sort();

/* A nested theme only gets its own colours if [data-theme] re-declares every
   alias @theme declares; one missing line silently keeps the root's value. */
test("[data-theme] re-declares every @theme colour alias", () => {
  const theme = css.match(/@theme \{([^}]*)\}/)[1];
  const nested = css.match(/\[data-theme\] \{([^}]*)\}/)[1];
  assert.deepEqual(aliases(nested), aliases(theme));
});
