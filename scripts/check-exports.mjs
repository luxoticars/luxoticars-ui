// Guards the contract consumers depend on: every public subpath in
// package.json#exports resolves to a file that ships in `files`, and every
// JS entry has a `types` entry whose file exists. Run before tagging a release.
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const errors = [];

const shipped = (target) =>
  (pkg.files ?? []).some((f) => target === `./${f}` || target.startsWith(`./${f}/`));

function check(subpath, target) {
  if (typeof target !== "string") return;
  if (!shipped(target)) errors.push(`${subpath}: ${target} is outside "files"`);
  if (target.includes("*")) {
    const dir = join(root, target.slice(0, target.indexOf("*")));
    if (!existsSync(dir)) errors.push(`${subpath}: ${relative(root, dir)} does not exist`);
  } else if (!existsSync(join(root, target))) {
    errors.push(`${subpath}: ${target} does not exist`);
  }
}

for (const [subpath, entry] of Object.entries(pkg.exports)) {
  if (typeof entry === "string") {
    check(subpath, entry);
    continue;
  }
  check(subpath, entry.default);
  check(subpath, entry.types);
  if (entry.default?.endsWith(".js") && !entry.types) {
    errors.push(`${subpath}: JS entry without a "types" entry`);
  }
}

if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) {
  errors.push(`version "${pkg.version}" is not plain MAJOR.MINOR.PATCH`);
}

if (errors.length) {
  console.error(`exports check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`exports check passed (${Object.keys(pkg.exports).length} subpaths, v${pkg.version})`);
