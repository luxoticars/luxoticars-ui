import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { stateFlagSlug } from "../src/utils/state-flag.js";

// The spellings the dash writes to `location_state`.
const FLAGGED_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Perak", "Perlis", "Pulau Pinang",
  "Sabah", "Sarawak", "Selangor", "Terengganu", "W.P. Kuala Lumpur", "W.P. Labuan", "W.P. Putrajaya",
];

test("every flagged state names a flag file that ships", () => {
  for (const state of FLAGGED_STATES) {
    const slug = stateFlagSlug(state);
    assert.ok(slug, state);
    assert.ok(existsSync(new URL(`../src/flags/states/${slug}.svg`, import.meta.url)), `${state}: ${slug}.svg`);
  }
});

test("Kuala Lumpur uses the Federal Territory flag", () => {
  assert.equal(stateFlagSlug("W.P. Kuala Lumpur"), "wilayah_persekutuan");
});

test("no flag for Pahang, an unknown spelling or no state", () => {
  for (const state of ["Pahang", "Kuala Lumpur", "selangor", "", null, undefined]) {
    assert.equal(stateFlagSlug(state), undefined, String(state));
  }
});
