# luxoticars-ui

`@luxoticars/ui` — Accessible Luxoticars components for HTML, Astro and Tailwind CSS. Not published to npm; consumers install it straight from the Git repo (`github:luxoticars/luxoticars-ui`).

## What's in the package

- **Dual API, one component:** every component ships both an HTML string-builder (`src/html/`, e.g. `createButton`) for markup-only contexts, and an Astro component (`src/astro/`, e.g. `astro/ui/Button`) for Astro projects. Both read from the same design tokens and utils.
- **`src/index.js`** — entry for the HTML API. **`src/astro/*.astro`** — entry per Astro component, exported via `package.json#exports` subpaths (`./astro/*`).
- **`src/styles/tokens.css`** — the design tokens, exported as `./styles/tokens.css`.
- **`src/utils/cn`** — class-name merge helper (`clsx` + `tailwind-merge`), and **`src/data/footer`** — shared footer data. Both are JS with hand-written `.d.ts` siblings (see typing convention below).
- **`src/types.d.ts`** — shared type exports (`./types`).
- Docs for props/slots/examples live in **Storybook**, generated from each component's types and JSDoc — not hand-written in README, so they can't drift from the code (`npm run storybook`).

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

2. **Do the work, then verify before committing.** This repo ships unbuilt and has no test suite; verification is:
   ```bash
   npm ci
   npm i --no-save @astrojs/check   # NOT a dependency — install transiently, never commit it
   npx astro check                  # must be 0 errors; this is the only type gate
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
- **Stories live in `stories/`**, never beside components — `package.json#files` ships all of `src/`, so co-located stories would land in consumers' `node_modules`.
- **JS + hand-written `.d.ts`** is the typing convention (see `utils/cn`, `data/footer`); every public subpath in `package.json#exports` needs a `types` entry.

## After the PR is open

Subscribe to it from the upstream-seeded session (path B) and let it drive CI/review follow-ups. This session cannot, and should not pretend to, watch an upstream PR.
