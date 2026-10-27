// Marko tags keep their own stylesheet, forked from the shared one the Astro and
// HTML renderers use. A fork starts with a stamp naming its source and a hash of
// it, so a change to the source fails `npm test` until someone has looked at the
// fork. Re-stamping without edits is fine; the point is that it was reviewed.
//
//   node scripts/style-forks.mjs --stamp lx-logo    after reviewing, record the hash
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const STAMP = /Forked from (\S+) \[source-hash: ([0-9a-f]{12}|none)\]/;

/** Hash of a stylesheet that ignores comments and whitespace. */
export function hashSource(css) {
  const normal = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normal).digest("hex").slice(0, 12);
}

const classes = (css) =>
  new Set([...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1]));

/**
 * Every stylesheet of every tag under src/marko, one grouping level deep. Each
 * must carry a stamp; one with no shared source says `Forked from none
 * [source-hash: none]`, so a missing stamp is always an error.
 */
export function findForkFiles(marko = join(root, "src/marko")) {
  const out = [];
  const visit = (dir, depth) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "tags") continue;
      const path = join(dir, entry.name);
      for (const css of readdirSync(path).filter((f) => f.endsWith(".css"))) out.push(join(path, css));
      if (depth < 1) visit(path, depth + 1);
    }
  };
  visit(marko, 0);
  return out;
}

/** What is wrong with each fork: a missing stamp, or a source that moved on. */
export function checkForks(files = findForkFiles()) {
  const problems = [];
  for (const file of files) {
    const css = readFileSync(file, "utf8");
    const rel = file.slice(root.length);
    const stamp = css.match(STAMP);
    if (!stamp) {
      problems.push(`${rel}: no "Forked from <source> [source-hash: …]" stamp. Add one ("none" if it has no shared source).`);
      continue;
    }
    const [, source, hash] = stamp;
    if (hash === "none" || source === "none") continue;
    if (!existsSync(join(root, source))) {
      problems.push(`${rel}: source ${source} no longer exists.`);
      continue;
    }
    const sourceCss = readFileSync(join(root, source), "utf8");
    if (hashSource(sourceCss) === hash) continue;
    const prefix = /(^|\/)(lx-[\w-]+)\/[\w.-]+\.css$/.exec(rel)?.[2];
    const own = classes(css);
    const theirs = classes(sourceCss);
    const bem = (name) => (prefix && name === prefix.slice(3) ? prefix : name.replace(/^([\w]+)(?=__|--|$)/, (b) => (b === prefix?.slice(3) ? prefix : b)));
    const missing = [...theirs].filter((c) => !own.has(bem(c)));
    problems.push(
      `${rel}: ${source} changed since this fork was stamped.\n` +
        `  Port what applies to the Marko tag, then run: node scripts/style-forks.mjs --stamp ${prefix ?? "<tag>"}\n` +
        (missing.length ? `  Classes in the source but not in the fork: ${missing.map((c) => "." + c).join(" ")}\n` : ""),
    );
  }
  return problems;
}

/** Group folders only group: an index.marko in one would turn it into a tag. */
export function checkGroupFolders(marko = join(root, "src/marko")) {
  const problems = [];
  const visit = (dir) => {
    const dirs = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== "tags");
    const tagChildren = dirs.filter((e) => existsSync(join(dir, e.name, "index.marko")));
    if (dir !== marko && existsSync(join(dir, "index.marko")) && tagChildren.length) {
      problems.push(`${dir.slice(root.length)} has an index.marko and tag folders inside: it is a tag now, so they are not found. Remove index.marko or move them.`);
    }
    for (const e of dirs) if (dir === marko) visit(join(dir, e.name));
  };
  visit(marko);
  return problems;
}

function stamp(tag) {
  const files = findForkFiles().filter((f) => f.includes(`/${tag}/`) && STAMP.test(readFileSync(f, "utf8")));
  if (!files.length) throw new Error(`No stamped stylesheet in ${tag} under src/marko`);
  for (const file of files) restamp(tag, file);
}

function restamp(tag, file) {
  const css = readFileSync(file, "utf8");
  const match = css.match(STAMP);
  const hash = hashSource(readFileSync(join(root, match[1]), "utf8"));
  writeFileSync(file, css.replace(STAMP, `Forked from ${match[1]} [source-hash: ${hash}]`));
  console.log(`${tag}: stamped ${file.slice(root.length)} ${match[1]} @ ${hash}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--stamp");
  if (i > 0) stamp(process.argv[i + 1]);
  else {
    const problems = [...checkForks(), ...checkGroupFolders()];
    if (problems.length) {
      console.error(problems.join("\n"));
      process.exit(1);
    }
    console.log("style forks ok");
  }
}
