import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/* Marko finds an installed package's tags through marko.json `exports`, but not
   a package's own: the headers use <lx-logo> with no import only because the
   tag is registered here. A tag folder with no entry fails here, not in an app. */

const root = new URL("..", import.meta.url).pathname;
const registry = JSON.parse(readFileSync(join(root, "marko.json"), "utf8"));

function tagFolders(dir = join(root, "src/marko"), depth = 0) {
  const found = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === "tags" || e.name.startsWith(".")) continue;
    const path = join(dir, e.name);
    if (e.name.startsWith("lx-") && existsSync(join(path, "index.marko"))) found.push({ name: e.name, path });
    else if (depth < 1) found.push(...tagFolders(path, depth + 1));
  }
  return found;
}

test("every lx- tag folder is registered in marko.json and points at its index.marko", () => {
  for (const { name, path } of tagFolders()) {
    const entry = registry[`<${name}>`];
    assert.ok(entry, `<${name}> is not in marko.json`);
    assert.equal(join(root, entry.template), join(path, "index.marko"), `<${name}> template path`);
  }
});

test("every registered tag exists", () => {
  for (const [key, entry] of Object.entries(registry).filter(([k]) => k.startsWith("<"))) {
    assert.ok(existsSync(join(root, entry.template)), `${key}: ${entry.template} does not exist`);
  }
});

/* Storybook builds Marko with the tags API, which rejects `$` scriptlets.
   That build runs only on main, so a scriptlet reaches production before CI
   sees it. This catches the same failure in `npm test`. */
function markoFiles(dir) {
  const found = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const path = join(dir, e.name);
    if (e.isDirectory()) found.push(...markoFiles(path));
    else if (e.name.endsWith(".marko")) found.push(path);
  }
  return found;
}

test("marko templates use the tags API, not $ scriptlets", () => {
  for (const file of markoFiles(join(root, "src/marko"))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // `${Tag}` is a dynamic tag, which the tags API allows. A scriptlet is `$` not followed by `{`.
      assert.doesNotMatch(
        line,
        /^\s*\$(?!\{)/,
        `${file}:${i + 1} uses a $ scriptlet, which the tags API rejects`,
      );
    });
  }
});
