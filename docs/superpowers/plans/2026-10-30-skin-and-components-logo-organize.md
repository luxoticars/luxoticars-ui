# Skin folder + Components/Logo organize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put Astro Logo under Storybook `Components/`, and move pill into a Skin styles folder + `Skin/` Storybook group with a back-compat export alias.

**Architecture:** Filesystem move of `pill.css` under `src/styles/skin/`; dual `package.json` exports (canonical Skin path + old `styles/pill.css` alias); Storybook title/path updates only for Logo and pill. No visual CSS changes.

**Tech Stack:** package.json exports, Node test runner, Storybook (Astro), changesets.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-30-skin-and-components-logo-organize-design.md`
- Do not change pill visual rules (move/rename paths only).
- Do not move `Logo.astro` or non-Skin stylesheets (tokens, fonts, site-header*, footer, logo, dialog, section-head, listing-card, program-badge).
- Keep `@luxoticars/ui/styles/pill.css` working via alias to the moved file.
- Marko Logo story title (`Components/logo`) stays as-is.
- Patch changeset.

## File map

| File | Role |
| ---- | ---- |
| `src/styles/skin/pill.css` | Canonical pill stylesheet (moved from `src/styles/pill.css`) |
| `package.json` `exports` | New `./styles/skin/pill.css`; alias `./styles/pill.css` → same file |
| `tests/skin-pill.test.js` | Guards paths, exports, and that old root file is gone |
| `stories/Logo.stories.ts` | Title → `Components/Logo` |
| `stories/skin/pill.stories.ts` | Moved from `stories/pill.stories.ts`; title `Skin/pill`; import Skin path |
| `.changeset/skin-components-logo.md` | Patch release note |

---

### Task 1: Move pill CSS + dual exports + tests

**Files:**
- Create: `src/styles/skin/pill.css` (git mv from `src/styles/pill.css`)
- Delete: `src/styles/pill.css` (via git mv)
- Modify: `package.json` exports
- Create: `tests/skin-pill.test.js`

**Interfaces:**
- Consumes: existing pill CSS content unchanged
- Produces: `@luxoticars/ui/styles/skin/pill.css` and alias `@luxoticars/ui/styles/pill.css` both resolving to `./src/styles/skin/pill.css`

- [ ] **Step 1: Write the failing test**

Create `tests/skin-pill.test.js`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("pill CSS lives under src/styles/skin/, not src/styles/pill.css", () => {
  assert.equal(existsSync(join(root, "src/styles/pill.css")), false);
  assert.equal(existsSync(join(root, "src/styles/skin/pill.css")), true);
  const css = read("src/styles/skin/pill.css");
  assert.match(css, /\.pill\s*\{/);
  assert.match(css, /\.pill--sm/);
  assert.match(css, /\.pill--selected|aria-current/);
});

test("package exports Skin path and back-compat alias for pill.css", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/skin/pill.css"], "./src/styles/skin/pill.css");
  assert.equal(exports["./styles/pill.css"], "./src/styles/skin/pill.css");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/skin-pill.test.js`

Expected: FAIL (file still at `src/styles/pill.css` and/or Skin export missing).

- [ ] **Step 3: Move CSS and update exports**

```bash
mkdir -p src/styles/skin
git mv src/styles/pill.css src/styles/skin/pill.css
```

In `package.json` `exports`, change:

```json
"./styles/pill.css": "./src/styles/pill.css",
```

to:

```json
"./styles/pill.css": "./src/styles/skin/pill.css",
"./styles/skin/pill.css": "./src/styles/skin/pill.css",
```

Keep both keys. Place the Skin key next to the other style exports for readability.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/skin-pill.test.js`

Expected: PASS (2 tests).

Also run: `npm run check:exports`

Expected: `exports check passed (... subpaths, v0.15.4)` (or current version).

- [ ] **Step 5: Commit**

```bash
git add src/styles/skin/pill.css src/styles/pill.css package.json tests/skin-pill.test.js
git commit -m "refactor(styles): move pill.css under skin/ with export alias"
```

---

### Task 2: Storybook titles + pill story path + changeset

**Files:**
- Modify: `stories/Logo.stories.ts` (title only)
- Create: `stories/skin/pill.stories.ts` (git mv from `stories/pill.stories.ts`, update title + import)
- Delete: `stories/pill.stories.ts` (via git mv)
- Create: `.changeset/skin-components-logo.md`

**Interfaces:**
- Consumes: Task 1 Skin CSS path
- Produces: Storybook sidebar `Components/Logo` and `Skin/pill`; no `Styles/pill`; no top-level `Logo`

- [ ] **Step 1: Write failing guards in the same test file**

Append to `tests/skin-pill.test.js`:

```js
test("Astro Logo story is under Components/", () => {
  const src = read("stories/Logo.stories.ts");
  assert.match(src, /title:\s*["']Components\/Logo["']/);
  assert.doesNotMatch(src, /title:\s*["']Logo["']/);
});

test("pill story lives under stories/skin/ with Skin/ title", () => {
  assert.equal(existsSync(join(root, "stories/pill.stories.ts")), false);
  assert.equal(existsSync(join(root, "stories/skin/pill.stories.ts")), true);
  const src = read("stories/skin/pill.stories.ts");
  assert.match(src, /title:\s*["']Skin\/pill["']/);
  assert.match(src, /styles\/skin\/pill\.css/);
  assert.doesNotMatch(src, /title:\s*["']Styles\/pill["']/);
});
```

- [ ] **Step 2: Run test to verify new cases fail**

Run: `node --test tests/skin-pill.test.js`

Expected: FAIL on the two new Storybook assertions; Task 1 tests still PASS.

- [ ] **Step 3: Update Logo story title**

In `stories/Logo.stories.ts`, change:

```ts
export default {
  title: "Logo",
```

to:

```ts
export default {
  title: "Components/Logo",
```

- [ ] **Step 4: Move and update pill story**

```bash
mkdir -p stories/skin
git mv stories/pill.stories.ts stories/skin/pill.stories.ts
```

Edit `stories/skin/pill.stories.ts`:

1. Change the CSS import from `../src/styles/pill.css` to `../../src/styles/skin/pill.css`.
2. Change `title: "Styles/pill"` to `title: "Skin/pill"`.
3. Update the file-top comment / JSDoc so the canonical consumer import is `@luxoticars/ui/styles/skin/pill.css`, and note that `@luxoticars/ui/styles/pill.css` remains an alias.

Example header comment after edit:

```ts
/*
  A stylesheet, not a component: the story writes the markup a consumer would
  and loads `@luxoticars/ui/styles/skin/pill.css` (canonical). The older
  `@luxoticars/ui/styles/pill.css` export still aliases the same file.
*/
import "../../src/styles/skin/pill.css";
```

And in the JSDoc block that currently shows:

```html
```

keep the HTML examples; only adjust any mention of the CSS path to the Skin path.

- [ ] **Step 5: Run tests**

Run: `node --test tests/skin-pill.test.js`

Expected: PASS (all four).

Run: `npm test`

Expected: all existing tests green (including `tests/skin-pill.test.js`).

- [ ] **Step 6: Add changeset**

Create `.changeset/skin-components-logo.md`:

```md
---
"@luxoticars/ui": patch
---

Organize Storybook: Astro Logo under Components/; move pill into Skin (`styles/skin/pill.css`, story `Skin/pill`). `@luxoticars/ui/styles/pill.css` still works as an alias.
```

- [ ] **Step 7: Commit**

```bash
git add stories/Logo.stories.ts stories/skin/pill.stories.ts stories/pill.stories.ts tests/skin-pill.test.js .changeset/skin-components-logo.md
git commit -m "chore(storybook): Components/Logo and Skin/pill; document Skin export"
```

---

## Spec coverage self-review

| Spec requirement | Task |
| ---------------- | ---- |
| `Components/Logo` title | Task 2 |
| Marko title unchanged | (no task — leave alone) |
| `src/styles/skin/pill.css` | Task 1 |
| New Skin export + old alias | Task 1 |
| `stories/skin/pill.stories.ts` + `Skin/pill` | Task 2 |
| No move of Logo.astro / non-Skin CSS | Global constraints |
| Patch changeset | Task 2 |
| `check:exports` + tests green | Task 1–2 steps |

## Placeholder scan

No TBD/TODO; exact paths, test code, export JSON, and commit messages included.
