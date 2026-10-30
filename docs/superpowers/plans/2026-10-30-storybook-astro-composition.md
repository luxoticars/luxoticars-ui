# Storybook shell host Astro+Marko composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split today's single Astro Storybook into a shell host (`HTML/*`, `Skin/*` at the sidebar root) that composes two refs, **Astro** (`Components/*` from `.storybook-astro/`) and **Marko** (unchanged), and make Skin/pill's Show code show the CSS import and markup instead of the args object.

**Architecture:** One shared module, `.storybook/story-globs.ts`, exports the host and Astro story glob lists; `.storybook/main.ts` and the new `.storybook-astro/main.ts` read their `stories` from it, and a `node --test` guard test reads the same lists to prove every `stories/**/*.stories.ts` lands in exactly one Storybook with the right title prefix. The host keeps `@storybook-astro/framework` (HTML/Skin stories return their own DOM node) and gains `refs.astro` beside `refs.marko`; the build writes host → `storybook-static/`, Astro → `storybook-static/astro/`, Marko → `storybook-static/marko/`. Vitest gets one story-test project per Storybook.

**Tech Stack:** Storybook 10 (`@storybook-astro/framework`, `@storybook/marko-vite`, composition `refs`), `@storybook/addon-vitest` + Vitest 4 browser mode (Playwright Chromium), Node's built-in test runner (`node --test`, Node 24 type stripping to import the `.ts` glob module), Tailwind v4 Vite plugin.

## Global Constraints

- Spec (authoritative): `docs/superpowers/specs/2026-10-30-storybook-astro-composition-design.md`
- HTML and Skin stay on the host (`.storybook/`); the Astro ref (`.storybook-astro/`) holds `Components/*` only.
- No story file moves on disk. Every story keeps its current path under `stories/`; globs alone decide which Storybook picks it up.
- No Marko story title renames (`Components/logo` etc. stay kebab-case); no change to `.storybook-marko/` beyond its header comment.
- Do not move `src/astro/Logo.astro` or any component file.
- No visual change to pill or any component CSS (`src/styles/**` untouched).
- No changeset: nothing in the published package (`src/`, `exports`) changes.
- Host globs, exactly: `"../stories/create*.stories.ts"`, `"../stories/Button.stories.ts"`, `"../stories/skin/**/*.stories.ts"`.
- Astro globs, exactly: `"../stories/Footer.stories.ts"`, `"../stories/Logo.stories.ts"`, `"../stories/SectionHead.stories.ts"`, `"../stories/SiteHeader.stories.ts"`, `"../stories/ui/*.stories.ts"`.
- Refs: `astro` → title `"Astro"`, url `http://localhost:6008` in development, `./astro` in the static build; `marko` → title `"Marko"`, `http://localhost:6007` / `./marko`.
- Scripts, exactly: `"storybook": "storybook dev -p 6006"`, `"storybook:astro": "storybook dev -p 6008 -c .storybook-astro"`, `"storybook:marko": "storybook dev -p 6007 -c .storybook-marko"`, `"build-storybook": "storybook build && storybook build -c .storybook-astro -o storybook-static/astro && storybook build -c .storybook-marko -o storybook-static/marko"`.
- Vitest: `projects: ["vitest.host.config.ts", "vitest.astro.config.ts", "vitest.marko.config.ts"]`; host project name `storybook-host`, Astro project name stays `storybook-astro`.
- `.github/workflows/storybook.yml` is not changed.
- Two Button files: `stories/Button.stories.ts` is `HTML/createButton` (host); `stories/ui/Button.stories.ts` is `Components/Button` (Astro). Do not confuse them.
- No new dependencies (the glob matcher in the guard test is hand-rolled).

## File map

| File | Role |
| ---- | ---- |
| `.storybook/story-globs.ts` (new) | `HOST_STORY_GLOBS` and `ASTRO_STORY_GLOBS`, the single source for both configs and the guard test |
| `tests/storybook-globs.test.js` (new) | Guard test: every story in exactly one Storybook, title prefixes, exact sidebar titles; later also pins config wiring, scripts and Vitest projects |
| `stories/skin/pill.stories.ts` | `pillMarkup` / `pillSource` helpers; per-story `parameters.docs.source` |
| `tests/skin-pill.test.js` | Extended: loads the story module and checks Show code for Default and Small |
| `.storybook/main.ts` | Host: `stories: HOST_STORY_GLOBS`, `refs.astro` + `refs.marko`, comment update |
| `.storybook-astro/main.ts` (new) | Astro Storybook: `stories: ASTRO_STORY_GLOBS`, no `refs` |
| `.storybook-astro/preview.ts`, `preview.css`, `ThemeFrame.astro` (new) | Byte-for-byte copies of the host's |
| `.storybook-marko/main.ts` | Header comment only |
| `tsconfig.json` | Add `.storybook-astro` to `include` so `astro check` still type-checks the copied preview |
| `package.json` | `storybook:astro` script; three-part `build-storybook` |
| `vitest.host.config.ts` (new) | `storybook-host` project, `configDir: ".storybook"` |
| `vitest.astro.config.ts` | `configDir: ".storybook-astro"` |
| `vitest.config.ts` | Three projects |
| `README.md`, `CONTRIBUTING.md`, `CLAUDE.md` | Three Storybooks, ports, sidebar layout, story-placement rule, theme toolbar note, new artefact paths |

---

### Task 1: Shared story globs + guard test

**Files:**
- Create: `.storybook/story-globs.ts`
- Create: `tests/storybook-globs.test.js`

**Interfaces:**
- Consumes: nothing (story files and titles as they are on `442d2e6`).
- Produces: `.storybook/story-globs.ts` exporting `HOST_STORY_GLOBS: string[]` and `ASTRO_STORY_GLOBS: string[]`, globs written relative to a config directory (`"../stories/..."`). Configs import it extensionless (`"./story-globs"`, `"../.storybook/story-globs"`); the Node test imports it as `"../.storybook/story-globs.ts"` (Node 24 strips the types, so the module must stay erasable-syntax only: no enums, no `namespace`, no parameter properties). The test file defines `read(p)` and is appended to by Tasks 3 and 4.

- [ ] **Step 1: Write the failing test**

Create `tests/storybook-globs.test.js`:

```js
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
```

Note: inside the block comment, `**\/` is written with a backslash so the `*/` does not close the comment. Keep it.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/storybook-globs.test.js`

Expected: FAIL — `ERR_MODULE_NOT_FOUND` for `.storybook/story-globs.ts`.

- [ ] **Step 3: Write the shared glob module**

Create `.storybook/story-globs.ts`:

```ts
/*
  Which Storybook picks up which story file under stories/. Files never move;
  these globs alone decide. The host (.storybook/main.ts) and the Astro
  Storybook (.storybook-astro/main.ts) both import from here, and
  tests/storybook-globs.test.js checks every story matches exactly one list.
  Paths are relative to a config directory, so "../stories" works from both.
*/
export const HOST_STORY_GLOBS = [
  "../stories/create*.stories.ts", // HTML/createDialog, createFooter, createListingCard, createLogo
  "../stories/Button.stories.ts", // HTML/createButton
  "../stories/skin/**/*.stories.ts", // Skin/*
];

export const ASTRO_STORY_GLOBS = [
  "../stories/Footer.stories.ts",
  "../stories/Logo.stories.ts",
  "../stories/SectionHead.stories.ts",
  "../stories/SiteHeader.stories.ts",
  "../stories/ui/*.stories.ts",
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/storybook-globs.test.js`

Expected: PASS (6 tests). Node may print an `ExperimentalWarning` about type stripping on some 24.x versions; that is fine.

Then run: `npm test`

Expected: all tests pass (the `tests/**/*.test.js` glob picks the new file up).

- [ ] **Step 5: Commit**

```bash
git add .storybook/story-globs.ts tests/storybook-globs.test.js
git commit -m "test(storybook): shared story globs and a guard that each story lands in one Storybook"
```

---

### Task 2: Skin/pill Show code

**Files:**
- Modify: `stories/skin/pill.stories.ts`
- Modify: `tests/skin-pill.test.js`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `Default.parameters.docs.source` and `Small.parameters.docs.source`, each `{ language: "html", code: string }`, where `code` = an HTML comment with `import "@luxoticars/ui/styles/skin/pill.css";` followed by the same markup `render` writes. Module-private helpers `pillMarkup(size)` and `pillSource(size)`.

- [ ] **Step 1: Write the failing tests**

In `tests/skin-pill.test.js`, replace the three import lines

```js
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
```

with

```js
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
```

and append at the end of the file:

```js

/*
  Load the pill story module in Node: drop its CSS import (Node cannot import
  CSS) and let Node strip the TypeScript. `render` touches `document`, but
  nothing here calls it; only the story objects are read.
*/
const loadPillStories = async () => {
  const src = read("stories/skin/pill.stories.ts").replace(/^import\s+["'][^"']+\.css["'];?[ \t]*$/m, "");
  const file = join(mkdtempSync(join(tmpdir(), "pill-story-")), "pill.stories.mts");
  writeFileSync(file, src);
  return import(pathToFileURL(file).href);
};

const pillImport = 'import "@luxoticars/ui/styles/skin/pill.css";';

test("pill Show code (Default) is the CSS import and the markup, not args", async () => {
  const { Default } = await loadPillStories();
  const { language, code } = Default.parameters.docs.source;
  assert.equal(language, "html");
  assert.ok(code.includes(pillImport), code);
  assert.ok(code.includes('<a class="pill" href="#">Coupe</a>'), code);
  assert.ok(code.includes('<a class="pill" href="#" aria-current="true">SUV</a>'), code);
  assert.ok(code.includes('class="pill pill--selected"'), code);
  assert.ok(!code.includes("pill--sm"), code);
  assert.ok(!code.includes("args"), code);
});

test("pill Show code (Small) uses pill--sm", async () => {
  const { Small } = await loadPillStories();
  const { language, code } = Small.parameters.docs.source;
  assert.equal(language, "html");
  assert.ok(code.includes(pillImport), code);
  assert.ok(code.includes('<a class="pill pill--sm" href="#">Coupe</a>'), code);
  assert.ok(code.includes('<a class="pill pill--sm" href="#" aria-current="true">SUV</a>'), code);
  assert.ok(code.includes('class="pill pill--sm pill--selected"'), code);
  assert.ok(!code.includes("args"), code);
});

test("pill render and Show code share one markup helper", () => {
  const src = read("stories/skin/pill.stories.ts");
  assert.match(src, /const pillMarkup = /);
  assert.match(src, /const pillSource = /);
  assert.match(src, /innerHTML = pillMarkup\(size\)/);
  assert.match(src, /code: pillSource\("default"\)/);
  assert.match(src, /code: pillSource\("sm"\)/);
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `node --test tests/skin-pill.test.js`

Expected: the 4 existing tests PASS; the 3 new tests FAIL (`Default.parameters` is undefined → TypeError; no `pillMarkup`).

- [ ] **Step 3: Rewrite the pill story**

Replace the whole of `stories/skin/pill.stories.ts` with:

```ts
/*
  A stylesheet, not a component: the story writes the markup a consumer would
  and loads `@luxoticars/ui/styles/skin/pill.css` (canonical). The older
  `@luxoticars/ui/styles/pill.css` export still aliases the same file.
*/
import "../../src/styles/skin/pill.css";

type Args = { size: "default" | "sm" };

/** The markup a consumer writes; `render` and Show code both use it, so they cannot drift. */
const pillMarkup = (size: Args["size"]) => {
  const sm = size === "sm" ? " pill--sm" : "";
  return `<a class="pill${sm}" href="#">Coupe</a>
<a class="pill${sm}" href="#" aria-current="true">SUV</a>
<a class="pill${sm}" href="#">Sedan</a>
<a class="pill${sm} pill--selected" href="#" aria-label="Remove condition Used">Used ×</a>`;
};

/**
 * Show code for one size: the stylesheet import, then the markup. Static per
 * story; changing the `size` control on the docs page does not rewrite it.
 */
const pillSource = (size: Args["size"]) =>
  `<!-- once, in your app entry or layout:
     import "@luxoticars/ui/styles/skin/pill.css"; -->
${pillMarkup(size)}`;

/**
 * `pill` is a rounded link for one choice. Put the classes on an `<a>` (or a
 * `<button>`); mark the current choice with `aria-current="true"`, or with
 * `pill--selected` when aria-current would mean the wrong thing (a link that
 * removes the filter it shows).
 *
 * ```html
 * <a class="pill" href="/search?car_type=suv">SUV</a>
 * <a class="pill pill--sm" href="…" aria-current="true">Used</a>
 * ```
 */
export default {
  title: "Skin/pill",
  tags: ["autodocs"],
  render: ({ size }: Args) => {
    const host = document.createElement("div");
    host.style.cssText = "display:flex;flex-wrap:wrap;gap:0.5rem;padding:2rem";
    host.innerHTML = pillMarkup(size);
    return host;
  },
  argTypes: { size: { control: "inline-radio", options: ["default", "sm"] } },
};

/** 44px tall: the home page's body-type row. */
export const Default = {
  args: { size: "default" },
  parameters: { docs: { source: { language: "html", code: pillSource("default") } } },
};

/** 32px: a panel of many choices, such as the search filters. */
export const Small = {
  args: { size: "sm" },
  parameters: { docs: { source: { language: "html", code: pillSource("sm") } } },
};
```

The rendered markup is byte-identical to before (same four `<a>` lines); only where it is built moved.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/skin-pill.test.js`

Expected: PASS (7 tests).

Run: `npm test`

Expected: all pass (including `tests/storybook-globs.test.js`, which still sees `Skin/pill`).

- [ ] **Step 5: Commit**

```bash
git add stories/skin/pill.stories.ts tests/skin-pill.test.js
git commit -m "docs(storybook): Skin/pill Show code shows the CSS import and markup"
```

---

### Task 3: `.storybook-astro/` + retarget the host

**Files:**
- Create: `.storybook-astro/main.ts`
- Create: `.storybook-astro/preview.ts`, `.storybook-astro/preview.css`, `.storybook-astro/ThemeFrame.astro` (copies)
- Modify: `.storybook/main.ts`
- Modify: `.storybook-marko/main.ts` (header comment only)
- Modify: `package.json` (`scripts` only)
- Modify: `tsconfig.json` (`include`)
- Modify: `tests/storybook-globs.test.js` (append)

**Interfaces:**
- Consumes: `HOST_STORY_GLOBS`, `ASTRO_STORY_GLOBS` from `.storybook/story-globs.ts` (Task 1); `read(p)` helper already in `tests/storybook-globs.test.js`.
- Produces: config dir `.storybook-astro` (used by Task 4's `vitest.astro.config.ts`); scripts `storybook:astro` and the three-part `build-storybook`; build outputs `storybook-static/index.json` (host), `storybook-static/astro/index.json` + `storybook-static/astro/astro-prerendered-stories.json`, `storybook-static/marko/index.json` (used by Tasks 5–6). Baseline copies in `/tmp/storybook-baseline/` (used by Task 6).

- [ ] **Step 1: Capture the before-baseline (before touching any config)**

The gitignored `storybook-static/` on disk may be stale, so rebuild it from the current (pre-split) config and keep a copy:

```bash
npm run build-storybook
rm -rf /tmp/storybook-baseline && mkdir -p /tmp/storybook-baseline/marko
cp storybook-static/index.json storybook-static/astro-prerendered-stories.json /tmp/storybook-baseline/
cp storybook-static/marko/index.json /tmp/storybook-baseline/marko/
npm run test:stories 2>&1 | tail -n 8 | tee /tmp/storybook-baseline/test-stories.txt
node -e 'const d=require("/tmp/storybook-baseline/index.json");console.log([...new Set(Object.values(d.entries).map(e=>e.title))].sort())'
```

Expected: the build and `test:stories` succeed (the saved tail holds the pre-split `Tests  N passed` total, used in Task 4), and the printed titles include `Components/Logo` and `Skin/pill` (not `Logo` / `Styles/pill`) alongside the other `Components/*` and `HTML/*` titles. If they still show `Logo` or `Styles/pill`, the build did not run on this branch — stop and rebuild.

- [ ] **Step 2: Write the failing tests**

Append to `tests/storybook-globs.test.js`:

```js

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
```

- [ ] **Step 3: Run tests to verify the new ones fail**

Run: `node --test tests/storybook-globs.test.js`

Expected: the 6 Task 1 tests PASS; the 6 new tests FAIL (`.storybook/main.ts` still has `stories: ["../stories/**/*.stories.ts"]`; `.storybook-astro/` does not exist → ENOENT; Marko comment still says "the Astro Storybook composes it"; no `storybook:astro` script; tsconfig has no `.storybook-astro`).

- [ ] **Step 4: Create `.storybook-astro/` by copying the host's preview files**

```bash
mkdir -p .storybook-astro
cp .storybook/preview.ts .storybook/preview.css .storybook/ThemeFrame.astro .storybook-astro/
```

Do not edit the copies (the test holds them identical; `preview.css`'s `../src` paths resolve the same from a sibling folder).

Create `.storybook-astro/main.ts`:

```ts
import type { StorybookConfig } from "@storybook-astro/framework";
import tailwindcss from "@tailwindcss/vite";
import { ASTRO_STORY_GLOBS } from "../.storybook/story-globs";

/*
  The Astro Storybook: every Astro component story (Components/*).
  `npm run build-storybook` builds it into storybook-static/astro/, and the
  host Storybook (.storybook/main.ts) composes it through `refs` as "Astro".
  In development it is its own dev server (`npm run storybook:astro`, port 6008).

  It has no `refs` of its own; only the host composes. Which story files it
  picks up is decided by the globs in .storybook/story-globs.ts.
*/
const config: StorybookConfig = {
  stories: ASTRO_STORY_GLOBS,
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      // The published Storybook is a static GitHub Pages artifact.
      renderMode: "static",
    },
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
```

- [ ] **Step 5: Retarget the host**

Replace the whole of `.storybook/main.ts` with:

```ts
import type { StorybookConfig } from "@storybook-astro/framework";
import tailwindcss from "@tailwindcss/vite";
import { HOST_STORY_GLOBS } from "./story-globs";

/*
  The host Storybook: the plain HTML builders (HTML/*) and the stylesheet-only
  Skin stories (Skin/*), at the root of the sidebar. The Astro components and
  the Marko tags are their own Storybooks, composed in through `refs`.

  Stories live in `stories/` rather than beside their components because
  `package.json#files` ships all of `src/`, and co-located stories would land
  in every consumer's node_modules. Which Storybook picks up which file is
  decided by the globs in story-globs.ts.

  The framework stays @storybook-astro/framework: the HTML and Skin stories
  return their own DOM node and skip the Astro pipeline, so no other renderer
  is needed.
*/
const config: StorybookConfig = {
  stories: HOST_STORY_GLOBS,
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  /*
    The Astro Storybook (.storybook-astro/) and the Marko Storybook
    (.storybook-marko/), composed into this one so everything shares one
    sidebar. In development each is its own dev server (`npm run
    storybook:astro`, port 6008; `npm run storybook:marko`, port 6007). In the
    static build they are built into storybook-static/astro/ and
    storybook-static/marko/, so a relative URL works both at the custom domain
    root and under a fork's /luxoticars-ui/ path.
  */
  refs: (_config, { configType }) => ({
    astro: {
      title: "Astro",
      url: configType === "DEVELOPMENT" ? "http://localhost:6008" : "./astro",
    },
    marko: {
      title: "Marko",
      url: configType === "DEVELOPMENT" ? "http://localhost:6007" : "./marko",
    },
  }),
  framework: {
    name: "@storybook-astro/framework",
    options: {
      // The published Storybook is a static GitHub Pages artifact.
      renderMode: "static",
    },
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    return config;
  },
};

export default config;
```

`.storybook/preview.ts`, `preview.css` and `ThemeFrame.astro` stay as they are (the ThemeFrame decorator is now a no-op on the host; removing it is an optional follow-up, not part of this plan).

- [ ] **Step 6: Update the Marko header comment**

In `.storybook-marko/main.ts`, replace

```ts
  storybook-static/marko/, and the Astro Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows both in one sidebar.
```

with

```ts
  storybook-static/marko/, and the host Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows it beside the HTML, Skin
  and Astro stories in one sidebar.
```

Nothing else in `.storybook-marko/` changes.

- [ ] **Step 7: Scripts and tsconfig**

In `package.json` `scripts`, replace

```json
    "storybook": "storybook dev -p 6006",
    "storybook:marko": "storybook dev -p 6007 -c .storybook-marko",
    "build-storybook": "storybook build && storybook build -c .storybook-marko -o storybook-static/marko",
```

with

```json
    "storybook": "storybook dev -p 6006",
    "storybook:astro": "storybook dev -p 6008 -c .storybook-astro",
    "storybook:marko": "storybook dev -p 6007 -c .storybook-marko",
    "build-storybook": "storybook build && storybook build -c .storybook-astro -o storybook-static/astro && storybook build -c .storybook-marko -o storybook-static/marko",
```

In `tsconfig.json`, replace

```jsonc
    "stories",
    ".storybook"
  ],
```

with

```jsonc
    "stories",
    ".storybook",
    ".storybook-astro"
  ],
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `node --test tests/storybook-globs.test.js`

Expected: PASS (12 tests).

Run: `npm test`

Expected: all pass.

- [ ] **Step 9: Build and check the three indexes**

```bash
rm -rf storybook-static
npm run build-storybook
node -e '
const t = (p) => [...new Set(Object.values(require(p).entries).map((e) => e.title))].sort();
console.log("host ", t("./storybook-static/index.json"));
console.log("astro", t("./storybook-static/astro/index.json"));
console.log("marko", t("./storybook-static/marko/index.json"));
'
ls storybook-static/astro/astro-prerendered-stories.json
```

Expected: all three builds succeed (host first, then `astro/`, then `marko/`). `host` prints exactly `HTML/createButton, HTML/createDialog, HTML/createFooter, HTML/createListingCard, HTML/createLogo, Skin/pill`; `astro` prints exactly the seven `Components/*` (Button, Dialog, Footer, Logo, ProgramBadge, SectionHead, SiteHeader); `marko` prints the same list as `/tmp/storybook-baseline/marko/index.json`; the prerendered JSON exists under `astro/`. (The full before/after diff is Task 6.)

- [ ] **Step 10: Commit**

```bash
git add .storybook/main.ts .storybook-astro .storybook-marko/main.ts package.json tsconfig.json tests/storybook-globs.test.js
git commit -m "feat(storybook): shell host composes Astro and Marko refs"
```

---

### Task 4: Vitest — one story-test project per Storybook

**Files:**
- Create: `vitest.host.config.ts`
- Modify: `vitest.astro.config.ts` (one line)
- Modify: `vitest.config.ts`
- Modify: `tests/storybook-globs.test.js` (append)

**Interfaces:**
- Consumes: config dirs `.storybook` (host) and `.storybook-astro` (Task 3); `read(p)` in the test file.
- Produces: Vitest projects `storybook-host`, `storybook-astro`, `storybook-marko` (selectable with `npx vitest run --project=<name>`, documented in Task 5).

- [ ] **Step 1: Write the failing test**

Append to `tests/storybook-globs.test.js`:

```js

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/storybook-globs.test.js`

Expected: 12 PASS, 1 FAIL (`vitest.config.ts` has two projects; `vitest.host.config.ts` missing → ENOENT).

- [ ] **Step 3: Point the Astro project at `.storybook-astro`**

In `vitest.astro.config.ts`, replace

```ts
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
```

with

```ts
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook-astro" })],
```

Everything else in that file (name `storybook-astro`, `fileParallelism: false`, the `cjs-esm-interop` removal) stays.

- [ ] **Step 4: Create the host project**

Create `vitest.host.config.ts`:

```ts
import { defineConfig } from "@storybook-astro/framework/vitest";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import type { PluginOption } from "vite";

/*
  The host Storybook's stories (HTML/*, Skin/*) as component tests
  (@storybook/addon-vitest): each renders in headless Chromium, and a story's
  play function runs and its assertions are checked. One project of
  vitest.config.ts; `npm run test:stories`. Same shape as vitest.astro.config.ts,
  because the host uses the same framework.
*/
const host = defineConfig({
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook-host",
    // Same render server as the Astro project; run files one at a time for
    // the same reason (see vitest.astro.config.ts).
    fileParallelism: false,
    browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: "chromium" }] },
  },
});

/*
  defineConfig adds "cjs-esm-interop", which rewrites CommonJS in node_modules to
  load through Node's `module.createRequire`. That suits the framework's
  Node-side tests, but the addon runs in a browser, where `module` does not exist
  and the Vitest runner fails to start. Browser mode does not need it.
*/
const withoutPlugin = (plugins: PluginOption, name: string): PluginOption =>
  Array.isArray(plugins)
    ? plugins.map((plugin) => withoutPlugin(plugin, name)).filter((plugin) => plugin !== null)
    : plugins && typeof plugins === "object" && "name" in plugins && plugins.name === name
      ? null
      : plugins;

export default async (env: Parameters<typeof host>[0]) => {
  const config = await host(env);
  config.plugins = withoutPlugin(config.plugins, "cjs-esm-interop");
  return config;
};
```

- [ ] **Step 5: Three projects**

Replace the whole of `vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";

// One project per Storybook: host (HTML, Skin), Astro components, Marko tags.
export default defineConfig({
  test: { projects: ["vitest.host.config.ts", "vitest.astro.config.ts", "vitest.marko.config.ts"] },
});
```

- [ ] **Step 6: Run the guard test and the story tests**

Run: `node --test tests/storybook-globs.test.js`

Expected: PASS (13 tests).

Run (once per machine: `npx playwright install chromium`):

```bash
npx vitest run --project=storybook-host
npx vitest run --project=storybook-astro
npm run test:stories
```

Expected: `storybook-host` runs only `stories/create*.stories.ts`, `stories/Button.stories.ts` and `stories/skin/pill.stories.ts` and passes; `storybook-astro` runs only the five Astro globs' files and passes; `npm run test:stories` reports all three projects (`storybook-host`, `storybook-astro`, `storybook-marko`) and passes. The total `Tests  N passed` across the three projects equals the pre-split total saved in `/tmp/storybook-baseline/test-stories.txt` (Task 3 Step 1): no story dropped or duplicated.

- [ ] **Step 7: Commit**

```bash
git add vitest.host.config.ts vitest.astro.config.ts vitest.config.ts tests/storybook-globs.test.js
git commit -m "test(storybook): one Vitest story project per Storybook"
```

---

### Task 5: Docs — README, CONTRIBUTING, CLAUDE.md

**Files:**
- Modify: `README.md` (`## Storybook` section)
- Modify: `CONTRIBUTING.md` (`## Component tests`, `### Accessibility`, `## Running Storybook`)
- Modify: `CLAUDE.md` (verification paragraph)

**Interfaces:**
- Consumes: script names and ports (Task 3), Vitest project names (Task 4), `.storybook/story-globs.ts` (Task 1), output paths `storybook-static/astro/index.json`, `storybook-static/astro/astro-prerendered-stories.json` (Task 3).
- Produces: documentation only.

Every replacement below names the exact current text; replace it verbatim.

- [ ] **Step 1: README — commands and the three-Storybook paragraph**

In `README.md` under `## Storybook`, replace

````markdown
```bash
npm install
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in storybook-static/
```

Marko tags have their own Storybook (`.storybook-marko/`, stories in
`stories-marko/`), composed into the Astro one so both share one sidebar under
"Marko". In development run `npm run storybook:marko` (port 6007) alongside
`npm run storybook`; `npm run build-storybook` builds both, the Marko one into
`storybook-static/marko/`. The host's theme toolbar does not reach the composed
Marko stories; open the Marko Storybook on its own (`/marko/` on the published
site, or port 6007) to see them in the light theme.
````

with

````markdown
```bash
npm install
npm run storybook        # host (HTML, Skin): http://localhost:6006
npm run storybook:astro  # Astro components: http://localhost:6008
npm run storybook:marko  # Marko tags: http://localhost:6007
npm run build-storybook  # static build of all three in storybook-static/
```

There are three Storybooks, shown in one sidebar. The host (`.storybook/`)
holds the plain HTML builders (`HTML/*`) and the stylesheet-only Skin stories
(`Skin/*`) at the root of the sidebar. The Astro components
(`.storybook-astro/`) and the Marko tags (`.storybook-marko/`, stories beside
each tag under `src/marko/`) are Storybooks of their own, composed into the
host as the **Astro** and **Marko** refs, so the sidebar reads `HTML`, `Skin`,
`Astro → Components → …` and `Marko → Components → …`. In development run all
three dev servers to see the whole sidebar; a ref whose server is not running
shows Storybook's usual "ref failed to load" entry. `npm run build-storybook`
builds the host into `storybook-static/` and the refs into
`storybook-static/astro/` and `storybook-static/marko/`. The host's theme
toolbar does not reach composed refs; open the Astro or Marko Storybook on its
own (`/astro/` or `/marko/` on the published site, or port 6008 or 6007) to see
its stories in the light theme.
````

- [ ] **Step 2: README — story placement rule**

In `README.md`, replace

```markdown
Stories live in `stories/` rather than beside their components, because
`package.json#files` ships all of `src/` and co-located stories would land in
every consumer's `node_modules`.
```

with

```markdown
Stories live in `stories/` rather than beside their components, because
`package.json#files` ships all of `src/` and co-located stories would land in
every consumer's `node_modules`. Which Storybook picks up a story is decided by
the globs in `.storybook/story-globs.ts`: HTML factory stories are named
`stories/create*.stories.ts`, Skin stories go in `stories/skin/`, and Astro
component stories go in `stories/ui/` (or are added to the Astro list).
`npm test` fails if a story file matches neither list, or both.
```

- [ ] **Step 3: CONTRIBUTING — component tests and accessibility**

In `CONTRIBUTING.md` under `## Component tests`, replace

````markdown
Every story in both Storybooks is also a test (`@storybook/addon-vitest`): it
renders in headless Chromium, a story's `play` function runs, and an error or a
failed assertion fails the test. The Astro and Marko Storybooks are one Vitest
project each (`vitest.astro.config.ts`, `vitest.marko.config.ts`).

```bash
npx playwright install chromium   # once
npm run test:stories              # every story, both Storybooks
npx vitest run --project=storybook-marko    # one Storybook
```
````

with

````markdown
Every story in all three Storybooks is also a test (`@storybook/addon-vitest`):
it renders in headless Chromium, a story's `play` function runs, and an error or
a failed assertion fails the test. The host, Astro and Marko Storybooks are one
Vitest project each (`vitest.host.config.ts`, `vitest.astro.config.ts`,
`vitest.marko.config.ts`).

```bash
npx playwright install chromium   # once
npm run test:stories              # every story, all three Storybooks
npx vitest run --project=storybook-astro    # one Storybook: storybook-host, storybook-astro or storybook-marko
```
````

In the same section, replace

```markdown
Storybook (`npm run storybook`, `npm run storybook:marko`). The `Test` workflow
```

with

```markdown
Storybook (`npm run storybook`, `npm run storybook:astro`, `npm run storybook:marko`). The `Test` workflow
```

Under `### Accessibility`, replace

```markdown
Accessibility panel and in the same test run. Both previews set
```

with

```markdown
Accessibility panel and in the same test run. All three previews set
```

- [ ] **Step 4: CONTRIBUTING — running Storybook and where a story goes**

In `CONTRIBUTING.md` under `## Running Storybook`, replace

````markdown
Marko tags render in a second Storybook, composed into the first. Run both to
see them together:

```bash
npm run storybook:marko  # http://localhost:6007, shown under "Marko" in 6006
```
````

with

````markdown
There are three Storybooks in one sidebar. The host (6006, `.storybook/`) holds
`HTML/*` and `Skin/*` at the root; the Astro components (`.storybook-astro/`)
and the Marko tags (`.storybook-marko/`) are composed into it as the **Astro**
and **Marko** refs. Run all three to see the whole sidebar; a ref whose server
is not running shows "ref failed to load":

```bash
npm run storybook:astro  # http://localhost:6008, shown under "Astro" in 6006
npm run storybook:marko  # http://localhost:6007, shown under "Marko" in 6006
```

The host's theme toolbar does not reach composed refs. To see Astro or Marko
stories in the light theme, open that Storybook on its own (port 6008 or 6007,
or `/astro/` or `/marko/` on the published site).

### Which Storybook a story lands in

Story files never move to change Storybook; the globs in
`.storybook/story-globs.ts` decide, and `tests/storybook-globs.test.js` (part of
`npm test`) fails if a file under `stories/` matches neither list or both, or
carries the wrong title prefix.

- HTML factory stories: name them `stories/create*.stories.ts`, title `HTML/…` (host).
- Skin (stylesheet-only) stories: put them in `stories/skin/`, title `Skin/…` (host).
- Astro component stories: put them in `stories/ui/`, or add the file to
  `ASTRO_STORY_GLOBS`, title `Components/…` (Astro ref).
````

- [ ] **Step 5: CLAUDE.md — where story ids and prerendered markup now live**

In `CLAUDE.md`, replace

```markdown
Story ids come from `storybook-static/index.json`; prerendered Astro markup from `storybook-static/astro-prerendered-stories.json` (diff it before/after to prove a refactor changed nothing it shouldn't).
```

with

```markdown
Host (HTML/Skin) story ids come from `storybook-static/index.json`; Astro (`Components/*`) story ids from `storybook-static/astro/index.json`, and prerendered Astro markup from `storybook-static/astro/astro-prerendered-stories.json` (diff it before/after to prove a refactor changed nothing it shouldn't); Marko ids from `storybook-static/marko/index.json`.
```

- [ ] **Step 6: Check the docs**

```bash
grep -n "6008\|storybook:astro\|story-globs" README.md CONTRIBUTING.md
grep -n "storybook-static/astro/" CLAUDE.md
grep -n "both Storybooks\|Both previews\|composed into the Astro one" README.md CONTRIBUTING.md
npm test
```

Expected: the first two greps show the new lines; the third prints nothing; `npm test` passes.

- [ ] **Step 7: Commit**

```bash
git add README.md CONTRIBUTING.md CLAUDE.md
git commit -m "docs: three Storybooks, Astro ref, story placement rule"
```

---

### Task 6: Verify the build against the success criteria

**Files:**
- Create (untracked, gitignored): `test-results/verify-storybook.mjs`, `test-results/sidebar-check.mjs`
- No tracked files change unless a check fails.

**Interfaces:**
- Consumes: `/tmp/storybook-baseline/` (Task 3 Step 1), `storybook-static/**` from a fresh build, `playwright` (existing devDependency).
- Produces: evidence for success criteria 1–5, pasted into the PR description.

- [ ] **Step 1: Fresh full test and build**

```bash
npm test
npm run test:stories
rm -rf storybook-static
npm run build-storybook
```

Expected: all three pass; the build log shows three `storybook build` runs, and `storybook-static/index.json`, `storybook-static/astro/index.json` and `storybook-static/marko/index.json` all exist (criteria 3, 4).

- [ ] **Step 2: Index and prerender diff**

If `/tmp/storybook-baseline/` is missing (new machine or reboot), recreate it from the spec commit, then come back:

```bash
git worktree add /tmp/sb-base 442d2e6
(cd /tmp/sb-base && npm ci && npm run build-storybook)
mkdir -p /tmp/storybook-baseline/marko
cp /tmp/sb-base/storybook-static/index.json /tmp/sb-base/storybook-static/astro-prerendered-stories.json /tmp/storybook-baseline/
cp /tmp/sb-base/storybook-static/marko/index.json /tmp/storybook-baseline/marko/
git worktree remove --force /tmp/sb-base
```

(At `442d2e6` the pill stories have no `docs.source`, which does not affect `Components/*` or Marko.)

Create `test-results/verify-storybook.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const BASE = "/tmp/storybook-baseline";
const json = (p) => JSON.parse(readFileSync(p, "utf8"));
const titles = (p) => [...new Set(Object.values(json(p).entries).map((e) => e.title))].sort();
const ids = (p) => Object.keys(json(p).entries).sort();

// Criterion 3 + 1: host is HTML + Skin only, Astro is Components only.
assert.deepEqual(titles("storybook-static/index.json"), [
  "HTML/createButton",
  "HTML/createDialog",
  "HTML/createFooter",
  "HTML/createListingCard",
  "HTML/createLogo",
  "Skin/pill",
]);
assert.deepEqual(titles("storybook-static/astro/index.json"), [
  "Components/Button",
  "Components/Dialog",
  "Components/Footer",
  "Components/Logo",
  "Components/ProgramBadge",
  "Components/SectionHead",
  "Components/SiteHeader",
]);

// Same story ids as before, just split across two Storybooks.
const baseIds = ids(`${BASE}/index.json`);
assert.deepEqual(ids("storybook-static/astro/index.json"), baseIds.filter((id) => id.startsWith("components-")));
assert.deepEqual(ids("storybook-static/index.json"), baseIds.filter((id) => !id.startsWith("components-")));

// Marko unchanged.
assert.deepEqual(ids("storybook-static/marko/index.json"), ids(`${BASE}/marko/index.json`));

// Criterion 5: prerendered Astro markup identical for every Components story.
const before = json(`${BASE}/astro-prerendered-stories.json`);
const after = json("storybook-static/astro/astro-prerendered-stories.json");
const keys = (o) => Object.keys(o).filter((k) => k.startsWith("components-")).sort();
assert.deepEqual(keys(after), keys(before));
for (const k of keys(before)) assert.equal(after[k], before[k], `prerendered markup changed: ${k}`);

console.log(`OK: host/astro/marko indexes as specified; ${keys(before).length} prerendered Components stories identical`);
```

Run: `node test-results/verify-storybook.mjs`

Expected: `OK: host/astro/marko indexes as specified; 52 prerendered Components stories identical` (the count is whatever the baseline holds; 52 at the time of writing). Any assertion failure is a real regression: fix the config, rebuild, rerun, and commit the fix with the task it belongs to.

- [ ] **Step 3: Sidebar and Show code in the built site (criteria 1, 2)**

Serve the static build and drive it with the Playwright already installed for `test:stories`:

```bash
python3 -m http.server 6100 -d storybook-static >/tmp/sb-serve.log 2>&1 &
echo $! > /tmp/sb-serve.pid
```

Create `test-results/sidebar-check.mjs`:

```js
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = "http://localhost:6100";
const browser = await chromium.launch();
const page = await browser.newPage();

// Criterion 1: refs resolve from the static build.
for (const ref of ["astro", "marko"]) {
  const res = await page.request.get(`${base}/${ref}/index.json`);
  assert.equal(res.status(), 200, `${ref}/index.json`);
}

await page.goto(`${base}/`);
await page.waitForSelector("#storybook-explorer-tree");
await page.waitForTimeout(3000); // let both refs load
const tree = await page.locator("#storybook-explorer-tree").innerText();
console.log(tree);
for (const label of ["HTML", "Skin", "Astro", "Marko"]) assert.ok(tree.includes(label), `sidebar lacks ${label}`);
assert.ok(!/failed to load/i.test(tree), "a ref failed to load");
await page.screenshot({ path: "test-results/sidebar.png", fullPage: true });

// Criterion 2: Skin/pill Show code on the docs page.
await page.goto(`${base}/iframe.html?id=skin-pill--docs&viewMode=docs`);
await page.waitForSelector(".docs-story");
for (const button of await page.getByRole("button", { name: "Show code" }).all()) await button.click();
const code = (await page.locator(".docblock-source, pre").allInnerTexts()).join("\n");
assert.ok(code.includes("@luxoticars/ui/styles/skin/pill.css"), "Show code lacks the CSS import");
assert.ok(code.includes('class="pill"'), "Show code lacks the Default markup");
assert.ok(code.includes("pill--sm"), "Show code lacks the Small markup");
assert.ok(!code.includes('size: "default"'), "Show code still shows the args object");
console.log("OK: sidebar has HTML, Skin, Astro, Marko; pill Show code is the import + markup");

await browser.close();
```

Run: `node test-results/sidebar-check.mjs`

Expected: the printed tree shows `HTML` and `Skin` at the root and the **Astro** and **Marko** ref headers, ends with the `OK:` line, and `test-results/sidebar.png` shows `Astro → Components → Button, Dialog, Footer, Logo, ProgramBadge, SectionHead, SiteHeader` and `Marko → Components → logo, …` with no `Components` folder at the host root (open the PNG and check by eye; expand the ref folders in a real browser at `http://localhost:6100/` if they render collapsed).

Stop the server: `kill "$(cat /tmp/sb-serve.pid)"`.

- [ ] **Step 4: Dev servers (criterion 1, local dev)**

In three terminals:

```bash
npm run storybook        # 6006
npm run storybook:astro  # 6008
npm run storybook:marko  # 6007
```

Open `http://localhost:6006`. Expected: `HTML` and `Skin` at the root, `Astro → Components → …` (seven entries) and `Marko → Components → …`, no root `Components`. Stop the Astro server: the Astro ref shows "ref failed to load" and the rest still works. Stop all three.

- [ ] **Step 5: Type gates and clean-up**

```bash
npm i --no-save @astrojs/check @marko/type-check @emnapi/runtime@1.11.3
npx astro check && rm -rf .astro
npx mtc -p tsconfig.marko.json
git status --short
```

Expected: `astro check` prints `Result (N files): 0 errors` (N now includes `.storybook-astro/`); `mtc` 0 errors; `git status --short` is empty (`test-results/` and `storybook-static/` are gitignored; `--no-save` touched neither `package.json` nor the lockfile). No changeset exists for this branch (`ls .changeset` shows no new file).

- [ ] **Step 6: Commit (only if a check needed a fix)**

If Steps 1–5 needed a fix, commit it with the files it touched, for example:

```bash
git add <fixed files>
git commit -m "fix(storybook): <what the verification caught>"
```

Otherwise there is nothing to commit. Do not push.

---

## Spec coverage self-review

| Spec requirement | Task |
| ---------------- | ---- |
| Host globs exactly (create*, Button, skin/**) | Task 1 (`HOST_STORY_GLOBS`, pinned by test), Task 3 (`stories: HOST_STORY_GLOBS`) |
| Astro globs exactly (Footer, Logo, SectionHead, SiteHeader, ui/*) | Task 1, Task 3 (`.storybook-astro/main.ts`) |
| Shared glob module read by configs and guard test | Task 1 (`.storybook/story-globs.ts`), Task 3 |
| Guard: each story in exactly one Storybook; title prefixes | Task 1 (`tests/storybook-globs.test.js`) |
| Host keeps `@storybook-astro/framework`, static render mode, Tailwind `viteFinal`, addons | Task 3 Step 5 (pinned by test) |
| `refs.astro` (6008 / `./astro`) + `refs.marko` (6007 / `./marko`) | Task 3 Step 5 (pinned by test) |
| Host `preview.ts` / `preview.css` / `ThemeFrame.astro` unchanged | Task 3 Step 5 (not edited); Task 3 copy test compares against them |
| `.storybook-astro/` copied from host, no refs | Task 3 Step 4 (pinned by test) |
| `.storybook-marko/` comment only | Task 3 Step 6 (pinned by test) |
| Scripts and ports, triple build order | Task 3 Step 7 (pinned by test) |
| Workflow unchanged | Global constraints (no task touches it) |
| Vitest three projects; Astro → `.storybook-astro`; host `storybook-host`; Marko unchanged | Task 4 (pinned by test) |
| Skin/pill `pillMarkup` / `pillSource`, per-story `docs.source` | Task 2 |
| README / CONTRIBUTING: three Storybooks, ports, `storybook:astro`, sidebar, placement rule, theme toolbar note | Task 5 Steps 1–4 |
| CLAUDE.md: Astro ids / prerendered paths under `storybook-static/astro/` | Task 5 Step 5 |
| No changeset; no story moves; no Marko renames; no Logo.astro move; no CSS change | Global constraints; Task 6 Step 5 |
| Criterion 1: sidebar (static + dev) | Task 6 Steps 3–4 (index split also Task 6 Step 2) |
| Criterion 2: pill Show code | Task 2 (unit), Task 6 Step 3 (built docs page) |
| Criterion 3: three index.json files with the right titles | Task 3 Step 9, Task 6 Step 2 |
| Criterion 4: `npm test`, `npm run test:stories` | Tasks 1–5, Task 6 Step 1 |
| Criterion 5: prerendered Components markup identical before/after | Task 3 Step 1 (baseline), Task 6 Step 2 (diff) |

Decisions made where the spec left room:

- The glob module is `.storybook/story-globs.ts`; the host imports `./story-globs`, the Astro config imports `../.storybook/story-globs` (no re-export file), and the Node test imports `../.storybook/story-globs.ts` using Node 24's built-in type stripping (`.nvmrc` is 24.22.1).
- The guard test hand-rolls a matcher for the three glob forms in use (`**/`, `*`, literals) instead of adding a dependency; it also pins the exact lists and the exact sidebar titles, and fails on a glob that matches nothing.
- `tsconfig.json` gains `.storybook-astro` in `include` so `astro check` keeps covering the copied preview (the spec's file table does not list it; it changes no shipped code).
- `vitest.host.config.ts` keeps `fileParallelism: false` like the Astro project, since both start the same Astro render server.
- The before-baseline is rebuilt at the start of Task 3, because the `storybook-static/` on disk can be stale (it predates the Skin/Logo rename).
