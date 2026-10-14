# ProgramBadge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `ProgramBadge`, an icon and/or a short label such as "Top rated seller", as an Astro component and as the package's first Marko 6 tag (`<program-badge>`), with the Marko Storybook composed into the existing Astro one.

**Architecture:** A framework-free core decides everything: the icon artwork (`src/data/`), one resolver (`src/utils/program-badge.js`) and one BEM stylesheet. Two thin renderers, `ProgramBadge.astro` and `program-badge.marko`, print only what the resolver returns, so they agree by construction, and a parity test holds them together. The Marko toolchain is confined to `src/marko/`, `marko.json`, `.storybook-marko/`, `stories-marko/` and `tsconfig.marko.json`. The Astro Storybook knows the Marko one only as a `refs` URL.

**Tech Stack:** Astro 7.3, Marko 6 Tags API in concise syntax, plain JS + hand-written `.d.ts`, CSS, Storybook 10.6 (`@storybook-astro/framework` for Astro; `@storybook/marko-vite@5` + `@storybook/marko@10.1` for Marko; composition via `refs`), Vite 8, `node:test`, `playwright-core` (scratch only), `@astrojs/check` and `@marko/type-check` (installed transiently).

**Spec:** `docs/superpowers/specs/2026-10-13-program-badge-design.md`. Read it before starting any task. It was corrected alongside this plan: the icon reads `--lux-accent` first, the Marko theme decorator replaces a `ThemeFrame.marko`, the Marko stories use explicit `argTypes`, and the resolver rows for whitespace-only text, numeric-string sizes and inherited object keys were added.

## Global Constraints

- Branch: `claude/program-badge` (already created off `origin/main`; the spec commits are on it).
- **Marko 6 Tags API in concise syntax in every `.marko` file**, including spike and test files. No Marko 5 syntax: no `$` scriptlets, `style { }` blocks, `class { }` blocks or `onClick("name")` handlers. Use `<const/x=…>`-style tags (`const/x=…` in concise).
- Names: Marko tag `<program-badge>`, unprefixed (the maintainer's decision; see the spec's Known limitations). Astro `ProgramBadge`, imported as `@luxoticars/ui/astro/ui/ProgramBadge`.
- **No HTML builder.** `createProgramBadge` is a follow-up. Do not add anything under `src/html/`.
- The icon artwork, verbatim from the spec (24×24 viewBox, `fill="currentColor"`):
  - tails `M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z`
  - medal and star, `fill-rule="evenodd"`: `M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z`
  - default label `Top rated seller`
- Sizes, verbatim: size 16 is a 1rem icon, `var(--text-sm, 0.875rem)` text with a 1.25rem line-height, and a 0.25rem gap. Size 24 is a 1.5rem icon, `var(--text-base, 1rem)` text with a 1.5rem line-height, and a 0.5rem gap.
- Icon colour, verbatim: `var(--lux-accent, var(--color-accent, oklch(52% 0.16 232.661)))`.
- Contrast floors: icon at least **3:1** and text at least **4.5:1** against the canvas, in both themes.
- Attributes the component controls are **removed from the spread**, never overridden after it: `class` in both renderers, plus `content` in Marko.
- The only new dependencies are **three devDependencies**: `marko@^6.4.5`, `@storybook/marko@^10.1.0` and `@storybook/marko-vite@^5.0.0`. `marko@^6` becomes an **optional** peer dependency. There are no runtime dependencies.
- Transient tools, never committed: `@astrojs/check` and `@marko/type-check`. Install them **together** with `npm i --no-save @astrojs/check @marko/type-check`, because a later `npm install` prunes anything not in the lockfile. `playwright-core` lives only in the scratch directory.
- `.npmrc` sets `legacy-peer-deps=true`, so npm will not report peer conflicts. After any install, check the versions with `npm ls` as the steps say.
- Stories live outside `src/`: Astro stories in `stories/`, Marko stories in `stories-marko/`.
- JS + hand-written `.d.ts` for every `.js` file under `src/`.
- Every design token is read with a literal fallback (CONTRIBUTING, "Style components so they work in both apps").
- Scratch directory (`$SCRATCH`): any directory outside the repo, for throwaway tooling: the spike, the browser tests and the consumer apps. Nothing in it is committed.
- Repo (`$REPO`): the root of this checkout. The browser tests read `REPO` from the environment.
- Chrome: the harness launches the Chrome or Chromium at `CHROME_PATH`, or Playwright's own Chromium when `CHROME_PATH` is unset.
- After every `npx astro check`, run `rm -rf .astro` (it is not gitignored).
- Every commit ends with the attribution trailer the working session's instructions specify, and carries no other model identifier. Commit subjects follow the repo's style: a plain imperative sentence, no `feat:` prefix.

### Deliberate deviations from the spec

The executor implements these. They are listed so a reviewer does not "fix" them back.

1. **A sixth story case, `WithAttributes`** (`class: "extra"`, `id: "badge-1"`, `data-test: "badge"`). It puts attribute pass-through into the shared contract and the parity test (Review Focus 4). The spec lists five cases.
2. **The browser harness built in the spike is kept** in `$SCRATCH/program-badge-e2e/` and reused by Tasks 2–5. Only the spike's worktree and its throwaway files are deleted.

## Review Focus

The five failure modes the spec implies but does not spell out, most likely first. Each has a test in the task named.

1. **Whitespace-only `text` next to an icon** (`text="  "`, typical of an empty CMS field) must count as no text, so the icon stays named (`role="img"` + `aria-label`) instead of being hidden next to a label nobody can see or hear. → Task 1, "icon + whitespace-only text: treated as icon only".
2. **`icon` naming an inherited object key** (`"toString"`, `"constructor"`, `"__proto__"`) must throw "unknown icon", not render garbage or crash with an unrelated error. → Task 1, "rejects invalid input".
3. **`size` passed as a string** (`size="24"`, as an HTML attribute or a Storybook control may send it) must render size 24, and `"20"` must still throw. → Task 1, "size: a numeric string counts as the number".
4. **A caller's `class`, `id` and `data-*`** must reach the outer `<span>` exactly once in both renderers. **Body content** passed to `<program-badge>` must not render. → Tasks 2 and 3, contract test "WithAttributes"; Task 4, parity; Task 5, "marko: body content is not rendered, and the caller's attributes reach the span once".
5. **A dark-themed section inside a light page** (a nested `[data-theme="dark"]` under an unthemed `<html>`, with the OS in light mode) must give the icon the dark accent, not the `:root` one. → Task 2, "a dark subtree under a light page uses the dark accent".

---

## File map

| File | Responsibility | Task |
|---|---|---|
| `$SCRATCH/spike/` (git worktree, deleted at the end of Task 0) | Throwaway proof of the Marko tooling | 0 |
| `$SCRATCH/program-badge-e2e/harness.mjs` (not committed) | Static server, browser launch, story helpers | 0 |
| `$SCRATCH/FINDINGS.md` (not committed) | Spike answers S1–S4; the source for the PR description | 0 |
| `src/types.d.ts` (modify) | `ProgramBadgeIcon`, `ProgramBadgeSize` | 1 |
| `src/data/program-badge-icons.js` + `.d.ts` (create) | Artwork and default labels, frozen. Internal. | 1 |
| `src/utils/program-badge.js` + `.d.ts` (create) | `resolveProgramBadge()`. Internal. | 1 |
| `tests/program-badge.test.js` (create) | Resolver contract | 1 |
| `src/styles/program-badge.css` (create) | All badge styling, shared by both renderers | 2 |
| `src/astro/ui/ProgramBadge.astro` (create) | Astro renderer | 2 |
| `stories/program-badge-cases.ts` (create) | Story cases + Marko `argTypes`, shared by both Storybooks and the parity test | 2 (+3) |
| `stories/ui/ProgramBadge.stories.ts` (create) | Astro stories | 2 |
| `$SCRATCH/program-badge-e2e/contract.mjs`, `astro.e2e.mjs` (not committed) | Markup, names, sizes and contrast against a built Storybook | 2 |
| `src/marko/program-badge.marko` (create) | Marko renderer, concise syntax | 3 |
| `marko.json` (create) | Tag discovery for Marko apps | 3 |
| `tsconfig.marko.json` (create) | The Marko type gate's project | 3 |
| `.storybook-marko/main.ts`, `preview.ts`, `preview.css` (create) | The Marko Storybook | 3 |
| `stories-marko/program-badge.stories.ts` (create) | Marko stories | 3 |
| `package.json`, `package-lock.json` (modify) | devDeps, optional peer, `files`, `exports`, scripts, description, keywords | 3 |
| `$SCRATCH/program-badge-e2e/marko.e2e.mjs` (not committed) | The same contract, against the Marko build | 3 |
| `.storybook/main.ts` (modify) | `refs` to the Marko Storybook | 4 |
| `$SCRATCH/program-badge-e2e/composed.e2e.mjs` (not committed) | Composition at `/` and under a sub-path; Astro ↔ Marko parity | 4 |
| `$SCRATCH/marko-consumer/`, `$SCRATCH/astro-consumer/`, `$SCRATCH/program-badge-e2e/consumer.e2e.mjs` (not committed) | Real apps consuming the packed package | 5 |
| `.changeset/program-badge.md` (create) | Minor bump | 5 |
| `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, the spec (modify) | Docs for the third renderer and the Marko Storybook | 5 |

---

### Task 0: Spike: prove the Marko tooling (throwaway)

Answers the spec's four spike questions before any component code exists. Nothing from the worktree is committed. If **S1 fails**, or **S2 needs the two-Storybooks fallback**, stop after Step 9 and report `FINDINGS.md` to the maintainer. Do not start Task 1. Any other fallback is recorded, and the later task that owns it applies the fallback code given there.

**Files:**
- Create (scratch only): `$SCRATCH/spike/` (git worktree), `$SCRATCH/program-badge-e2e/harness.mjs`, `$SCRATCH/program-badge-e2e/spike.e2e.mjs`, `$SCRATCH/spike-consumer/*`, `$SCRATCH/FINDINGS.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `harness.mjs`, which Tasks 2–5 import. Its exports are `REPO`, `serveDir(root, base = "/") → Promise<{ server, url }>` (`url` has no trailing slash and includes `base`), `launch() → Promise<Browser>`, `openStory(browser, base, id, { theme = "dark", colorScheme = "light", waitFor = ".program-badge" }) → Promise<Page>`, `badges(page) → Promise<Node[]>` (where `Node = { tag, attrs, text, children }`), `contrast(page, selector) → Promise<number>`, `accentPair(page) → Promise<{ icon, frame, root, theme, rootTheme }>`, `box(page, selector) → Promise<{ width, height }>`, `kebab(name) → string` and `waitForHttp(url, ms) → Promise<void>`. Also produces `FINDINGS.md`, which records answers S1–S4 that Tasks 3–5 read.

- [ ] **Step 1: Create the spike worktree and install the Marko tooling**

```bash
export REPO="$(git rev-parse --show-toplevel)"   # run inside the luxoticars-ui checkout
export SCRATCH="${SCRATCH:?set SCRATCH to a directory outside the repo}"
git -C "$REPO" worktree add -b spike/marko-storybook "$SCRATCH/spike" claude/program-badge
cd "$SCRATCH/spike" && npm ci && npm i -D marko@^6.4.5 @storybook/marko@^10.1.0 @storybook/marko-vite@^5.0.0
npm ls marko @storybook/marko @storybook/marko-vite @marko/vite storybook vite
```
Expected: `npm ls` shows `marko@6.x`, `@storybook/marko@10.1.x`, `@storybook/marko-vite@5.x`, `@marko/vite@6.x` (under marko-vite), `storybook@10.6.x` and `vite@8.x`, with no `invalid` or `UNMET` lines. If any line is `invalid`, record it as an S1 failure.

- [ ] **Step 2: Write the browser harness (kept for Tasks 2–5)**

```bash
mkdir -p "$SCRATCH/program-badge-e2e" && cd "$SCRATCH/program-badge-e2e" && npm init -y >/dev/null && npm pkg set type=module && npm i playwright-core
```

Create `$SCRATCH/program-badge-e2e/harness.mjs`:

```js
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

/* The checkout under test: the luxoticars-ui repo, or the spike worktree. */
export const REPO = process.env.REPO;
if (!REPO) throw new Error("Set REPO to the root of the checkout under test.");

/* A local Chrome or Chromium; unset, Playwright uses its own Chromium build. */
const CHROME = process.env.CHROME_PATH;

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

/**
 * Serves `root` over HTTP on a free port, mounted at `base` ("/" or a
 * sub-path such as "/luxoticars-ui/", the way a fork's Pages site is served).
 * Resolves to the server and its URL, with no trailing slash.
 */
export function serveDir(root, base = "/") {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!path.startsWith(base)) {
      res.writeHead(404);
      return res.end();
    }
    const rel = normalize(path.slice(base.length)).replace(/^(\.\.[/\\])+/, "");
    let file = join(root, rel);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, url: `http://127.0.0.1:${server.address().port}${base.replace(/\/$/, "")}` }),
    ),
  );
}

export const launch = () => chromium.launch({ executablePath: CHROME });

/* Defined in every page before its scripts run, so evaluate() callbacks share them. */
function installHelpers() {
  let ctx;
  const rgba = (css) => {
    ctx ??= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", {
      willReadFrequently: true,
    });
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  const luminance = ([r, g, b]) => {
    const [R, G, B] = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  window.__lux = { rgba, luminance };
}

/** Opens one story's canvas (no manager UI), with the toolbar theme set through the URL. */
export async function openStory(
  browser,
  base,
  id,
  { theme = "dark", colorScheme = "light", waitFor = ".program-badge" } = {},
) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, colorScheme });
  await page.addInitScript(installHelpers);
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  await page.locator(waitFor).first().waitFor();
  return page;
}

/** Every `.program-badge` in the story root, as a tree: tag, sorted attributes, trimmed own text, children. */
export const badges = (page) =>
  page.evaluate(() => {
    const walk = (el) => ({
      tag: el.tagName.toLowerCase(),
      attrs: Object.fromEntries(
        [...el.attributes].map((a) => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b)),
      ),
      text: [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join("")
        .trim(),
      children: [...el.children].map(walk),
    });
    return [...document.querySelectorAll("#storybook-root .program-badge")].map(walk);
  });

/** WCAG contrast of an element's `color` against its nearest opaque background (white if none). */
export const contrast = (page, selector) =>
  page.evaluate((sel) => {
    const { rgba, luminance } = window.__lux;
    const el = document.querySelector(sel);
    let bg = [255, 255, 255, 255];
    for (let n = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] === 255) {
        bg = c;
        break;
      }
    }
    const a = luminance(rgba(getComputedStyle(el).color));
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, selector);

/**
 * The icon's colour; `--lux-accent` as resolved on the icon's nearest
 * `[data-theme]` ancestor (`frame`) and on `<html>` (`root`); and both themes.
 * Colours are sRGB(A) arrays.
 */
export const accentPair = (page) =>
  page.evaluate(() => {
    const { rgba } = window.__lux;
    const svg = document.querySelector(".program-badge__icon");
    const frame = svg.closest("[data-theme]");
    const probe = document.createElement("span");
    probe.style.color = "var(--lux-accent)";
    frame.append(probe);
    const result = {
      icon: rgba(getComputedStyle(svg).color),
      frame: rgba(getComputedStyle(probe).color),
      root: rgba(getComputedStyle(document.documentElement).getPropertyValue("--lux-accent").trim()),
      theme: frame.dataset.theme,
      rootTheme: document.documentElement.dataset.theme ?? null,
    };
    probe.remove();
    return result;
  });

export const box = (page, selector) =>
  page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

/** Storybook's story-id form of an export name: `IconOnlyMalayLabel` → `icon-only-malay-label`. */
export const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Polls `url` until it answers 200, for a dev server started in another shell. */
export async function waitForHttp(url, ms = 120_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${url} did not answer within ${ms}ms`);
}
```

- [ ] **Step 3: Add a trivial Marko Storybook to the worktree (S1, S4)**

Create `$SCRATCH/spike/.storybook-marko/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/marko-vite";

export default {
  framework: "@storybook/marko-vite",
  stories: ["../stories-marko/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
} satisfies StorybookConfig;
```

Create `$SCRATCH/spike/.storybook-marko/preview.css`:

```css
@import "../src/styles/tokens.css";

.lux-canvas {
  background: var(--lux-base-100);
  color: var(--lux-base-content);
  padding: 2rem;
}
```

Create `$SCRATCH/spike/.storybook-marko/preview.ts`:

```ts
import type { Decorator, Preview } from "@storybook/marko";
import "./preview.css";

const withTheme: Decorator = (story, context) => {
  context.canvasElement.dataset.theme = context.globals.theme;
  context.canvasElement.classList.add("lux-canvas");
  return story();
};

export default {
  parameters: { layout: "fullscreen" },
  globalTypes: {
    theme: {
      description: "Luxoticars theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  decorators: [withTheme],
} satisfies Preview;
```

Create `$SCRATCH/spike/stories-marko/hello.marko`:

```marko
export interface Input {
  name: string
}

span.hello -- Hello ${input.name}
```

Create `$SCRATCH/spike/stories-marko/hello.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/marko";
import Hello, { type Input } from "./hello.marko";

export default { title: "Spike/Hello", component: Hello } satisfies Meta<Input>;

export const Default: StoryObj<Input> = { args: { name: "Marko" } };
```

Create `$SCRATCH/spike/tsconfig.marko.json`. It is the same file Task 3 commits:

```jsonc
{
  "include": ["src/marko", "stories-marko", ".storybook-marko"],
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": false,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "lib": ["DOM", "ESNext"],
    "types": ["vite/client"],
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 4: Build both Storybooks, with `refs` for S2**

Add `refs` to `$SCRATCH/spike/.storybook/main.ts`, inside `config`, directly after `addons`:

```ts
  refs: (_config, { configType }) => ({
    marko: {
      title: "Marko",
      url: configType === "DEVELOPMENT" ? "http://localhost:6007" : "./marko",
    },
  }),
```

```bash
cd "$SCRATCH/spike" && npx storybook build && npx storybook build -c .storybook-marko -o storybook-static/marko
ls storybook-static/marko/index.json storybook-static/index.json
```
Expected: both builds exit 0, and both `index.json` files exist. If the Marko build fails only on Tailwind's `@theme` at-rule in `tokens.css`, record **S1: `@theme` needs Tailwind**. Then apply the fallback: add `@tailwindcss/vite` to `.storybook-marko/main.ts` exactly as `.storybook/main.ts` does (`viteFinal` pushing `tailwindcss()`), make the first line of `preview.css` `@import "tailwindcss";`, and rebuild. Any other failure is **S1 failed**: go to Step 9.

- [ ] **Step 5: Write and run the spike checks (S1 static, S2, S4)**

Create `$SCRATCH/program-badge-e2e/spike.e2e.mjs`:

```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { REPO, serveDir, launch, openStory } from "./harness.mjs";

let browser;
before(async () => (browser = await launch()));
after(() => browser?.close());

test("S1: a concise-syntax Marko 6 story renders in the static build", async () => {
  const { server, url } = await serveDir(join(REPO, "storybook-static/marko"));
  const page = await openStory(browser, url, "spike-hello--default", { waitFor: ".hello" });
  assert.equal(await page.locator(".hello").textContent(), "Hello Marko");
  await page.close();
  server.close();
});

for (const base of ["/", "/luxoticars-ui/"]) {
  test(`S2: the Astro Storybook composes the Marko one, served at ${base}`, async () => {
    const { server, url } = await serveDir(join(REPO, "storybook-static"), base);
    const page = await browser.newPage();
    await page.goto(`${url}/?path=/story/marko_spike-hello--default`);
    await page.getByText("Marko", { exact: true }).first().waitFor({ timeout: 30_000 });
    const frame = page.frameLocator("#storybook-preview-iframe");
    await frame.locator(".hello").waitFor({ timeout: 30_000 });
    assert.match(await page.locator("#storybook-preview-iframe").getAttribute("src"), /marko\/iframe\.html/);
    await page.close();
    server.close();
  });
}

test("S4: the theme reaches the canvas, standalone and composed (recorded, not asserted)", async (t) => {
  const { server, url } = await serveDir(join(REPO, "storybook-static"));
  const standalone = await openStory(browser, `${url}/marko`, "spike-hello--default", {
    theme: "light",
    waitFor: ".hello",
  });
  t.diagnostic(
    `standalone: #storybook-root data-theme=${await standalone.evaluate(() => document.querySelector("#storybook-root")?.dataset.theme)}`,
  );
  await standalone.close();

  const host = await browser.newPage();
  await host.goto(`${url}/?path=/story/marko_spike-hello--default&globals=theme:light`);
  const frame = host.frameLocator("#storybook-preview-iframe");
  await frame.locator(".hello").waitFor({ timeout: 30_000 });
  t.diagnostic(
    `composed: #storybook-root data-theme=${await frame.locator("#storybook-root").getAttribute("data-theme")}`,
  );
  await host.close();
  server.close();
});
```

```bash
cd "$SCRATCH/program-badge-e2e" && REPO="$SCRATCH/spike" node --test spike.e2e.mjs
```
Expected: S1 and both S2 tests pass. S4 prints two diagnostics.
- If S1 fails with `Cannot read properties of undefined (reading 'dataset')`, the decorator has no `canvasElement`. Record **S4: no canvasElement**, then change the decorator body to use `document.body` in place of `context.canvasElement`, rebuild (Step 4) and rerun.
- If S2 fails only under `/luxoticars-ui/`, or only with the relative `./marko`, record **S2: relative URL fails**. Task 4 then applies its absolute-URL fallback.
- If no Marko stories appear in the host at all, record **S2: composition fails**: go to Step 9.

- [ ] **Step 6: Check the Marko dev server and the type gate (S1 dev)**

```bash
cd "$SCRATCH/spike" && (npx storybook dev -p 6007 -c .storybook-marko --ci > "$SCRATCH/sb-marko-dev.log" 2>&1 &)
cd "$SCRATCH/program-badge-e2e" && REPO="$SCRATCH/spike" node --input-type=module -e '
const h = await import("./harness.mjs");
await h.waitForHttp("http://localhost:6007/index.json");
console.log("dev up");
const b = await h.launch();
const p = await h.openStory(b, "http://localhost:6007", "spike-hello--default", { waitFor: ".hello" });
console.log("dev:", await p.locator(".hello").textContent());
await b.close();'
pkill -f "storybook dev -p 6007" || true
cd "$SCRATCH/spike" && npm i --no-save @astrojs/check @marko/type-check && npx mtc -p tsconfig.marko.json; echo "mtc exit $?"
```
Expected: `dev up`, then `dev: Hello Marko`, then `mtc exit 0`. Record any `mtc` errors verbatim. They decide whether the story typings in Task 3 (`satisfies Meta<Input>`, `StoryObj<Input>`) compile as written.

- [ ] **Step 7: Pack a trivial tag and consume it from a Marko 6 app (S3)**

In the worktree, add a tag and make it discoverable:

```bash
cd "$SCRATCH/spike" && mkdir -p src/marko && cat > src/marko/hello-tag.marko <<'EOF'
export interface Input {
  name: string
}

span.hello-tag -- Hello ${input.name}
EOF
printf '{\n  "exports": "./src/marko",\n  "script-lang": "ts"\n}\n' > marko.json
npm pkg set "files[2]=marko.json"
mkdir -p "$SCRATCH/spike-pack" && npm pack --pack-destination "$SCRATCH/spike-pack"
```
Expected: `$SCRATCH/spike-pack/luxoticars-ui-0.5.0.tgz`.

Scaffold the consumer:

```bash
mkdir -p "$SCRATCH/spike-consumer/src/negative" && cd "$SCRATCH/spike-consumer" && cat > package.json <<'EOF'
{
  "name": "spike-marko-consumer",
  "private": true,
  "type": "module",
  "scripts": { "build": "vite build --ssr src/render.js --outDir dist" },
  "dependencies": {
    "marko": "^6.4.5",
    "@luxoticars/ui": "file:../spike-pack/luxoticars-ui-0.5.0.tgz"
  },
  "devDependencies": {
    "@marko/vite": "^6.1.13",
    "@marko/type-check": "^3.2.1",
    "vite": "^8.3.0"
  }
}
EOF
cat > vite.config.js <<'EOF'
import marko from "@marko/vite";

export default { plugins: [marko({ linked: false })] };
EOF
cat > tsconfig.json <<'EOF'
{
  "include": ["src/page.marko", "src/render.js"],
  "compilerOptions": {
    "strict": true, "noEmit": true, "allowJs": true, "module": "ESNext", "moduleResolution": "bundler",
    "target": "ESNext", "lib": ["DOM", "ESNext"], "types": ["vite/client"], "skipLibCheck": true
  }
}
EOF
cat > tsconfig.invalid.json <<'EOF'
{ "extends": "./tsconfig.json", "include": ["src/negative/invalid.marko"] }
EOF
printf 'hello-tag name="Lux"\n' > src/page.marko
printf 'hello-tag name=1\n' > src/negative/invalid.marko
cat > src/render.js <<'EOF'
import page from "./page.marko";

console.log(await page.render({}));
EOF
npm install
```

Run the three S3 questions:

```bash
cd "$SCRATCH/spike-consumer" && npm run build && node dist/render.js; echo "render exit $?"
npx mtc -p tsconfig.json; echo "mtc valid exit $?"
npx mtc -p tsconfig.invalid.json; echo "mtc invalid exit $?"
```
Expected: output contains `<span class="hello-tag">Hello Lux</span>` and no `<hello-tag`, then `render exit 0`, then `mtc valid exit 0`, then `mtc invalid exit` non-zero with an error on `name`.
- If `node dist/render.js` fails with `ERR_UNKNOWN_FILE_EXTENSION ".marko"`, the consumer must bundle the package. Change `vite.config.js` to `export default { plugins: [marko({ linked: false })], ssr: { noExternal: ["@luxoticars/ui"] } };`, rebuild and rerun. Record **S3: consumers need `ssr.noExternal`** (Task 5 adds it to the README).
- If the build fails on TypeScript syntax, record **S3: TS does not compile** (Task 3, fallback A).
- If `mtc invalid` exits 0, record **S3: types do not reach the consumer** (Task 3, fallback B).

Now repeat without `script-lang`, to learn whether the key is needed:

```bash
cd "$SCRATCH/spike" && printf '{\n  "exports": "./src/marko"\n}\n' > marko.json && npm pack --pack-destination "$SCRATCH/spike-pack"
cd "$SCRATCH/spike-consumer" && npm install "../spike-pack/luxoticars-ui-0.5.0.tgz" && npm run build && node dist/render.js; echo "render exit $?"; npx mtc -p tsconfig.invalid.json; echo "mtc invalid exit $?"
```
Record **S3: `script-lang` required** if this run fails where the first passed. Otherwise record **S3: `script-lang` not required**. Task 3 keeps the key either way, because it is harmless and explicit, unless the spike shows it breaks something.

Finally, capture what a `.d.marko` looks like, for fallbacks A and B:

```bash
cd "$SCRATCH/spike" && cat > tsconfig.emit.json <<EOF
{
  "include": ["src/marko"],
  "compilerOptions": {
    "outDir": "$SCRATCH/spike-emit", "rootDir": "src/marko", "declaration": true, "strict": true,
    "module": "ESNext", "moduleResolution": "bundler", "target": "ESNext", "skipLibCheck": true
  }
}
EOF
npx mtc -p tsconfig.emit.json; ls "$SCRATCH/spike-emit"; cat "$SCRATCH/spike-emit/hello-tag.d.marko"
```
Expected: `hello-tag.marko` (types stripped) and `hello-tag.d.marko` in `$SCRATCH/spike-emit`. Copy the `.d.marko` contents into `FINDINGS.md`.

- [ ] **Step 8: Write `FINDINGS.md`**

Create `$SCRATCH/FINDINGS.md`, filling every bracket with what Steps 1–7 printed:

```markdown
# ProgramBadge spike findings

- Versions (`npm ls` from Step 1): [paste]
- S1 static build: [pass / fail + error]. `@theme` in tokens.css: [fine / needed Tailwind].
- S1 dev server: [pass / fail + error].
- S1 type gate (`mtc -p tsconfig.marko.json`): [0 errors / errors verbatim].
- S2 composition, relative `./marko`, at `/`: [pass / fail]. At `/luxoticars-ui/`: [pass / fail].
- S3 discovery + compile, with `script-lang: ts`: [pass / fail]. Without it: [pass / fail].
- S3 types reach the consumer (`mtc` rejects `name=1`): [yes / no].
- S3 consumer needs `ssr.noExternal`: [yes / no].
- S4 theme, standalone: `#storybook-root` data-theme = [value]. Composed (host `globals=theme:light`): [value].
- S4 decorator `canvasElement`: [present / absent → used document.body].
- `.d.marko` shape:
  [paste hello-tag.d.marko]
```

- [ ] **Step 9: Remove the worktree and decide**

```bash
pkill -f "storybook dev -p 6007" || true
git -C "$REPO" worktree remove --force "$SCRATCH/spike" && git -C "$REPO" branch -D spike/marko-storybook
rm -rf "$SCRATCH/spike-pack" "$SCRATCH/spike-consumer" "$SCRATCH/spike-emit" "$SCRATCH/program-badge-e2e/spike.e2e.mjs"
git -C "$REPO" status --short
```
Expected: `git status` shows only the untracked files that were there before the spike (`.agents/`, `.claude/`, `skills-lock.json`), and `$SCRATCH/program-badge-e2e/harness.mjs` still exists.

If S1 failed or S2 recorded "composition fails", **stop** and send `FINDINGS.md` to the maintainer. Otherwise continue with Task 1. Nothing is committed in this task.

---

### Task 1: Icon data and the resolver

**Files:**
- Modify: `src/types.d.ts` (append)
- Create: `src/data/program-badge-icons.js`, `src/data/program-badge-icons.d.ts`, `src/utils/program-badge.js`, `src/utils/program-badge.d.ts`
- Test: `tests/program-badge.test.js`

**Interfaces:**
- Consumes: `cn(...inputs: ClassValue[]): string` from `src/utils/cn.js`.
- Produces:
  - `type ProgramBadgeIcon = "top-rated-seller"` and `type ProgramBadgeSize = 16 | 24`, both from `src/types.d.ts`.
  - `PROGRAM_BADGE_ICONS: Readonly<Record<ProgramBadgeIcon, { label: string; paths: readonly { d: string; fillRule?: "evenodd" }[] }>>`, from `src/data/program-badge-icons.js`.
  - `resolveProgramBadge(options?: { text?, icon?, size?, iconLabel?, className? }): null | { className: string; text: string | undefined; icon: null | { paths; role: "img" | undefined; label: string | undefined; hidden: "true" | undefined } }`, from `src/utils/program-badge.js`.

- [ ] **Step 1: Write the failing tests**

Create `tests/program-badge.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveProgramBadge } from "../src/utils/program-badge.js";
import { PROGRAM_BADGE_ICONS } from "../src/data/program-badge-icons.js";

/* The resolver decides everything a program badge renders, so the Astro
   component and the Marko tag only print its answer and cannot disagree. */

const ROSETTE = PROGRAM_BADGE_ICONS["top-rated-seller"];

test("artwork: every icon has a label and at least one path", () => {
  for (const [id, art] of Object.entries(PROGRAM_BADGE_ICONS)) {
    assert.ok(art.label.trim(), `${id} has a label`);
    assert.ok(art.paths.length > 0, `${id} has paths`);
    for (const path of art.paths) assert.match(path.d, /^M/, `${id}: each path starts with a moveto`);
  }
});

test("artwork: top-rated-seller is the spec's rosette, verbatim", () => {
  assert.equal(ROSETTE.label, "Top rated seller");
  assert.deepEqual(ROSETTE.paths, [
    { d: "M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z" },
    {
      d: "M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z",
      fillRule: "evenodd",
    },
  ]);
});

test("artwork: frozen, so no caller can repaint every badge on the page", () => {
  assert.ok(Object.isFrozen(PROGRAM_BADGE_ICONS));
  assert.ok(Object.isFrozen(ROSETTE));
  assert.ok(Object.isFrozen(ROSETTE.paths));
  assert.ok(Object.isFrozen(ROSETTE.paths[0]));
});

test("nothing to show: no icon and no text renders nothing", () => {
  assert.equal(resolveProgramBadge(), null);
  assert.equal(resolveProgramBadge({}), null);
  assert.equal(resolveProgramBadge({ text: "" }), null);
  assert.equal(resolveProgramBadge({ text: "   " }), null);
  assert.equal(resolveProgramBadge({ icon: "", text: null }), null);
});

test("icon + text: the text names the badge, so the icon is hidden", () => {
  assert.deepEqual(resolveProgramBadge({ icon: "top-rated-seller", text: "Top rated seller" }), {
    className: "program-badge",
    text: "Top rated seller",
    icon: { paths: ROSETTE.paths, role: undefined, label: undefined, hidden: "true" },
  });
});

test("icon + text: iconLabel is ignored, because the text names the badge", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", text: "Top rated seller", iconLabel: "Penjual terbaik" });
  assert.equal(badge.icon.label, undefined);
  assert.equal(badge.icon.hidden, "true");
});

test("icon only: the icon carries the name, defaulting to the icon's own label", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller" });
  assert.deepEqual(badge.icon, { paths: ROSETTE.paths, role: "img", label: "Top rated seller", hidden: undefined });
  assert.equal(badge.text, undefined);
});

test("icon only: iconLabel overrides the default, trimmed", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", iconLabel: " Penjual terbaik " });
  assert.equal(badge.icon.label, "Penjual terbaik");
});

test("icon + whitespace-only text: treated as icon only, so the icon stays named", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", text: "   " });
  assert.equal(badge.text, undefined);
  assert.deepEqual(badge.icon, { paths: ROSETTE.paths, role: "img", label: "Top rated seller", hidden: undefined });
});

test("text only: no icon, and the text is trimmed", () => {
  assert.deepEqual(resolveProgramBadge({ text: "  Free inspection " }), {
    className: "program-badge",
    text: "Free inspection",
    icon: null,
  });
});

test("size: 24 adds the modifier; 16 is the default", () => {
  assert.equal(resolveProgramBadge({ text: "x", size: 24 }).className, "program-badge program-badge--24");
  assert.equal(resolveProgramBadge({ text: "x", size: 16 }).className, "program-badge");
  assert.equal(resolveProgramBadge({ text: "x" }).className, "program-badge");
  assert.equal(resolveProgramBadge({ text: "x", size: null }).className, "program-badge");
});

test("size: a numeric string counts as the number", () => {
  assert.equal(resolveProgramBadge({ text: "x", size: "24" }).className, "program-badge program-badge--24");
  assert.equal(resolveProgramBadge({ text: "x", size: "16" }).className, "program-badge");
});

test("className: the caller's classes follow the badge's own, in any form cn() accepts", () => {
  assert.equal(resolveProgramBadge({ text: "x", className: "mt-2" }).className, "program-badge mt-2");
  assert.equal(
    resolveProgramBadge({ text: "x", size: 24, className: ["mt-2", { hidden: false, ring: true }] }).className,
    "program-badge program-badge--24 mt-2 ring",
  );
});

test("rejects invalid input with a message naming the component", () => {
  assert.throws(() => resolveProgramBadge({ icon: "nope" }), {
    message: 'ProgramBadge: unknown icon "nope". Use one of: top-rated-seller.',
  });
  for (const key of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
    assert.throws(() => resolveProgramBadge({ icon: key, text: "x" }), {
      message: `ProgramBadge: unknown icon "${key}". Use one of: top-rated-seller.`,
    });
  }
  assert.throws(() => resolveProgramBadge({ text: "x", size: 20 }), {
    message: 'ProgramBadge: unknown size "20". Use one of: 16, 24.',
  });
  assert.throws(() => resolveProgramBadge({ text: "x", size: "large" }), {
    message: 'ProgramBadge: unknown size "large". Use one of: 16, 24.',
  });
  assert.throws(() => resolveProgramBadge({ icon: "top-rated-seller", iconLabel: "" }), {
    message: "ProgramBadge: an icon-only badge needs a non-empty `iconLabel` — it is the badge's only accessible name.",
  });
  assert.throws(() => resolveProgramBadge({ icon: "top-rated-seller", iconLabel: "  " }), /non-empty `iconLabel`/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL. `tests/program-badge.test.js` reports `ERR_MODULE_NOT_FOUND` for `src/utils/program-badge.js`, and the existing dialog tests still pass.

- [ ] **Step 3: Add the shared types**

Append to `src/types.d.ts`:

```ts

/** A built-in program badge icon. */
export type ProgramBadgeIcon = "top-rated-seller";

/** Program badge size in px. Sets the icon box, the text size and the gap. */
export type ProgramBadgeSize = 16 | 24;
```

- [ ] **Step 4: Write the icon data**

Create `src/data/program-badge-icons.js`:

```js
/*
  Program badge artwork, drawn for Luxoticars on a 24×24 grid in one colour
  (the badge fills it with `currentColor`). Details are knocked out with
  `fill-rule: evenodd`, so they show whatever surface the badge sits on, in
  either theme, with no second colour.

  Frozen: the paths are shared by every badge a page renders.
  Internal: not in package.json#exports.
*/

const freeze = (paths) => Object.freeze(paths.map((path) => Object.freeze(path)));

export const PROGRAM_BADGE_ICONS = Object.freeze({
  /* A rosette: two ribbon tails behind a round medal with a knocked-out star.
     The tails are their own path, so `evenodd` on the medal cannot cut holes
     where the two overlap. */
  "top-rated-seller": Object.freeze({
    label: "Top rated seller",
    paths: freeze([
      { d: "M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z" },
      {
        d: "M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z",
        fillRule: "evenodd",
      },
    ]),
  }),
});
```

Create `src/data/program-badge-icons.d.ts`:

```ts
import type { ProgramBadgeIcon } from "../types";

export interface ProgramBadgePath {
  readonly d: string;
  readonly fillRule?: "evenodd";
}

export interface ProgramBadgeArtwork {
  /** The default accessible name of an icon-only badge. */
  readonly label: string;
  /** Drawn on a `0 0 24 24` viewBox and filled with `currentColor`. */
  readonly paths: readonly ProgramBadgePath[];
}

export declare const PROGRAM_BADGE_ICONS: Readonly<Record<ProgramBadgeIcon, ProgramBadgeArtwork>>;
```

- [ ] **Step 5: Write the resolver**

Create `src/utils/program-badge.js`:

```js
/*
  The one place a program badge's options are validated and turned into
  markup facts: its classes, its text, and whether the icon is hidden (the
  text names the badge) or named (it is the badge's only content).
  `astro/ui/ProgramBadge.astro` and `marko/program-badge.marko` print exactly
  what this returns, so the two renderers agree by construction rather than by
  being kept in step by hand.
  Internal: not in package.json#exports.
*/
import { cn } from "./cn.js";
import { PROGRAM_BADGE_ICONS } from "../data/program-badge-icons.js";

const SIZES = [16, 24];
const ICONS = Object.keys(PROGRAM_BADGE_ICONS);

const fail = (message) => {
  throw new Error(`ProgramBadge: ${message}`);
};

export function resolveProgramBadge({ text, icon, size, iconLabel, className } = {}) {
  /* A numeric string counts: an HTML attribute or a Storybook control may send "24". */
  const px = Number(size ?? 16);
  if (!SIZES.includes(px)) fail(`unknown size "${size}". Use one of: ${SIZES.join(", ")}.`);

  const hasIcon = icon != null && icon !== "";
  /* Object.hasOwn, not `in` or a plain lookup: "toString" and "__proto__" are
     keys of every object and must be rejected like any other unknown name. */
  if (hasIcon && !Object.hasOwn(PROGRAM_BADGE_ICONS, icon)) {
    fail(`unknown icon "${icon}". Use one of: ${ICONS.join(", ")}.`);
  }

  /* Whitespace-only text is no text. Counting it would hide the icon next to a
     label nobody can see or hear, leaving the badge with no name at all. */
  const label = text == null ? "" : String(text).trim();
  if (!hasIcon && !label) return null;

  return {
    className: cn("program-badge", px === 24 && "program-badge--24", className),
    text: label || undefined,
    icon: hasIcon ? resolveIcon(PROGRAM_BADGE_ICONS[icon], label, iconLabel) : null,
  };
}

/* `hidden` is the string "true", never a boolean: ARIA attributes are
   enumerated strings, and Marko writes a boolean `true` as an empty value. */
function resolveIcon(artwork, label, iconLabel) {
  if (label) return { paths: artwork.paths, role: undefined, label: undefined, hidden: "true" };

  const name = iconLabel == null ? artwork.label : String(iconLabel).trim();
  if (!name) fail("an icon-only badge needs a non-empty `iconLabel` — it is the badge's only accessible name.");
  return { paths: artwork.paths, role: "img", label: name, hidden: undefined };
}
```

Create `src/utils/program-badge.d.ts`:

```ts
import type { ClassValue } from "clsx";
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../types";
import type { ProgramBadgePath } from "../data/program-badge-icons";

export interface ProgramBadgeOptions {
  /** Visible label. Trimmed; whitespace-only counts as no text. */
  text?: string | null;
  /** A built-in icon. `""` counts as no icon. */
  icon?: ProgramBadgeIcon | "" | null;
  /** @default 16 */
  size?: ProgramBadgeSize | `${ProgramBadgeSize}` | null;
  /** The icon's accessible name when the badge has no text. @default the icon's own label */
  iconLabel?: string | null;
  /** The caller's classes, in any form `cn()` accepts (Marko's `class` may be an array or object). */
  className?: ClassValue;
}

export interface ResolvedProgramBadgeIcon {
  paths: readonly ProgramBadgePath[];
  /** `"img"` when the icon is the badge's only content; `undefined` when text names the badge. */
  role: "img" | undefined;
  /** `aria-label`, alongside `role="img"`. */
  label: string | undefined;
  /** `aria-hidden`, as the string ARIA expects. */
  hidden: "true" | undefined;
}

export interface ResolvedProgramBadge {
  /** `program-badge`, then the size modifier, then the caller's classes. */
  className: string;
  text: string | undefined;
  icon: ResolvedProgramBadgeIcon | null;
}

/**
 * Validates a program badge's options and decides its markup. `null` when there
 * is neither an icon nor text, so nothing renders. Throws on an unknown icon or
 * size, and on an icon-only badge whose `iconLabel` is empty.
 */
export declare function resolveProgramBadge(options?: ProgramBadgeOptions): ResolvedProgramBadge | null;
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS. Every test in `tests/program-badge.test.js`, `tests/dialog-options.test.js` and `tests/html-dialog.test.js` passes.

- [ ] **Step 7: Type-check**

```bash
npm i --no-save @astrojs/check @marko/type-check && npx astro check; echo "astro check exit $?"; rm -rf .astro
```
Expected: `0 errors`, then `astro check exit 0`.

- [ ] **Step 8: Commit**

```bash
git add src/types.d.ts src/data/program-badge-icons.js src/data/program-badge-icons.d.ts src/utils/program-badge.js src/utils/program-badge.d.ts tests/program-badge.test.js
git commit -m "Add the ProgramBadge icon data and option resolver"
```
(End the message with the attribution trailer; see Global Constraints.)

---

### Task 2: Stylesheet, Astro component and Astro stories

**Files:**
- Create: `src/styles/program-badge.css`, `src/astro/ui/ProgramBadge.astro`, `stories/program-badge-cases.ts`, `stories/ui/ProgramBadge.stories.ts`
- Test: `$SCRATCH/program-badge-e2e/contract.mjs`, `$SCRATCH/program-badge-e2e/astro.e2e.mjs` (not committed)

**Interfaces:**
- Consumes: `resolveProgramBadge` and `PROGRAM_BADGE_ICONS` (Task 1), `ProgramBadgeIcon` and `ProgramBadgeSize` (Task 1), and `harness.mjs` (Task 0).
- Produces:
  - The classes `program-badge`, `program-badge--24`, `program-badge__icon` and `program-badge__text`.
  - `cases` (keys `Default`, `TextOnly`, `IconOnly`, `Large`, `IconOnlyMalayLabel`, `WithAttributes`) and the type `ProgramBadgeCase`, from `stories/program-badge-cases.ts`.
  - Astro story ids `components-programbadge--{default,text-only,icon-only,large,icon-only-malay-label,with-attributes}`.
  - `badgeContract({ label, dir, prefix })`, from `contract.mjs`.

- [ ] **Step 1: Write the shared contract and the Astro test**

Create `$SCRATCH/program-badge-e2e/contract.mjs`:

```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { REPO, serveDir, launch, openStory, badges, contrast, box, kebab } from "./harness.mjs";

const { PROGRAM_BADGE_ICONS } = await import(pathToFileURL(join(REPO, "src/data/program-badge-icons.js")).href);
const PATHS = PROGRAM_BADGE_ICONS["top-rated-seller"].paths.map(({ d, fillRule }) =>
  fillRule ? { d, "fill-rule": fillRule } : { d },
);
const SVG = { class: "program-badge__icon", fill: "currentColor", focusable: "false", viewBox: "0 0 24 24" };
const TEXT = (text) => ({ tag: "span", attrs: { class: "program-badge__text" }, text, children: [] });

/**
 * The markup and accessibility contract every renderer's stories must meet.
 * `dir` is the Storybook build directory under REPO; `prefix` its story-id prefix.
 */
export function badgeContract({ label, dir, prefix }) {
  let server, base, browser;
  before(async () => {
    ({ server, url: base } = await serveDir(join(REPO, dir)));
    browser = await launch();
  });
  after(async () => {
    await browser?.close();
    server?.close();
  });
  const open = (name, opts) => openStory(browser, base, `${prefix}--${kebab(name)}`, opts);

  test(`${label}: icon + text hides the icon and lets the text name the badge`, async () => {
    const page = await open("Default");
    const [badge] = await badges(page);
    assert.equal(badge.tag, "span");
    assert.deepEqual(badge.attrs, { class: "program-badge" });
    const [svg, text] = badge.children;
    assert.deepEqual(svg.attrs, { ...SVG, "aria-hidden": "true" });
    assert.deepEqual(svg.children.map((p) => p.attrs), PATHS);
    assert.deepEqual(text, TEXT("Top rated seller"));
    assert.equal(await page.getByRole("img").count(), 0);
    await page.close();
  });

  test(`${label}: icon only is named by the icon's own label`, async () => {
    const page = await open("IconOnly");
    const [badge] = await badges(page);
    assert.equal(badge.children.length, 1);
    assert.deepEqual(badge.children[0].attrs, { ...SVG, role: "img", "aria-label": "Top rated seller" });
    assert.equal(await page.getByRole("img", { name: "Top rated seller", exact: true }).count(), 1);
    await page.close();
  });

  test(`${label}: icon only with a Malay iconLabel is named in Malay`, async () => {
    const page = await open("IconOnlyMalayLabel");
    assert.equal(await page.getByRole("img", { name: "Penjual terbaik", exact: true }).count(), 1);
    await page.close();
  });

  test(`${label}: text only renders no icon`, async () => {
    const page = await open("TextOnly");
    const [badge] = await badges(page);
    assert.deepEqual(badge.children, [TEXT("Free inspection")]);
    await page.close();
  });

  test(`${label}: icon is 16×16 by default and 24×24 at size 24`, async () => {
    const small = await open("Default");
    assert.deepEqual(await box(small, ".program-badge__icon"), { width: 16, height: 16 });
    await small.close();
    const large = await open("Large");
    const [badge] = await badges(large);
    assert.equal(badge.attrs.class, "program-badge program-badge--24");
    assert.deepEqual(await box(large, ".program-badge__icon"), { width: 24, height: 24 });
    await large.close();
  });

  test(`${label}: the caller's class and attributes reach the badge exactly once`, async () => {
    const page = await open("WithAttributes");
    const [badge] = await badges(page);
    assert.deepEqual(badge.attrs, { class: "program-badge extra", "data-test": "badge", id: "badge-1" });
    await page.close();
  });

  /* The OS colour scheme is emulated to match the toolbar theme. The Astro
     ThemeFrame paints its canvas with Tailwind's `bg-base-100`, a `--color-*`
     utility that keeps its :root value inside a nested [data-theme], so a
     mismatched scheme would measure the badge against the wrong canvas. The
     mismatched case is pinned separately, in astro.e2e.mjs. */
  for (const theme of ["dark", "light"]) {
    test(`${label}: contrast in the ${theme} theme — icon ≥ 3:1, text ≥ 4.5:1`, async () => {
      const iconPage = await open("IconOnly", { theme, colorScheme: theme });
      assert.ok((await contrast(iconPage, ".program-badge__icon")) >= 3);
      await iconPage.close();
      const textPage = await open("Default", { theme, colorScheme: theme });
      assert.ok((await contrast(textPage, ".program-badge__text")) >= 4.5);
      await textPage.close();
    });
  }
}
```

Create `$SCRATCH/program-badge-e2e/astro.e2e.mjs`:

```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { REPO, serveDir, launch, openStory, accentPair } from "./harness.mjs";
import { badgeContract } from "./contract.mjs";

badgeContract({ label: "astro", dir: "storybook-static", prefix: "components-programbadge" });

/* ThemeFrame nests [data-theme] inside an unthemed <html>, and the page is
   emulated in light mode: the case where `--color-accent` would still carry
   the :root (light) value. The icon must follow the frame instead. */
let server, base, browser;
before(async () => {
  ({ server, url: base } = await serveDir(join(REPO, "storybook-static")));
  browser = await launch();
});
after(async () => {
  await browser?.close();
  server?.close();
});

test("astro: a dark subtree under a light page uses the dark accent", async () => {
  const page = await openStory(browser, base, "components-programbadge--icon-only", { theme: "dark", colorScheme: "light" });
  const pair = await accentPair(page);
  assert.equal(pair.theme, "dark");
  assert.equal(pair.rootTheme, null);
  assert.deepEqual(pair.icon, pair.frame);
  assert.notDeepEqual(pair.icon, pair.root);
  await page.close();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd "$REPO" && npm run build-storybook
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test astro.e2e.mjs
```
Expected: FAIL. Every test times out waiting for `.program-badge`, because the stories do not exist yet.

- [ ] **Step 3: Write the stylesheet**

Create `src/styles/program-badge.css`:

```css
/*
  Program badge styles, shared by both renderers: `astro/ui/ProgramBadge.astro`
  and `marko/program-badge.marko` each import this file, so the two cannot
  drift apart.

  BEM: `program-badge` is the block, `__icon` and `__text` its elements, and
  `--24` the large size. Marko's styles are global, so the block namespaces
  every rule.

  Tokens are read `--lux-*` first, then the daisyUI name, then a literal.
  Tailwind's @theme declares `--color-accent: var(--lux-accent)` on :root, and
  a custom property resolves where it is declared, so inside a nested
  [data-theme] `--color-accent` still carries the :root value, while
  `--lux-accent` is redeclared on the themed element (see dialog.css). In an
  app with daisyUI and no tokens.css, `--lux-*` is undefined and daisyUI's
  variable takes over. The literal keeps an app that defines neither working.
*/

.program-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-sm, 0.875rem);
  line-height: 1.25rem;
}

.program-badge__icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--lux-accent, var(--color-accent, oklch(52% 0.16 232.661)));
}

.program-badge--24 {
  gap: 0.5rem;
  font-size: var(--text-base, 1rem);
  line-height: 1.5rem;
}

.program-badge--24 .program-badge__icon {
  width: 1.5rem;
  height: 1.5rem;
}
```

- [ ] **Step 4: Write the Astro component**

Create `src/astro/ui/ProgramBadge.astro`:

```astro
---
/*
  Prints what `resolveProgramBadge()` decides, and nothing else. Every class,
  `role` and `aria-*` value below comes from the resolver, which the Marko tag
  (`src/marko/program-badge.marko`) shares, so the two renderers cannot drift.

  The stylesheet is imported in the frontmatter, as Logo.astro does, so
  importing the component is the whole setup.
*/
import "../../styles/program-badge.css";
import type { HTMLAttributes } from "astro/types";
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../../types";
import { resolveProgramBadge } from "../../utils/program-badge.js";

/**
 * A programme badge: an icon and/or a short label, such as "Top rated seller".
 *
 * With `text`, the icon is decorative and hidden from assistive tech. Without
 * it, the icon carries the badge's accessible name: `iconLabel`, or the icon's
 * own label. Renders nothing when there is neither. Throws on an unknown `icon`
 * or `size`, which fails the build with the message.
 *
 * Other attributes (`id`, `data-*`, …) go on the outer `<span>`.
 */
export type Props = HTMLAttributes<"span"> & {
  /** Visible label. */
  text?: string;
  /** A built-in icon. */
  icon?: ProgramBadgeIcon;
  /** Icon size in px; also sets the text size and gap. @default 16 */
  size?: ProgramBadgeSize;
  /**
   * What screen readers hear for an icon-only badge. Ignored when `text` is set.
   * @default the icon's own label, e.g. "Top rated seller"
   */
  iconLabel?: string;
};

/*
  `class` comes out of the spread instead of being written after it. Astro
  emits a spread's attribute and an explicit one of the same name as two
  attributes, and an HTML parser keeps the first (see Button.astro), so the
  resolver's merged class would be lost.
*/
const { text, icon, size, iconLabel, class: className, ...attrs } = Astro.props;
const badge = resolveProgramBadge({ text, icon, size, iconLabel, className });
---

{
  badge && (
    <span {...attrs} class={badge.className}>
      {badge.icon && (
        <svg
          class="program-badge__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          focusable="false"
          role={badge.icon.role}
          aria-label={badge.icon.label}
          aria-hidden={badge.icon.hidden}
        >
          {badge.icon.paths.map((shape) => <path d={shape.d} fill-rule={shape.fillRule} />)}
        </svg>
      )}
      {badge.text && <span class="program-badge__text">{badge.text}</span>}
    </span>
  )
}
```

- [ ] **Step 5: Write the shared cases and the Astro stories**

Create `stories/program-badge-cases.ts`:

```ts
/*
  Story cases shared by the Astro stories (stories/ui/), the Marko stories
  (stories-marko/) and the parity test, so both renderers are shown, and
  checked, with the same inputs. Framework-free: it imports no component.
*/
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../src/types";

export interface ProgramBadgeCase {
  text?: string;
  icon?: ProgramBadgeIcon;
  size?: ProgramBadgeSize;
  iconLabel?: string;
  class?: string;
  id?: string;
  "data-test"?: string;
}

export const cases = {
  Default: { icon: "top-rated-seller", text: "Top rated seller" },
  TextOnly: { text: "Free inspection" },
  IconOnly: { icon: "top-rated-seller" },
  Large: { icon: "top-rated-seller", text: "Top rated seller", size: 24 },
  IconOnlyMalayLabel: { icon: "top-rated-seller", iconLabel: "Penjual terbaik" },
  WithAttributes: {
    icon: "top-rated-seller",
    text: "Top rated seller",
    class: "extra",
    id: "badge-1",
    "data-test": "badge",
  },
} satisfies Record<string, ProgramBadgeCase>;
```

Create `stories/ui/ProgramBadge.stories.ts`:

```ts
import ProgramBadge from "../../src/astro/ui/ProgramBadge.astro";
import { cases } from "../program-badge-cases";
/*
  Astro components are prerendered to markup by the Storybook framework, so
  the stylesheet reaches the story as a module here, as it does for Dialog.
*/
import "../../src/styles/program-badge.css";

/**
 * The cases come from `stories/program-badge-cases.ts`. The Marko stories and
 * the parity test read the same file, so both renderers are shown with the
 * same inputs.
 */
export default {
  title: "Components/ProgramBadge",
  component: ProgramBadge,
  tags: ["autodocs"],
};

export const Default = { args: cases.Default };
export const TextOnly = { args: cases.TextOnly };
export const IconOnly = { args: cases.IconOnly };
export const Large = { args: cases.Large };
export const IconOnlyMalayLabel = { args: cases.IconOnlyMalayLabel };
export const WithAttributes = { args: cases.WithAttributes };
```

- [ ] **Step 6: Build and run the test to verify it passes**

```bash
cd "$REPO" && npm run build-storybook
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test astro.e2e.mjs
```
Expected: PASS. All eight contract tests and "a dark subtree under a light page uses the dark accent" pass.

- [ ] **Step 7: Type-check and unit tests**

```bash
cd "$REPO" && npm test && npm i --no-save @astrojs/check @marko/type-check && npx astro check; echo "astro check exit $?"; rm -rf .astro
```
Expected: all unit tests pass, `0 errors`, then `astro check exit 0`.

- [ ] **Step 8: Commit**

```bash
git add src/styles/program-badge.css src/astro/ui/ProgramBadge.astro stories/program-badge-cases.ts stories/ui/ProgramBadge.stories.ts
git commit -m "Add the ProgramBadge Astro component, stylesheet and stories"
```
(End the message with the attribution trailer.)

---

### Task 3: Marko tag, packaging and the Marko Storybook

**Files:**
- Create: `src/marko/program-badge.marko`, `marko.json`, `tsconfig.marko.json`, `.storybook-marko/main.ts`, `.storybook-marko/preview.ts`, `.storybook-marko/preview.css`, `stories-marko/program-badge.stories.ts`
- Modify: `package.json`, `package-lock.json`, `stories/program-badge-cases.ts` (append `markoArgTypes`)
- Test: `$SCRATCH/program-badge-e2e/marko.e2e.mjs` (not committed)

**Interfaces:**
- Consumes: `resolveProgramBadge` and the types (Task 1), `program-badge.css` and `cases` (Task 2), `badgeContract` (Task 2), and `FINDINGS.md` (Task 0).
- Produces:
  - The tag `<program-badge>`, with `Input` exported from `src/marko/program-badge.marko`.
  - Marko story ids `components-program-badge--{default,text-only,icon-only,large,icon-only-malay-label,with-attributes}`, built into `storybook-static/marko/`.
  - The scripts `storybook:marko` and `build-storybook` (both Storybooks).
  - The export subpaths `./marko/*.marko` and `./marko/*`.

- [ ] **Step 1: Install the Marko devDependencies**

```bash
cd "$REPO" && npm i -D marko@^6.4.5 @storybook/marko@^10.1.0 @storybook/marko-vite@^5.0.0
npm ls marko @storybook/marko @storybook/marko-vite @marko/vite storybook vite
```
Expected: the same versions the spike recorded in Step 1 of Task 0, with no `invalid` lines.

- [ ] **Step 2: Write the failing Marko test**

Create `$SCRATCH/program-badge-e2e/marko.e2e.mjs`:

```js
import { badgeContract } from "./contract.mjs";

badgeContract({ label: "marko", dir: "storybook-static/marko", prefix: "components-program-badge" });
```

Run: `cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test marko.e2e.mjs`
Expected: FAIL, because `storybook-static/marko` does not exist (every test errors on `.program-badge`, or the server returns 404).

- [ ] **Step 3: Write the Marko tag**

Create `src/marko/program-badge.marko`:

```marko
/*
  Prints what `resolveProgramBadge()` decides, and nothing else. Every class,
  role and aria-* value below comes from the resolver, which
  `astro/ui/ProgramBadge.astro` shares, so the two renderers cannot drift.

  Concise syntax, by repo convention. The stylesheet is imported instead of
  sitting beside the tag as an auto-discovered style.css because the Astro
  renderer shares it, and sharing across templates is the case Marko's
  styling guide gives for an imported stylesheet.
*/
import "../styles/program-badge.css"
import { resolveProgramBadge } from "../utils/program-badge.js"
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../types"

export interface Input extends Omit<Marko.HTML.Span, "content"> {
  /** Visible label. */
  text?: string
  /** A built-in icon. */
  icon?: ProgramBadgeIcon
  /** Icon size in px; also sets the text size and gap. @default 16 */
  size?: ProgramBadgeSize
  /**
   * What screen readers hear for an icon-only badge. Ignored when `text` is set.
   * @default the icon's own label, e.g. "Top rated seller"
   */
  iconLabel?: string
  /** Not supported: the badge renders no body content. */
  content?: never
}

/*
  `class` and `content` come out of the spread. The resolver owns the merged
  class, and Marko 6 native tags accept `content` as an attribute, so
  spreading it would render body content this tag does not support.
*/
const/{ text, icon, size, iconLabel, class: className, content: _content, ...attrs }=input
const/badge=resolveProgramBadge({ text, icon, size, iconLabel, className })

if=badge
  span ...attrs class=badge.className
    if=badge.icon
      svg
        ,class="program-badge__icon"
        ,viewBox="0 0 24 24"
        ,fill="currentColor"
        ,focusable="false"
        ,role=badge.icon.role
        ,aria-label=badge.icon.label
        ,aria-hidden=badge.icon.hidden
        for|shape| of=badge.icon.paths
          path d=shape.d fill-rule=shape.fillRule
    if=badge.text
      span.program-badge__text -- ${badge.text}
```

**S3 fallback A.** Apply this only if `FINDINGS.md` says "S3: TS does not compile". Move the three statements that use TypeScript syntax (`import type …`, `export interface Input … { … }` with its JSDoc) out of `program-badge.marko` into a new `src/marko/program-badge.d.marko`, laid out exactly like the `.d.marko` captured in `FINDINGS.md`. Keep everything else in `program-badge.marko` unchanged; it uses no TypeScript syntax. Remove `"script-lang"` from `marko.json` in Step 4. Add `src/marko/program-badge.d.marko` to the Step 10 `git add`.

- [ ] **Step 4: Make the tag discoverable and packaged**

Create `marko.json`:

```json
{
  "exports": "./src/marko",
  "script-lang": "ts"
}
```

Edit `package.json`:
- `"description"`: `"Accessible components for HTML, Astro, Marko and Tailwind CSS."`
- `"files"`: `["src", "marko.json", "README.md"]`
- In `"exports"`, after the two `./astro/*` entries, add:
  ```json
      "./marko/*.marko": "./src/marko/*.marko",
      "./marko/*": "./src/marko/*.marko"
  ```
- `"keywords"`: add `"marko"` after `"astro"`.
- Add, after `"dependencies"`:
  ```json
    "peerDependencies": {
      "marko": "^6"
    },
    "peerDependenciesMeta": {
      "marko": {
        "optional": true
      }
    },
  ```
- In `"scripts"`, replace `"build-storybook"` and add `"storybook:marko"` after `"storybook"`:
  ```json
      "storybook:marko": "storybook dev -p 6007 -c .storybook-marko",
      "build-storybook": "storybook build && storybook build -c .storybook-marko -o storybook-static/marko",
  ```

```bash
cd "$REPO" && npm install --package-lock-only --ignore-scripts && npm run check:exports
```
Expected: `exports check passed (14 subpaths, v0.5.0)`.

- [ ] **Step 5: Add the Marko type gate's project**

Create `tsconfig.marko.json`:

```jsonc
// The Marko type gate: `npx mtc -p tsconfig.marko.json` (with @marko/type-check
// installed transiently). Kept apart from tsconfig.json, which `astro check`
// reads, so neither toolchain sees the other's files. The framework-free files
// (src/utils, src/data, src/types.d.ts, stories/program-badge-cases.ts) are
// pulled in through imports.
{
  "include": ["src/marko", "stories-marko", ".storybook-marko"],
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": false,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "lib": ["DOM", "ESNext"],
    "types": ["vite/client"],
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 6: Add the Marko Storybook**

Create `.storybook-marko/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/marko-vite";

/*
  The Marko Storybook. `npm run build-storybook` builds it into
  storybook-static/marko/, and the Astro Storybook composes it through `refs`
  (.storybook/main.ts), so the published site shows both in one sidebar.

  Stories live in stories-marko/, outside src/, for the reason the Astro
  stories live in stories/: package.json#files ships all of src/.
  @storybook/marko-vite adds @marko/vite itself.
*/
export default {
  framework: "@storybook/marko-vite",
  stories: ["../stories-marko/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
} satisfies StorybookConfig;
```

Create `.storybook-marko/preview.css`:

```css
/*
  The Marko preview loads the design tokens and paints each story's canvas
  from them. No Tailwind: the badge ships its own stylesheet and no utility
  classes. The theme decorator in preview.ts puts `data-theme` and this class
  on the canvas element, so `--lux-*` is redeclared where it is read, as it is
  under the Astro preview's ThemeFrame.
*/
@import "../src/styles/tokens.css";

.lux-canvas {
  background: var(--lux-base-100);
  color: var(--lux-base-content);
  padding: 2rem;
}
```

Create `.storybook-marko/preview.ts`:

```ts
import type { Decorator, Preview } from "@storybook/marko";
import "./preview.css";

/*
  Applies the toolbar theme to the story's canvas element and returns the
  story untouched, the mechanism @storybook/addon-themes uses.

  A decorator that wraps the story in a theme template, as the Astro preview's
  ThemeFrame does, is not an option: @storybook/marko 10.1 throws "Decorators
  are not yet supported in Tags API templates" for any decorator that returns a
  Marko 6 component. Touching the DOM is safe here, unlike in the Astro
  preview, because this renderer only runs in the browser; there is no static
  prerender in Node.
*/
const withTheme: Decorator = (story, context) => {
  context.canvasElement.dataset.theme = context.globals.theme;
  context.canvasElement.classList.add("lux-canvas");
  return story();
};

export default {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Luxoticars theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  decorators: [withTheme],
} satisfies Preview;
```

**S4 fallback.** Apply this only if `FINDINGS.md` says "no canvasElement". Replace both `context.canvasElement` with `document.body`, and change the comment's first sentence to "Applies the toolbar theme to the preview's `<body>`…".

**S1 fallback.** Apply this only if `FINDINGS.md` says "`@theme` needs Tailwind". Add `import tailwindcss from "@tailwindcss/vite";` and `async viteFinal(config) { config.plugins = [...(config.plugins ?? []), tailwindcss()]; return config; }` to `.storybook-marko/main.ts`, as `.storybook/main.ts` has. Then make `@import "tailwindcss";` the first line of `preview.css`, and replace "No Tailwind:" in its comment with "Tailwind only so tokens.css's `@theme` rule parses:".

- [ ] **Step 7: Add the Marko `argTypes` and stories**

Append to `stories/program-badge-cases.ts`:

```ts

/**
 * Controls for the Marko stories. @storybook/marko has no docgen, so these are
 * written out, with the descriptions of the JSDoc on the tag's `Input`. The
 * Astro stories get theirs from `Props` instead.
 */
export const markoArgTypes = {
  text: { control: "text", description: "Visible label." },
  icon: {
    control: "select",
    options: ["top-rated-seller", "none"],
    mapping: { none: undefined },
    description: "A built-in icon.",
  },
  size: {
    control: "inline-radio",
    options: [16, 24],
    description: "Icon size in px; also sets the text size and gap.",
    table: { defaultValue: { summary: "16" } },
  },
  iconLabel: {
    control: "text",
    description: "What screen readers hear for an icon-only badge. Ignored when `text` is set.",
    table: { defaultValue: { summary: "the icon's own label" } },
  },
};
```

Create `stories-marko/program-badge.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/marko";
import ProgramBadge, { type Input } from "../src/marko/program-badge.marko";
import { cases, markoArgTypes } from "../stories/program-badge-cases";

/**
 * `<program-badge>` for Marko 6 apps. It is discovered through the package's
 * marko.json, so it needs no import:
 *
 * ```marko
 * program-badge icon="top-rated-seller" text="Top rated seller"
 * ```
 *
 * The cases are shared with the Astro stories (stories/program-badge-cases.ts).
 */
export default {
  title: "Components/program-badge",
  component: ProgramBadge,
  tags: ["autodocs"],
  argTypes: markoArgTypes,
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const Default: Story = { args: cases.Default };
export const TextOnly: Story = { args: cases.TextOnly };
export const IconOnly: Story = { args: cases.IconOnly };
export const Large: Story = { args: cases.Large };
export const IconOnlyMalayLabel: Story = { args: cases.IconOnlyMalayLabel };
export const WithAttributes: Story = { args: cases.WithAttributes };
```

**Typing fallback.** Apply this only if `FINDINGS.md` "S1 type gate" reported that `Input` does not satisfy Storybook's `Args` (for example "Index signature for type 'string' is missing"). Import `type Args` alongside `Meta` and `StoryObj` from `@storybook/marko`, and use `Meta<Input & Args>` and `StoryObj<Input & Args>`.

- [ ] **Step 8: Build and run the Marko test to verify it passes**

```bash
cd "$REPO" && npm run build-storybook && ls storybook-static/marko/index.json
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test marko.e2e.mjs astro.e2e.mjs
```
Expected: `storybook-static/marko/index.json` exists, and every marko and astro test passes.

- [ ] **Step 9: Run every gate**

```bash
cd "$REPO" && npm test && npm run check:exports
npm i --no-save @astrojs/check @marko/type-check
npx astro check; echo "astro check exit $?"; rm -rf .astro
npx mtc -p tsconfig.marko.json; echo "mtc exit $?"
npm pack --dry-run 2>&1 | grep -E "marko.json|src/marko/program-badge.marko"
npm pack --dry-run 2>&1 | grep -E "stories|storybook|tests/|docs/|tsconfig" ; echo "leak-check exit $?"
```
Expected: unit tests pass, the exports check passes, `astro check exit 0` and `mtc exit 0`. The first grep lists both files. The second prints nothing and `leak-check exit 1`.

**S3 fallback B.** Apply this only if `FINDINGS.md` says "types do not reach the consumer". Commit the emitted `.d.marko` beside the tag:

```bash
cd "$REPO" && cat > tsconfig.marko-emit.json <<'EOF'
// Emits src/marko/*.d.marko for consumers (S3 fallback B). Not the type gate:
// that is tsconfig.marko.json. Output goes to .marko-emit/ (gitignored).
{
  "include": ["src/marko"],
  "compilerOptions": {
    "outDir": ".marko-emit", "rootDir": "src/marko", "declaration": true, "strict": true, "allowJs": true,
    "module": "ESNext", "moduleResolution": "bundler", "target": "ESNext", "lib": ["DOM", "ESNext"],
    "types": ["vite/client"], "skipLibCheck": true
  }
}
EOF
printf '.marko-emit/\n' >> .gitignore
npx mtc -p tsconfig.marko-emit.json && cp .marko-emit/program-badge.d.marko src/marko/ && git diff --exit-code src/marko/program-badge.d.marko; echo "staleness exit $?"
```
Add `tsconfig.marko-emit.json`, `.gitignore` and `src/marko/program-badge.d.marko` to the Step 10 `git add`. Task 5 records the staleness command in CONTRIBUTING's Testing section. Leave `tsconfig.marko-emit.json` out of `files`; it is not in `src/`, so it is excluded already.

- [ ] **Step 10: Commit**

```bash
git add src/marko/program-badge.marko marko.json tsconfig.marko.json .storybook-marko stories-marko stories/program-badge-cases.ts package.json package-lock.json
git commit -m "Add the program-badge Marko tag and a Marko Storybook"
```
(End the message with the attribution trailer.)

---

### Task 4: Compose the Marko Storybook into the Astro one

**Files:**
- Modify: `.storybook/main.ts`
- Modify (S2 fallback only): `.github/workflows/storybook.yml`
- Test: `$SCRATCH/program-badge-e2e/composed.e2e.mjs` (not committed)

**Interfaces:**
- Consumes: both Storybook builds (Tasks 2 and 3), `cases` (Task 2), `harness.mjs` (Task 0) and `FINDINGS.md` S2.
- Produces: the host's ref id `marko`, so composed story ids are `marko_components-program-badge--…`.

- [ ] **Step 1: Write the failing composition and parity tests**

Create `$SCRATCH/program-badge-e2e/composed.e2e.mjs`:

```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { REPO, serveDir, launch, openStory, badges, kebab } from "./harness.mjs";

/* The case names, read from the shared cases file's exports line by line so
   this test needs no TypeScript loader. */
import { readFileSync } from "node:fs";
const CASES = [
  ...readFileSync(join(REPO, "stories/program-badge-cases.ts"), "utf8")
    .match(/export const cases = \{([\s\S]*?)\n\} satisfies/)[1]
    .matchAll(/^ {2}(\w+):/gm),
].map((m) => m[1]);

let browser;
before(async () => (browser = await launch()));
after(() => browser?.close());

test("the shared cases file lists the six cases", () => {
  assert.deepEqual(CASES, ["Default", "TextOnly", "IconOnly", "Large", "IconOnlyMalayLabel", "WithAttributes"]);
});

for (const base of ["/", "/luxoticars-ui/"]) {
  test(`composition: the Marko stories render inside the Astro Storybook, served at ${base}`, async () => {
    const { server, url } = await serveDir(join(REPO, "storybook-static"), base);
    const page = await browser.newPage();
    await page.goto(`${url}/?path=/story/marko_components-program-badge--default`);
    const frame = page.frameLocator("#storybook-preview-iframe");
    await frame.locator(".program-badge").waitFor({ timeout: 30_000 });
    assert.match(await page.locator("#storybook-preview-iframe").getAttribute("src"), /marko\/iframe\.html/);
    assert.equal(await frame.locator(".program-badge__text").textContent(), "Top rated seller");
    await page.close();
    server.close();
  });
}

test("parity: Astro and Marko render the same tree for every case", async () => {
  const { server, url } = await serveDir(join(REPO, "storybook-static"));
  for (const name of CASES) {
    const astro = await openStory(browser, url, `components-programbadge--${kebab(name)}`);
    const marko = await openStory(browser, `${url}/marko`, `components-program-badge--${kebab(name)}`);
    assert.deepEqual(await badges(marko), await badges(astro), name);
    await astro.close();
    await marko.close();
  }
  server.close();
});
```

Run: `cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test composed.e2e.mjs`
Expected: the cases test and parity pass. Both composition tests FAIL (timeout on `.program-badge`), because the host has no `refs` yet.

- [ ] **Step 2: Add `refs` to the Astro Storybook**

In `.storybook/main.ts`, inside `config`, directly after the `addons` line, add:

```ts
  /*
    The Marko Storybook (.storybook-marko/), composed into this one so both
    renderers share one sidebar. In development it is its own dev server
    (`npm run storybook:marko`, port 6007). In the static build it is built
    into storybook-static/marko/, so a relative URL works both at the custom
    domain root and under a fork's /luxoticars-ui/ path.
  */
  refs: (_config, { configType }) => ({
    marko: {
      title: "Marko",
      url: configType === "DEVELOPMENT" ? "http://localhost:6007" : "./marko",
    },
  }),
```

**S2 fallback.** Apply this only if `FINDINGS.md` says "relative URL fails". Use `url: configType === "DEVELOPMENT" ? "http://localhost:6007" : process.env.STORYBOOK_MARKO_URL || "./marko",` and change the comment's last sentence to "In the static build its absolute URL comes from STORYBOOK_MARKO_URL, which the Pages workflow sets, because a relative ref URL does not resolve (see the spike findings in the PR)." In `.github/workflows/storybook.yml`, add a step before "Build Storybook":

```yaml
      - id: pages
        if: github.event_name != 'pull_request'
        uses: actions/configure-pages@v5
```

Then give "Build Storybook" this `env`:

```yaml
        env:
          STORYBOOK_MARKO_URL: ${{ steps.pages.outputs.base_url && format('{0}/marko', steps.pages.outputs.base_url) || '' }}
```

Run the composition tests with `STORYBOOK_MARKO_URL=http://127.0.0.1:<port>/marko`. That needs a fixed port: change `serveDir`'s `listen(0, …)` to `listen(Number(process.env.PORT ?? 0), …)`, and pass `PORT`.

- [ ] **Step 3: Rebuild and run the tests to verify they pass**

```bash
cd "$REPO" && npm run build-storybook
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test composed.e2e.mjs astro.e2e.mjs marko.e2e.mjs
```
Expected: PASS. The composition tests pass at `/` and `/luxoticars-ui/`, parity passes for all six cases, and the astro and marko contracts still pass.

- [ ] **Step 4: Check the dev composition by hand**

```bash
cd "$REPO" && (npm run storybook:marko > "$SCRATCH/sb-marko-dev.log" 2>&1 &) && (npm run storybook > "$SCRATCH/sb-astro-dev.log" 2>&1 &)
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --input-type=module -e '
const h = await import("./harness.mjs");
await h.waitForHttp("http://localhost:6007/index.json"); await h.waitForHttp("http://localhost:6006/index.json");
const b = await h.launch(); const p = await b.newPage();
await p.goto("http://localhost:6006/?path=/story/marko_components-program-badge--default");
await p.frameLocator("#storybook-preview-iframe").locator(".program-badge").waitFor({ timeout: 60000 });
console.log("dev composition ok"); await b.close();'
pkill -f "storybook dev" || true
```
Expected: `dev composition ok`.

- [ ] **Step 5: Type-check and commit**

```bash
cd "$REPO" && npm i --no-save @astrojs/check @marko/type-check && npx astro check; echo "astro check exit $?"; rm -rf .astro
git add .storybook/main.ts
git commit -m "Compose the Marko Storybook into the Astro Storybook"
```
Expected: `astro check exit 0`. If the S2 fallback was applied, also `git add .github/workflows/storybook.yml`. (End the message with the attribution trailer.)

---

### Task 5: Consumer apps, changeset and docs

Proves the package works in real apps. A Marko 6 app discovers `<program-badge>`, compiles it, server-renders it and type-checks it. An Astro app uses `ProgramBadge` without Marko installed.

**Files:**
- Create: `.changeset/program-badge.md`
- Modify: `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `docs/superpowers/specs/2026-10-13-program-badge-design.md` (status line)
- Test: `$SCRATCH/marko-consumer/*`, `$SCRATCH/astro-consumer/*`, `$SCRATCH/program-badge-e2e/consumer.e2e.mjs` (not committed)

**Interfaces:**
- Consumes: the whole package as packed (`npm pack`), and `FINDINGS.md` S3 (`ssr.noExternal`).
- Produces: a changeset, the docs, and a verification record for the PR description.

- [ ] **Step 1: Pack the package and scaffold both consumers**

```bash
cd "$REPO" && npm pack --pack-destination "$SCRATCH"
```
Expected: `$SCRATCH/luxoticars-ui-0.5.0.tgz`.

The Marko 6 consumer:

```bash
mkdir -p "$SCRATCH/marko-consumer/src/negative" && cd "$SCRATCH/marko-consumer" && cat > package.json <<'EOF'
{
  "name": "program-badge-marko-consumer",
  "private": true,
  "type": "module",
  "scripts": { "build": "vite build --ssr src/render.js --outDir dist" },
  "dependencies": {
    "marko": "^6.4.5",
    "@luxoticars/ui": "file:../luxoticars-ui-0.5.0.tgz"
  },
  "devDependencies": {
    "@marko/vite": "^6.1.13",
    "@marko/type-check": "^3.2.1",
    "vite": "^8.3.0"
  }
}
EOF
cat > vite.config.js <<'EOF'
import marko from "@marko/vite";

export default { plugins: [marko({ linked: false })] };
EOF
cat > tsconfig.json <<'EOF'
{
  "include": ["src/page.marko", "src/render.js"],
  "compilerOptions": {
    "strict": true, "noEmit": true, "allowJs": true, "module": "ESNext", "moduleResolution": "bundler",
    "target": "ESNext", "lib": ["DOM", "ESNext"], "types": ["vite/client"], "skipLibCheck": true
  }
}
EOF
cat > tsconfig.invalid.json <<'EOF'
{ "extends": "./tsconfig.json", "include": ["src/negative/invalid.marko"] }
EOF
cat > src/page.marko <<'EOF'
program-badge icon="top-rated-seller" text="Top rated seller"
program-badge icon="top-rated-seller" iconLabel="Penjual terbaik" size=24
EOF
cat > src/negative/body.marko <<'EOF'
program-badge id="with-attrs" class="extra" data-test="badge" text="Free inspection"
  -- body content the badge must not render
EOF
cat > src/negative/invalid.marko <<'EOF'
program-badge icon="nope" text="x"
EOF
cat > src/render.js <<'EOF'
import page from "./page.marko";
import body from "./negative/body.marko";

console.log(JSON.stringify({ page: await page.render({}), body: await body.render({}) }));
EOF
npm install
```
If `FINDINGS.md` says "consumers need `ssr.noExternal`", make `vite.config.js` `export default { plugins: [marko({ linked: false })], ssr: { noExternal: ["@luxoticars/ui"] } };`.

The Astro consumer:

```bash
mkdir -p "$SCRATCH/astro-consumer/src/pages" && cd "$SCRATCH/astro-consumer" && cat > package.json <<'EOF'
{
  "name": "program-badge-astro-consumer",
  "private": true,
  "type": "module",
  "scripts": { "build": "astro build" },
  "dependencies": {
    "astro": "7.3.2",
    "@luxoticars/ui": "file:../luxoticars-ui-0.5.0.tgz"
  }
}
EOF
cat > src/pages/index.astro <<'EOF'
---
import ProgramBadge from "@luxoticars/ui/astro/ui/ProgramBadge";
import "@luxoticars/ui/styles/tokens.css";
---
<html lang="en">
  <head><meta charset="utf-8" /><title>ProgramBadge consumer</title></head>
  <body>
    <ProgramBadge icon="top-rated-seller" text="Top rated seller" />
    <ProgramBadge icon="top-rated-seller" iconLabel="Penjual terbaik" size={24} />
    <ProgramBadge id="with-attrs" class="extra" data-test="badge" text="Free inspection" />
  </body>
</html>
EOF
npm install
```

- [ ] **Step 2: Write the consumer tests**

Create `$SCRATCH/program-badge-e2e/consumer.e2e.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SCRATCH = process.env.SCRATCH;
if (!SCRATCH) throw new Error("Set SCRATCH to the scratch directory.");
const MARKO = join(SCRATCH, "marko-consumer");
const ASTRO = join(SCRATCH, "astro-consumer");
const run = (cwd, cmd, args) => spawnSync(cmd, args, { cwd, encoding: "utf8" });
const tagOf = (html, id) => html.match(new RegExp(`<span[^>]*id="${id}"[^>]*>`))?.[0] ?? "";

test("marko: <program-badge> is discovered, compiles and server-renders", () => {
  const build = run(MARKO, "npm", ["run", "build"]);
  assert.equal(build.status, 0, build.stdout + build.stderr);
  const out = run(MARKO, "node", ["dist/render.js"]);
  assert.equal(out.status, 0, out.stderr);
  const { page } = JSON.parse(out.stdout);
  assert.doesNotMatch(page, /<program-badge/);
  assert.match(page, /<span class="program-badge"><svg class="program-badge__icon"[^>]*aria-hidden="true"/);
  assert.match(page, /<span class="program-badge__text">Top rated seller<\/span>/);
  assert.match(page, /<span class="program-badge program-badge--24">/);
  assert.match(page, /role="img" aria-label="Penjual terbaik"/);
});

test("marko: body content is not rendered, and the caller's attributes reach the span once", () => {
  const { body } = JSON.parse(run(MARKO, "node", ["dist/render.js"]).stdout);
  assert.doesNotMatch(body, /body content/);
  const tag = tagOf(body, "with-attrs");
  assert.match(tag, /data-test="badge"/);
  assert.match(tag, /class="program-badge extra"/);
  assert.equal(tag.match(/\bclass=/g).length, 1);
});

test("marko: the tag's types reach the consumer — valid usage passes, an unknown icon fails", () => {
  const valid = run(MARKO, "npx", ["mtc", "-p", "tsconfig.json"]);
  assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  const invalid = run(MARKO, "npx", ["mtc", "-p", "tsconfig.invalid.json"]);
  assert.notEqual(invalid.status, 0, "mtc accepted icon=\"nope\"");
  assert.match(invalid.stdout + invalid.stderr, /nope/);
});

test("astro: installs without Marko — the peer dependency is optional", () => {
  assert.equal(existsSync(join(ASTRO, "node_modules/marko")), false);
});

test("astro: builds, renders the badges and bundles their stylesheet", () => {
  const build = run(ASTRO, "npm", ["run", "build"]);
  assert.equal(build.status, 0, build.stdout + build.stderr);
  const html = readFileSync(join(ASTRO, "dist/index.html"), "utf8");
  assert.match(html, /<span class="program-badge"><svg class="program-badge__icon"[^>]*aria-hidden="true"/);
  assert.match(html, /role="img" aria-label="Penjual terbaik"/);
  const tag = tagOf(html, "with-attrs");
  assert.match(tag, /class="program-badge extra"/);
  assert.equal(tag.match(/\bclass=/g).length, 1);
  const assets = join(ASTRO, "dist/_astro");
  const css = [html, ...readdirSync(assets).filter((f) => f.endsWith(".css")).map((f) => readFileSync(join(assets, f), "utf8"))].join("\n");
  assert.match(css, /\.program-badge__icon\s*\{/);
});
```

- [ ] **Step 3: Run the consumer tests**

Run: `cd "$SCRATCH/program-badge-e2e" && SCRATCH="$SCRATCH" node --test consumer.e2e.mjs`
Expected: PASS, all five tests. A failure here is a packaging bug in Tasks 2–3 (`files`, `exports`, `marko.json`, or the peer dependency), not a test to adjust. Fix it there, repack (Step 1), reinstall both consumers with `npm install "../luxoticars-ui-0.5.0.tgz"`, and rerun.

- [ ] **Step 4: Write the changeset**

Create `.changeset/program-badge.md`:

```markdown
---
"@luxoticars/ui": minor
---

Add `ProgramBadge`, an icon and/or a short label such as "Top rated seller", and the package's first Marko component.

- Astro: `import ProgramBadge from "@luxoticars/ui/astro/ui/ProgramBadge"`.
- Marko 6: `<program-badge>`, discovered through the package's new `marko.json`, or imported from `@luxoticars/ui/marko/program-badge`.

Marko is an optional peer dependency, so Astro-only apps install nothing new. The published Storybook now includes a Marko Storybook, composed into the same sidebar.
```

- [ ] **Step 5: Update the docs**

`README.md`:
- Line 3: replace `for HTML, Astro and Tailwind CSS.` with `for HTML, Astro, Marko and Tailwind CSS.`
- Insert this section after the `## Astro API` section, directly before `## Design tokens`:

  ````markdown
  ## Marko API

  Marko 6 tags are discovered through the package's `marko.json`, so a Marko app
  uses them with no import. Marko is an optional peer dependency (`marko@^6`):
  install it in the app, not through this package.

  ```marko
  program-badge icon="top-rated-seller" text="Top rated seller"
  ```

  Tags can also be imported by path, which is the way out if another installed
  package exports a tag with the same name (Marko uses the first one it finds):

  ```marko
  import ProgramBadge from "@luxoticars/ui/marko/program-badge.marko"

  ProgramBadge icon="top-rated-seller"
  ```

  As with the Astro components, props are documented in Storybook, generated from
  each tag's `Input` type, not here.
  ````

  If `FINDINGS.md` says "consumers need `ssr.noExternal`", append to that section: "A Vite app that server-renders must bundle the package's tags: add `ssr: { noExternal: ["@luxoticars/ui"] }` to its Vite config."
- In `## Storybook`, after the first code block (`npm run storybook` / `npm run build-storybook`), add:

  ```markdown
  Marko tags have their own Storybook (`.storybook-marko/`, stories in
  `stories-marko/`), composed into the Astro one so both share one sidebar under
  "Marko". In development run `npm run storybook:marko` (port 6007) alongside
  `npm run storybook`; `npm run build-storybook` builds both, the Marko one into
  `storybook-static/marko/`.
  ```
- In `## Storybook`, change ``files` limits the package to `src` and the README`` to ``files` limits the package to `src`, `marko.json` and the README``.

`CONTRIBUTING.md`:
- `## Running Storybook`: after the `npm run build-storybook` block, add:

  ````markdown
  Marko tags render in a second Storybook, composed into the first. Run both to
  see them together:

  ```bash
  npm run storybook:marko  # http://localhost:6007, shown under "Marko" in 6006
  ```
  ````
- `## Adding a component`: replace the first paragraph with:

  ```markdown
  Components ship up to three renderers: an Astro component, an HTML string
  builder (`src/html/<name>.js` with a hand-written `.d.ts` sibling, exported from
  `src/html/index.js`), and a Marko 6 tag (`src/marko/<name>.marko`). They read
  the same defaults from `src/data/`. Where a component has its own CSS, all of them
  are styled by the same file under `src/styles/`, and where it makes decisions, those
  live in one resolver under `src/utils/` that every renderer follows. `ProgramBadge`
  ships Astro and Marko; its HTML builder is a follow-up.

  Marko tags are written in **concise syntax** and the Marko 6 Tags API only. Their
  stories go in `stories-marko/`, with `argTypes` written out, because
  `@storybook/marko` has no docgen.
  ```
- `## Testing`: after item 1 (Storybook builds), insert:

  ````markdown
  **1a. Types check.** Both type gates must report 0 errors. The tools are not
  dependencies; install them transiently, together, because a later `npm install`
  prunes them:

  ```bash
  npm i --no-save @astrojs/check @marko/type-check
  npx astro check && rm -rf .astro
  npx mtc -p tsconfig.marko.json
  ```
  ````

  If S3 fallback B was applied, add to item 1a: "and the committed `.d.marko` is current: `npx mtc -p tsconfig.marko-emit.json && cp .marko-emit/program-badge.d.marko src/marko/ && git diff --exit-code src/marko/`".
- `## Testing`, item 4: change ``limits the package to `src` and the README`` to ``limits the package to `src`, `marko.json` and the README``.

`CLAUDE.md`:
- Replace the "**Dual API, one component:**" bullet with:

  ```markdown
  - **Up to three renderers, one component:** an HTML string-builder (`src/html/`, e.g. `createButton`) for markup-only contexts, an Astro component (`src/astro/`, e.g. `astro/ui/Button`), and a Marko 6 tag (`src/marko/`, e.g. `<program-badge>`, discovered via `marko.json`). All read from the same design tokens and utils; a component's decisions live in one resolver under `src/utils/`. `ProgramBadge` has no HTML builder yet.
  ```
- In "The flow", step 2's verification block, replace `npm i --no-save @astrojs/check   # NOT a dependency — install transiently, never commit it` with `npm i --no-save @astrojs/check @marko/type-check   # NOT dependencies — install transiently, together, never commit`, and add `npx mtc -p tsconfig.marko.json        # the Marko type gate; must be 0 errors` after `npx astro check`.
- In "Conventions observed on this repo", replace the "Stories live in `stories/`" bullet with: `- **Stories live in \`stories/\` (Astro) and \`stories-marko/\` (Marko)**, never beside components — \`package.json#files\` ships all of \`src/\`, so co-located stories would land in consumers' \`node_modules\`.`
- Add a bullet to "Conventions observed on this repo": `- **Marko tags use concise syntax** and the Marko 6 Tags API only (no \`$\` scriptlets, \`style { }\`, \`class { }\`).`

Spec: change its status line to `Status: implemented on branch \`claude/program-badge\` · 2026-10-13`. If any spike fallback was taken, add one line per fallback under the spike table: "Taken: S<n> — <what FINDINGS.md recorded>."

- [ ] **Step 6: Run every gate one last time**

```bash
cd "$REPO" && npm test && npm run check:exports && npm run build-storybook
npm i --no-save @astrojs/check @marko/type-check
npx astro check; echo "astro check exit $?"; rm -rf .astro
npx mtc -p tsconfig.marko.json; echo "mtc exit $?"
npx changeset status --since=origin/main
cd "$SCRATCH/program-badge-e2e" && REPO="$REPO" node --test astro.e2e.mjs marko.e2e.mjs composed.e2e.mjs && SCRATCH="$SCRATCH" node --test consumer.e2e.mjs
cd "$REPO" && git status --short
```
Expected: every command passes, with `astro check exit 0` and `mtc exit 0`. `changeset status` lists `@luxoticars/ui` at `minor`. `git status` shows only the files this step is about to commit, plus the pre-existing untracked `.agents/`, `.claude/` and `skills-lock.json`. There must be no `.astro/`, no `storybook-static/` changes (it is gitignored) and no `.marko-emit/`.

- [ ] **Step 7: Commit**

```bash
git add .changeset/program-badge.md README.md CONTRIBUTING.md CLAUDE.md docs/superpowers/specs/2026-10-13-program-badge-design.md
git commit -m "Document ProgramBadge, the Marko tag and the Marko Storybook"
```
(End the message with the attribution trailer.)

Keep `$SCRATCH/FINDINGS.md` and the Step 6 output for the PR description. Pushing and raising the PR follow CLAUDE.md "The flow", steps 4–5, and are not part of this plan.
