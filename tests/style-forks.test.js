import { test } from "node:test";
import assert from "node:assert/strict";
import { checkForks, checkGroupFolders, hashSource } from "../scripts/style-forks.mjs";

/* The Marko tags fork their CSS from the shared stylesheets. On failure the
   message says which source moved and how to re-stamp once it is reviewed. */

test("every Marko style.css is stamped against the current shared source", () => {
  assert.deepEqual(checkForks(), []);
});

test("grouping folders under src/marko have no index.marko of their own", () => {
  assert.deepEqual(checkGroupFolders(), []);
});

test("the hash ignores comments and whitespace but not rules", () => {
  assert.equal(hashSource("a { b: c }"), hashSource("/* x */ a {\n  b: c\n}"));
  assert.notEqual(hashSource("a { b: c }"), hashSource("a { b: d }"));
});
