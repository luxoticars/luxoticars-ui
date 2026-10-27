# luxoticars-ui

`@luxoticars/ui` — Accessible Luxoticars components for HTML, Astro, Marko and Tailwind CSS. Not published to npm; consumers install it straight from the Git repo (`github:luxoticars/luxoticars-ui`).

## What's in the package

- **Up to three renderers, one component:** an HTML string-builder (`src/html/`, e.g. `createButton`) for markup-only contexts, an Astro component (`src/astro/`, e.g. `astro/ui/Button`), and a Marko 6 tag (`src/marko/`, e.g. `<program-badge>`, discovered via `marko.json`). All read from the same design tokens and utils; a component's decisions live in one resolver under `src/utils/`. `ProgramBadge` has no HTML builder yet.
- **`src/index.js`** — entry for the HTML API. **`src/astro/*.astro`** — entry per Astro component, exported via `package.json#exports` subpaths (`./astro/*`).
- **`src/styles/tokens.css`** — the design tokens, exported as `./styles/tokens.css`.
- **`src/utils/cn`** — class-name merge helper (`clsx` + `tailwind-merge`), and **`src/data/footer`** — shared footer data. Both are JS with hand-written `.d.ts` siblings (see typing convention below).
- **`src/types.d.ts`** — shared type exports (`./types`).
- Docs for props/slots/examples live in **Storybook**, generated from each component's types and JSDoc (Astro; Marko stories write their `argTypes` by hand, since `@storybook/marko` has no docgen) — not hand-written in README, so they can't drift from the code (`npm run storybook`).

## Repo topology

- **Session repo / fork:** `muhaimincs/luxoticars-ui` — this is what the session clones, `origin`, default branch `main`.
- **Upstream (where PRs go):** `luxoticars/luxoticars-ui`, base branch `main`.
- Work is committed and pushed to the **fork**; the PR is raised against **upstream**. Never open a fork→fork PR (`muhaimincs:branch` → `muhaimincs:main`) — that is a wrong turn and has to be closed again.

## The flow

1. **Branch off the fork's main.**
   ```bash
   git fetch origin main
   git checkout -B <branch> origin/main    # e.g. claude/<topic>-<suffix>
   ```

2. **Do the work, then verify before committing.** This repo ships unbuilt; its committed tests are the `node:test` unit tests (`npm test`). Verification is:
   ```bash
   npm ci
   npm test                         # the node:test unit tests; must pass
   npm i --no-save @astrojs/check @marko/type-check @emnapi/runtime@1.11.3   # NOT dependencies — install transiently, together, never commit; @emnapi/runtime is pruned otherwise and astro check silently checks nothing
   npx astro check                  # must be 0 errors; the Astro type gate
   npx mtc -p tsconfig.marko.json        # the Marko type gate; must be 0 errors
   npm run build-storybook          # must succeed
   rm -rf .astro                    # astro check generates this and it is NOT gitignored
   ```
   For anything visual/DOM-level, render the built Storybook and assert on the real DOM rather than trusting the markup string — Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, drive it with `playwright-core` installed in the scratchpad. Story ids come from `storybook-static/index.json`; prerendered Astro markup from `storybook-static/astro-prerendered-stories.json` (diff it before/after to prove a refactor changed nothing it shouldn't).

3. **Commit** with the attribution lines the session's system reminder gives you (Co-Authored-By + Claude-Session). Never put a model identifier anywhere else in the commit.

4. **Push to the fork.**
   ```bash
   git push -u origin <branch>
   ```

5. **Raise the PR against upstream.** See the constraint below — this is the part that needs care.

## The constraint that shapes everything

A session seeded with `muhaimincs/luxoticars-ui` **cannot touch `luxoticars/luxoticars-ui` at all**:

- `add_repo` refuses it — cross-owner adds are not supported once the session holds a repo from another owner.
- Every GitHub MCP tool (`create_pull_request`, `pull_request_read`, …) and `subscribe_pr_activity` returns `Access denied: repository "luxoticars/luxoticars-ui" is not configured for this session`.

So the session that pushes the branch **cannot open or watch the upstream PR**. Two ways through, in order of preference:

### A. Hand the user a ready-to-submit link (fastest, always works)

```
https://github.com/luxoticars/luxoticars-ui/compare/main...muhaimincs:<branch>
```

Give that URL plus the PR title and body as copy-pasteable text. The user submits it and reports back the PR number.

### B. Spawn a session seeded on upstream

`create_session` with `source_url: https://github.com/luxoticars/luxoticars-ui`, then have it do the GitHub work.

**Keep the spawn prompt minimal and plain.** Long, directive-heavy prompts — "drive it to green", "never force-push", lists of rules, a `head` that names a different owner — trip the child's prompt-injection heuristic. It then blocks with `status_category: need_input` waiting for a confirmation **you cannot deliver**: cloud-seeded sessions never appear in `ListAgents`, so `SendMessage` always fails with "not reachable", whether they are `connected` or `disconnected`. A blocked child is dead weight — archive it and re-spawn with a shorter prompt.

What works:

> Please call subscribe_pr_activity for this repo's pull request #N (<url>), then tell me its current CI and review status.

Read its progress with `get_session` → `post_turn_summary`; that is the only channel back from it.

## Conventions observed on this repo

- **PR description language:** Bahasa Melayu, KL register, with English technical jargon in brackets — e.g. "cerita (story)", "jenis prop (prop types)", "atribut berganda (duplicate attributes)". Confirm if unsure; this was an explicit request, not a repo rule.
- **PR body attribution:** the 🤖 Generated with Claude Code lines + session URL, per the session's system reminder.
- **No PR template** exists in the repo — write the body as a normal structured description.
- **CI reality:** the fork has **no working Actions** — `.github/workflows/storybook.yml` has never triggered once in the fork's history, so do not wait on fork CI or treat its absence as a failure. Upstream runs a Copilot review (`copilot-pull-request-reviewer`) that posts an approval/finding summary.
- **Stories:** Astro stories live in `stories/`, never beside components. Marko tags in the `lx-` layout keep `stories.ts` beside `index.marko`; `package.json#files` has `!**/{,*.}stories.*`, so they are not shipped. Tags not yet migrated still use `stories-marko/`.
- **Marko tags use concise syntax** and the Marko 6 Tags API only (no `$` scriptlets, `style { }`, `class { }`).
- **JS + hand-written `.d.ts`** is the typing convention (see `utils/cn`, `data/footer`); every public subpath in `package.json#exports` needs a `types` entry.

## Marko tag layout (`lx-`)

Marko tags are being moved one at a time into this layout, which follows the Marko docs ([custom tag discovery](https://markojs.com/docs/reference/custom-tag)) and the Luxoticars adaptive pattern. Unmigrated tags are still flat files in `src/marko/`.

- **Folder per tag, prefixed `lx-`:** `src/marko/lx-logo/index.marko` is `<lx-logo>`. Scaffold with `npm run new:tag lx-name` (`--adaptive` for the large-component layout).
- **Own CSS, not shared with Astro:** `style.css` beside `index.marko` is found by Marko, with no import. It is forked from the shared `src/styles/*.css` and starts with a stamp, `Forked from <source> [source-hash: …]`. `npm test` fails when the source changes; port what applies, then `npm run styles:stamp -- lx-name`.
- **BEM block = the tag name** (`.lx-logo`, `.lx-logo__wordmark`). Read `--lux-*` tokens only: no colour literals, no daisyUI/Tailwind names, no fallbacks. These tags need `styles/tokens.css`.
- **Logic stays shared** (`src/utils/*.js` resolvers); only the styles fork. A tag that transforms data has a `helper.ts` with a pure `buildModel`.
- **Grouping folders** (one level, e.g. `src/marko/site-header/lx-site-header-desktop/`) only group: never give one an `index.marko`, which would turn it into a tag. `npm test` checks this.
- **Large adaptive components** (header, footer): `index.marko` takes the chosen `entry` and builds the model once; `base.marko` + `base.css` hold the common part; `desktop|tablet|mobile.entry.marko` each import only their own CSS. The consuming app picks the entry per request; this package does not classify devices.
- **Exports:** `./marko/lx-*` maps to `src/marko/lx-*/index.marko`. Keep the `./src/marko/*.marko` export too: Marko's compiler imports installed tags through it.

## After the PR is open

Subscribe to it from the upstream-seeded session (path B) and let it drive CI/review follow-ups. This session cannot, and should not pretend to, watch an upstream PR.
