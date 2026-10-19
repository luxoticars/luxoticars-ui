import { test } from "node:test";
import assert from "node:assert/strict";
import { createLogo } from "../src/html/logo.js";

/* Logo.astro renders the same markup by hand, so this pins the builder's half:
   the © is lowered text, matching where logo.css draws it. */

test("the © mark is a <sub>, not a <sup>", () => {
  const html = createLogo();
  assert.match(html, /<sub class="logo__mark">&copy;<\/sub>/);
  assert.doesNotMatch(html, /<sup\b/);
});
