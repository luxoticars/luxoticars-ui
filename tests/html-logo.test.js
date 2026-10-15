import { test } from "node:test";
import assert from "node:assert/strict";
import { createLogo } from "../src/html/logo.js";

/* Logo.astro renders the same markup by hand, so this pins the builder's half:
   the © is raised text, matching where logo.css draws it. */

test("the © mark is a <sup>, not a <sub>", () => {
  const html = createLogo();
  assert.match(html, /<sup class="logo__mark">&copy;<\/sup>/);
  assert.doesNotMatch(html, /<sub\b/);
});
