import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join, sep } from "node:path";
import { ASTRO_STORY_GLOBS, HOST_STORY_GLOBS } from "../.storybook/story-globs.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/*
  A glob from story-globs.ts ("../stories/...", relative to a config dir) as a
  RegExp over repo-relative paths. Only the syntax the lists use: `**\/` (any
  number of folders), `*` (within one path segment) and literal characters.
*/
const globToRegExp = (glob) => {
  const rel = glob.replace(/^\.\.\//, "");
  let source = "";
  for (let i = 0; i < rel.length; i += 1) {
    if (rel.startsWith("**/", i)) {
      source += "(?:[^/]+/)*";
      i += 2;
    } else if (rel[i] === "*") {
      source += "[^/]*";
    } else {
      source += rel[i].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
};

const matchesAny = (globs, file) => globs.some((glob) => globToRegExp(glob).test(file));

const storyFiles = readdirSync(join(root, "stories"), { recursive: true })
  .map((p) => `stories/${p.split(sep).join("/")}`)
  .filter((p) => p.endsWith(".stories.ts"))
  .sort();

/** The meta title: the first `title:` after `export default {`. */
const metaTitle = (file) => {
  const match = read(file).match(/export default\s*\{[\s\S]*?\btitle:\s*["']([^"']+)["']/);
  assert.ok(match, `${file}: no title in export default`);
  return match[1];
};

test("globToRegExp handles the patterns the lists use", () => {
  assert.ok(globToRegExp("../stories/create*.stories.ts").test("stories/createLogo.stories.ts"));
  assert.ok(!globToRegExp("../stories/create*.stories.ts").test("stories/ui/createLogo.stories.ts"));
  assert.ok(globToRegExp("../stories/skin/**/*.stories.ts").test("stories/skin/pill.stories.ts"));
  assert.ok(globToRegExp("../stories/skin/**/*.stories.ts").test("stories/skin/a/b.stories.ts"));
  assert.ok(globToRegExp("../stories/ui/*.stories.ts").test("stories/ui/Button.stories.ts"));
  assert.ok(!globToRegExp("../stories/ui/*.stories.ts").test("stories/ui/x/Button.stories.ts"));
  assert.ok(!globToRegExp("../stories/Button.stories.ts").test("stories/ui/Button.stories.ts"));
});

test("story glob lists are exactly the spec's", () => {
  assert.deepEqual(HOST_STORY_GLOBS, [
    "../stories/create*.stories.ts",
    "../stories/Button.stories.ts",
    "../stories/skin/**/*.stories.ts",
  ]);
  assert.deepEqual(ASTRO_STORY_GLOBS, [
    "../stories/Footer.stories.ts",
    "../stories/Logo.stories.ts",
    "../stories/SectionHead.stories.ts",
    "../stories/SiteHeader.stories.ts",
    "../stories/ui/*.stories.ts",
  ]);
});

test("every story file is picked up by exactly one Storybook", () => {
  assert.ok(storyFiles.length > 0, "no story files found");
  for (const file of storyFiles) {
    const host = matchesAny(HOST_STORY_GLOBS, file);
    const astro = matchesAny(ASTRO_STORY_GLOBS, file);
    assert.ok(host || astro, `${file} matches neither the host nor the Astro globs`);
    assert.ok(!(host && astro), `${file} matches both the host and the Astro globs`);
  }
});

test("every glob picks up at least one story file", () => {
  for (const glob of [...HOST_STORY_GLOBS, ...ASTRO_STORY_GLOBS]) {
    assert.ok(storyFiles.some((file) => globToRegExp(glob).test(file)), `${glob} matches no story file`);
  }
});

test("host stories are HTML/ or Skin/; Astro stories are Components/", () => {
  for (const file of storyFiles) {
    const title = metaTitle(file);
    if (matchesAny(HOST_STORY_GLOBS, file)) {
      assert.match(title, /^(HTML|Skin)\//, `${file}: host story titled ${title}`);
    } else {
      assert.match(title, /^Components\//, `${file}: Astro story titled ${title}`);
    }
  }
});

test("the sidebar titles are the spec's", () => {
  const titles = (globs) => storyFiles.filter((f) => matchesAny(globs, f)).map(metaTitle).sort();
  assert.deepEqual(titles(HOST_STORY_GLOBS), [
    "HTML/createButton",
    "HTML/createDialog",
    "HTML/createFooter",
    "HTML/createListingCard",
    "HTML/createLogo",
    "Skin/pill",
  ]);
  assert.deepEqual(titles(ASTRO_STORY_GLOBS), [
    "Components/Button",
    "Components/Dialog",
    "Components/Footer",
    "Components/Logo",
    "Components/ProgramBadge",
    "Components/SectionHead",
    "Components/SiteHeader",
  ]);
});

test("the host Storybook reads the host globs and composes Astro and Marko", () => {
  const main = read(".storybook/main.ts");
  assert.match(main, /import \{ HOST_STORY_GLOBS \} from "\.\/story-globs";/);
  assert.match(main, /stories: HOST_STORY_GLOBS,/);
  assert.match(main, /astro: \{\s*title: "Astro",\s*url: configType === "DEVELOPMENT" \? "http:\/\/localhost:6008" : "\.\/astro",/);
  assert.match(main, /marko: \{\s*title: "Marko",\s*url: configType === "DEVELOPMENT" \? "http:\/\/localhost:6007" : "\.\/marko",/);
  assert.match(main, /renderMode: "static"/);
});

test("the Astro Storybook reads the Astro globs and has no refs", () => {
  const main = read(".storybook-astro/main.ts");
  assert.match(main, /import \{ ASTRO_STORY_GLOBS \} from "\.\.\/\.storybook\/story-globs";/);
  assert.match(main, /stories: ASTRO_STORY_GLOBS,/);
  assert.doesNotMatch(main, /\brefs\s*:/);
  assert.match(main, /name: "@storybook-astro\/framework"/);
  assert.match(main, /renderMode: "static"/);
  assert.match(main, /tailwindcss\(\)/);
});

test("the Astro Storybook's preview is a copy of the host's", () => {
  for (const file of ["preview.ts", "preview.css", "ThemeFrame.astro"]) {
    assert.equal(read(`.storybook-astro/${file}`), read(`.storybook/${file}`), file);
  }
});

test("the Marko Storybook's comment names the host as the one composing it", () => {
  const main = read(".storybook-marko/main.ts");
  assert.match(main, /the host Storybook composes it through `refs`/);
  assert.doesNotMatch(main, /the Astro Storybook composes it/);
});

test("Storybook scripts: ports 6006 / 6008 / 6007 and a three-part build", () => {
  const { scripts } = JSON.parse(read("package.json"));
  assert.equal(scripts.storybook, "storybook dev -p 6006");
  assert.equal(scripts["storybook:astro"], "storybook dev -p 6008 -c .storybook-astro");
  assert.equal(scripts["storybook:marko"], "storybook dev -p 6007 -c .storybook-marko");
  assert.equal(
    scripts["build-storybook"],
    "storybook build && storybook build -c .storybook-astro -o storybook-static/astro && storybook build -c .storybook-marko -o storybook-static/marko",
  );
});

test("astro check covers the Astro Storybook's config", () => {
  assert.match(read("tsconfig.json"), /"\.storybook-astro"/);
});

test("Vitest runs one story-test project per Storybook", () => {
  assert.match(
    read("vitest.config.ts"),
    /projects: \["vitest\.host\.config\.ts", "vitest\.astro\.config\.ts", "vitest\.marko\.config\.ts"\]/,
  );
  const host = read("vitest.host.config.ts");
  assert.match(host, /storybookTest\(\{ configDir: "\.storybook" \}\)/);
  assert.match(host, /name: "storybook-host"/);
  assert.match(host, /withoutPlugin\(config\.plugins, "cjs-esm-interop"\)/);
  const astro = read("vitest.astro.config.ts");
  assert.match(astro, /storybookTest\(\{ configDir: "\.storybook-astro" \}\)/);
  assert.match(astro, /name: "storybook-astro"/);
  assert.match(astro, /fileParallelism: false/);
  assert.match(astro, /withoutPlugin\(config\.plugins, "cjs-esm-interop"\)/);
  assert.match(read("vitest.marko.config.ts"), /storybookTest\(\{ configDir: "\.storybook-marko" \}\)/);
});
