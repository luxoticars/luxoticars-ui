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

test("every stylesheet in a tag folder is checked, stamped or not", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { findForkFiles } = await import("../scripts/style-forks.mjs");
  const marko = mkdtempSync(join(tmpdir(), "marko-"));
  const tag = join(marko, "group", "lx-x");
  mkdirSync(tag, { recursive: true });
  writeFileSync(join(tag, "base.css"), "/* Forked from src/styles/logo.css [source-hash: none] */");
  writeFileSync(join(tag, "mobile.css"), ".lx-x--mobile {}");
  assert.deepEqual(
    findForkFiles(marko).map((f) => f.slice(marko.length + 1)).sort(),
    ["group/lx-x/base.css", "group/lx-x/mobile.css"],
  );
});
