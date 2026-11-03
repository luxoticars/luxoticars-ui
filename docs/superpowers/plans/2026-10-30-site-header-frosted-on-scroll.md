# Site header frosted glass on scroll-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in CSS so the sticky site header uses frosted glass (`backdrop-filter`) only while `data-scroll-dir="up"`, with a solid fallback when unsupported.

**Architecture:** Mirror hide-on-scroll: Astro source stylesheet + Marko fork stamped against it; package `exports` maps; Storybook scroll demos import the opt-in file. No new JS — reuse hide-on-scroll’s `data-scroll-dir`.

**Tech Stack:** CSS (`@supports`, `backdrop-filter`, `color-mix`), existing `wireHideOnScroll` / `data-hide-on-scroll`, Node test runner, style-forks stamp script, Storybook (Astro + Marko).

## Global Constraints

- Opt-in only: never import frosted CSS from base header entries.
- Trigger: `[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"]` only (no top threshold).
- Progressive enhancement: frosted rules inside `@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))`.
- `prefers-reduced-motion: reduce` → keep solid `--_bg` (no blur).
- No SVG `feTurbulence` / displacement.
- Do not change hide-on-scroll JS behaviour or defaults.
- Spec: `docs/superpowers/specs/2026-10-30-site-header-frosted-on-scroll-design.md`

## File map

| File | Role |
| ---- | ---- |
| `src/styles/site-header-frosted-on-scroll.css` | Astro/shared opt-in frosted rules |
| `src/marko/lx-site-header/frosted-on-scroll.css` | Marko fork (`lx-site-header` BEM) stamped from Astro source |
| `package.json` `exports` | Public import paths |
| `tests/site-header-frosted-on-scroll.test.js` | Opt-in / supports / reduced-motion / exports guards |
| `stories/SiteHeader.stories.ts` | Import frosted CSS on scroll demo |
| `src/marko/lx-site-header/scroll-demo.stories.marko` + `stories.ts` | Marko demo import + docs |
| `.changeset/*.md` | Patch release note |

---

### Task 1: Astro opt-in frosted stylesheet + failing tests

**Files:**
- Create: `src/styles/site-header-frosted-on-scroll.css`
- Create: `tests/site-header-frosted-on-scroll.test.js`
- Modify: `package.json` (add `./styles/site-header-frosted-on-scroll.css` export)

**Interfaces:**
- Consumes: existing `data-hide-on-scroll`, `data-scroll-dir` from hide-on-scroll
- Produces: public CSS path `@luxoticars/ui/styles/site-header-frosted-on-scroll.css`

- [ ] **Step 1: Write the failing test**

Create `tests/site-header-frosted-on-scroll.test.js`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const rules = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test("frosted-on-scroll CSS ships only in the opt-in stylesheets", () => {
  for (const p of [
    "src/styles/site-header.css",
    "src/marko/lx-site-header/base.css",
    "src/marko/lx-site-header/desktop.css",
    "src/marko/lx-site-header/mobile.css",
    "src/marko/lx-site-header/hide-on-scroll.css",
    "src/styles/site-header-hide-on-scroll.css",
  ]) {
    assert.doesNotMatch(rules(read(p)), /backdrop-filter|frosted-on-scroll/, p);
  }
  for (const p of [
    "src/styles/site-header-frosted-on-scroll.css",
    "src/marko/lx-site-header/frosted-on-scroll.css",
  ]) {
    const css = read(p);
    assert.match(css, /data-scroll-dir=["']up["']/);
    assert.match(css, /@supports/);
    assert.match(css, /backdrop-filter/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
  }
});

test("frosted-on-scroll package exports point at the opt-in files", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(
    exports["./styles/site-header-frosted-on-scroll.css"],
    "./src/styles/site-header-frosted-on-scroll.css",
  );
  assert.equal(
    exports["./marko/lx-site-header/frosted-on-scroll.css"],
    "./src/marko/lx-site-header/frosted-on-scroll.css",
  );
});

test("header entries do not import frosted-on-scroll.css", () => {
  for (const p of ["src/astro/SiteHeader.astro", "src/marko/lx-site-header/index.marko", "src/marko/lx-site-header/base.marko"]) {
    assert.doesNotMatch(read(p), /^\s*import\s+["'][^"'\n]*frosted-on-scroll\.css/m, p);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/site-header-frosted-on-scroll.test.js`
Expected: FAIL (missing files / exports)

- [ ] **Step 3: Add Astro CSS + export**

Create `src/styles/site-header-frosted-on-scroll.css`:

```css
/*
  Optional: frosted glass while the header is revealed on scroll-up.
  Import next to site-header.css / hide-on-scroll to opt in:

    import "@luxoticars/ui/styles/site-header-frosted-on-scroll.css";

  Needs hide-on-scroll wiring so `data-scroll-dir` is set. Without
  backdrop-filter support the bar stays solid `--_bg`.
*/
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  @media (prefers-reduced-motion: no-preference) {
    .site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"] {
      background-color: color-mix(in srgb, var(--_bg) 72%, transparent);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);
      backdrop-filter: blur(12px) saturate(1.2);
      transition:
        background-color 200ms ease-out,
        backdrop-filter 200ms ease-out,
        -webkit-backdrop-filter 200ms ease-out;
    }
  }
}

@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  @media (prefers-reduced-motion: reduce) {
    .site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"] {
      background-color: var(--_bg);
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }
}
```

In `package.json` `exports`, add next to the hide-on-scroll style entry:

```json
"./styles/site-header-frosted-on-scroll.css": "./src/styles/site-header-frosted-on-scroll.css",
```

(Marko export lands in Task 2; leave Marko assert failing until then, or stub Marko file empty stamp in Task 2 only — prefer completing Marko file in Task 2 and temporarily comment Marko path in test until Task 2, OR implement both CSS files in Task 1–2 as one PR slice.)

**Adjustment for TDD across tasks:** In Task 1 only assert Astro path + that Marko file will exist in Task 2. Split the first test into Astro-only assertions in Task 1; extend in Task 2.

Task 1 Astro-only test body (replace the dual-file loop):

```js
test("frosted-on-scroll CSS ships only in the Astro opt-in stylesheet (Marko fork next)", () => {
  for (const p of [
    "src/styles/site-header.css",
    "src/marko/lx-site-header/base.css",
    "src/styles/site-header-hide-on-scroll.css",
  ]) {
    assert.doesNotMatch(rules(read(p)), /backdrop-filter/, p);
  }
  const css = read("src/styles/site-header-frosted-on-scroll.css");
  assert.match(css, /data-scroll-dir=["']up["']/);
  assert.match(css, /@supports/);
  assert.match(css, /backdrop-filter/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("frosted-on-scroll Astro package export is wired", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(
    exports["./styles/site-header-frosted-on-scroll.css"],
    "./src/styles/site-header-frosted-on-scroll.css",
  );
});
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/site-header-frosted-on-scroll.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/styles/site-header-frosted-on-scroll.css tests/site-header-frosted-on-scroll.test.js package.json
git commit -m "feat(site-header): add opt-in frosted-on-scroll Astro CSS"
```

---

### Task 2: Marko fork + stamp + export

**Files:**
- Create: `src/marko/lx-site-header/frosted-on-scroll.css`
- Modify: `package.json` (Marko export)
- Modify: `tests/site-header-frosted-on-scroll.test.js` (full opt-in + Marko export asserts)

**Interfaces:**
- Consumes: Astro source `src/styles/site-header-frosted-on-scroll.css`
- Produces: `@luxoticars/ui/marko/lx-site-header/frosted-on-scroll.css`

- [ ] **Step 1: Extend tests for Marko fork**

Update the test file to require Marko frosted file content (same selectors with `lx-site-header`), Marko export, and stamp presence:

```js
test("Marko frosted-on-scroll is stamped against the Astro source", () => {
  const css = read("src/marko/lx-site-header/frosted-on-scroll.css");
  assert.match(
    css,
    /Forked from src\/styles\/site-header-frosted-on-scroll\.css \[source-hash: [0-9a-f]{12}\]/,
  );
  assert.match(css, /\.lx-site-header\[data-hide-on-scroll\]/);
  assert.match(css, /data-scroll-dir=["']up["']/);
  assert.match(css, /backdrop-filter/);
});
```

Plus restore dual export assert from Task 1 Interfaces.

- [ ] **Step 2: Run — expect FAIL**

Run: `node --test tests/site-header-frosted-on-scroll.test.js`
Expected: FAIL missing Marko file / export

- [ ] **Step 3: Write Marko CSS**

Create `src/marko/lx-site-header/frosted-on-scroll.css` with the same rules as Astro, block `lx-site-header`, header comment:

```css
/*
  Forked from src/styles/site-header-frosted-on-scroll.css [source-hash: none]
  Optional: `<lx-site-header>` frosted glass on scroll-up. Opt in:

    import "@luxoticars/ui/marko/lx-site-header/frosted-on-scroll.css"

  Block is `lx-site-header`. Same trigger and supports rules as the Astro source.
*/
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  @media (prefers-reduced-motion: no-preference) {
    .lx-site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"] {
      background-color: color-mix(in srgb, var(--_bg) 72%, transparent);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);
      backdrop-filter: blur(12px) saturate(1.2);
      transition:
        background-color 200ms ease-out,
        backdrop-filter 200ms ease-out,
        -webkit-backdrop-filter 200ms ease-out;
    }
  }
}

@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  @media (prefers-reduced-motion: reduce) {
    .lx-site-header[data-hide-on-scroll]:not([data-hide-on-scroll="false"])[data-scroll-dir="up"] {
      background-color: var(--_bg);
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }
}
```

Add package export:

```json
"./marko/lx-site-header/frosted-on-scroll.css": "./src/marko/lx-site-header/frosted-on-scroll.css",
```

Stamp:

```bash
node scripts/style-forks.mjs --stamp lx-site-header
```

Confirm the frosted file’s stamp hash matches `hashSource` of the Astro frosted file (stamp script updates all stamped files under the tag that already have a stamp — ensure the initial stamp line names the correct source path before running).

- [ ] **Step 4: Run full style + frosted tests**

Run: `npm test`
Expected: PASS (including `style-forks` and frosted tests)

- [ ] **Step 5: Commit**

```bash
git add src/marko/lx-site-header/frosted-on-scroll.css tests/site-header-frosted-on-scroll.test.js package.json
git commit -m "feat(lx-site-header): add stamped frosted-on-scroll CSS fork"
```

---

### Task 3: Storybook demos + changeset

**Files:**
- Modify: `stories/SiteHeader.stories.ts` (import frosted CSS; docs note)
- Modify: `src/marko/lx-site-header/scroll-demo.stories.marko` and/or `stories.ts` (import frosted)
- Create: `.changeset/<random-name>.md`

**Interfaces:**
- Consumes: opt-in CSS paths from Tasks 1–2
- Produces: visible frosted on Desktop Scroll / Hide on scroll demos when scrolling up

- [ ] **Step 1: Wire Astro Storybook import**

In `stories/SiteHeader.stories.ts`, next to the hide-on-scroll import, add:

```ts
import "../src/styles/site-header-frosted-on-scroll.css";
```

Update the story docs / comment block that currently tells consumers to import hide-on-scroll so it also mentions frosted:

```ts
 * import "@luxoticars/ui/styles/site-header-frosted-on-scroll.css";
```

- [ ] **Step 2: Wire Marko scroll demo**

In `src/marko/lx-site-header/scroll-demo.stories.marko` (or the style import site used for hide-on-scroll in `stories.ts`), add the Marko frosted import the same way hide-on-scroll is imported today. If styles are imported from `stories.ts`, add:

```ts
import "./frosted-on-scroll.css";
```

Document in the Marko story description that frosted appears on scroll-up after hide.

- [ ] **Step 3: Changeset**

```md
---
"@luxoticars/ui": patch
---

Add opt-in site-header frosted glass CSS on scroll-up (`data-scroll-dir=up`), progressive with `backdrop-filter`.
```

- [ ] **Step 4: Manual check**

Run Storybook Astro Hide on scroll + Marko Desktop Scroll: scroll down (hide), scroll up — header should look frosted where `backdrop-filter` works; solid under reduced motion.

- [ ] **Step 5: Commit**

```bash
git add stories/SiteHeader.stories.ts src/marko/lx-site-header/scroll-demo.stories.marko src/marko/lx-site-header/stories.ts .changeset
git commit -m "docs(site-header): demo frosted-on-scroll in Storybook"
```

---

## Spec coverage (self-review)

| Spec item | Task |
| --------- | ---- |
| Opt-in CSS Astro + Marko | 1, 2 |
| Trigger `data-scroll-dir=up` only | 1, 2 |
| `@supports` backdrop-filter | 1, 2 |
| Reduced motion solid | 1, 2 |
| No new JS / no SVG | all |
| Storybook demos | 3 |
| Stamp / exports / tests | 1, 2 |
| Changeset | 3 |

No TBD placeholders. Defaults: blur `12px`, mix `72%` as in spec.
