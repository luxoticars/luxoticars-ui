# Contributing

This package holds the UI shared by `luxoticars-homepage` and `luxoticars-vi`.
Both install it straight from this Git repository, so a change here reaches both
sites the moment they update the dependency. Review accordingly.

## Requirements

- Node 22 or newer, matching what both consuming apps run on.
- npm. The repository has a committed `package-lock.json` and CI uses `npm ci`.

## Fork first

Push access to this repository is not needed to work on it, and you get a better
setup without it: your own fork can host its own Storybook preview.

1. Fork `luxoticars/luxoticars-ui` on GitHub.
2. Clone your fork and add the upstream remote:

   ```bash
   git clone git@github.com:<your-user>/luxoticars-ui.git
   cd luxoticars-ui
   git remote add upstream git@github.com:luxoticars/luxoticars-ui.git
   npm install
   ```

3. Enable Pages on your fork so you get a shareable preview URL. In your fork:
   **Settings → Pages → Build and deployment → Source: GitHub Actions**. Pushing
   to your fork's `main` then publishes to
   `https://<your-user>.github.io/luxoticars-ui/`.

   This is the reason to fork rather than branch. GitHub serves one Pages site
   per repository, so branches cannot each have their own preview. A fork gets
   its own site and leaves the upstream one alone.

4. Work on a branch, push to your fork, open a pull request against
   `luxoticars/luxoticars-ui`.

Keep your fork current with `git fetch upstream && git rebase upstream/main`.

## Running Storybook

Storybook is how components are reviewed. Start it with:

```bash
npm run storybook        # http://localhost:6006
```

```bash
npm run build-storybook  # static build into storybook-static/
```

### How Astro stories render

Astro components have no browser runtime, and their scoped CSS is emitted by
Astro's build rather than inlined into the rendered markup. A `.astro` file
therefore cannot render inside a story on its own.

[`@storybook-astro/framework`](https://github.com/storybook-astro/storybook-astro)
bridges that with Astro's Container API. In dev it renders through middleware
over HMR, so args and the Controls panel drive a real Astro render. The static
build pre-renders every story ahead of time, so Controls are inert on the
published site.

## Adding to a component's stories

Export a story with plain args. Slot content goes under the reserved `slots`
key; everything else is a prop.

```ts
// stories/Footer.stories.ts
export const Minimal = {
  args: {
    socials: [],
    tagline: "",
    slots: { logo: '<a href="/">ACME</a>' },
  },
};
```

## Adding a component

Components ship a dual API: an Astro component and an HTML string builder
(`src/html/<name>.js` with a hand-written `.d.ts` sibling, exported from
`src/html/index.js`). Both read the same defaults from `src/data/`, and where a
component has its own CSS, both are styled by the same file under `src/styles/`.

1. Add `src/astro/<Name>.astro`, or `src/astro/ui/<Name>.astro` for a
   design-system primitive.
2. Document it in the component itself. The props table and descriptions on its
   docs page are generated from the `Props` type and the JSDoc above each field,
   so a prop is documented by writing JSDoc next to it. Do not add a props table
   to `README.md` — it only duplicates the types and then drifts.
3. Add `stories/<path>/<Name>.stories.ts` with `component` set to the imported
   `.astro` file and `tags: ["autodocs"]`.
4. Export shared prop types from `src/types.d.ts`.
5. No `package.json` change is needed for the component itself. The `exports` map
   uses a wildcard, so `@luxoticars/ui/astro/<Name>` resolves automatically — but
   a new stylesheet under `src/styles/` does need its own `exports` entry.

Docgen needs `typescript` installed and a `tsconfig.json` at the repo root. If
either goes missing the Storybook build still succeeds and every props table is
silently empty.

`.npmrc` sets `legacy-peer-deps=true`. `@storybook-astro/framework` declares a
`vitest@^4.1.0` peer, and Vite 8 pulls `vitest@5` in transitively through its
devtools, so npm's strict peer resolution refuses to install. Nothing here uses
vitest; drop the flag once that peer range widens.

### Style components so they work in both apps

This is the constraint that catches people out. `luxoticars-vi` loads Tailwind;
`luxoticars-homepage` does not. A Tailwind utility class written into shipped
markup is therefore dead text in the homepage.

So components carry their own scoped `<style>` and read design tokens as CSS
custom properties with literal fallbacks:

```css
.thing {
  --_accent: var(--color-marque-accent, oklch(0.74 0.16 232.661));
}
```

A component with an HTML twin puts those rules in `src/styles/<name>.css`
instead, and the `.astro` file pulls them in:

```astro
<style>
  @import "../styles/<name>.css";
</style>
```

Astro scopes an imported stylesheet exactly as it scopes inline rules, so this
costs the component nothing and the string builder gets the same rules rather
than a second copy of them. Export the file from `package.json#exports` so a
consumer of the HTML API can import it.

`@storybook-astro/framework` lifts the text of a `<style>` block into the preview
without resolving anything, so the story for such a component has to import the
stylesheet itself — see the comment at the top of `stories/Footer.stories.ts`.
The lifted `@import` then 404s in the preview iframe; it is inert, and the story
is styled by its own import.

Reset what you rely on, too. The homepage ships no CSS reset at all, so list
markers, link underlines and heading margins must be handled by the component
rather than assumed from the host.

One gotcha worth knowing: Astro appends its scope attribute to every compound
selector, so a descendant reset such as `.thing :where(ul)` compiles to a
three-part selector that outranks your own single-class rules and silently wins.
Put reset properties on the element's own class instead.

## Testing

There is no automated test suite yet. Verification today is the following, and a
pull request should say which of these were run.

**1. Storybook builds.** This is the closest thing to a smoke test: it compiles
every component and every declared variant through Astro.

```bash
npm run build-storybook
```

**2. Components look right.** Open the stories and check each variant, including
the mobile viewport. This is the whole point of Storybook being here.

**3. The package still consumes cleanly.** Nothing in this repo catches a broken
`exports` map or a bad import path, so test against a real Astro app:

```bash
# in a scratch Astro project, or a checkout of luxoticars-vi
npm install "git+https://github.com/<your-user>/luxoticars-ui.git#<your-branch>"
npx astro build
npx astro check        # needs TypeScript 6.x; astro check cannot run on TS 7 yet
```

**4. The published payload is what you expect.** `files` limits the package to
`src` and the README. Confirm no dev tooling leaked in:

```bash
npm pack --dry-run
```

**5. Accessibility did not regress.** These components are the accessible layer
for both sites. Check keyboard focus is visible, that any link opening a new tab
carries a visually hidden note, and that headings and landmarks still make sense.

## Releasing

Versions follow [semver](https://semver.org) and are managed with
[Changesets](https://github.com/changesets/changesets). Nothing is published to
npm: a release is a version bump on `main`, a `vX.Y.Z` git tag and a GitHub
Release. Consumers pin the tag (`github:luxoticars/luxoticars-ui#vX.Y.Z`).

### In every pull request

Run `npm run changeset`, pick the bump and write a one-line note for consumers.
Commit the generated `.changeset/*.md`. CI fails a PR without one; for changes
that do not reach consumers (docs, stories, CI) use `npx changeset --empty`.

| Bump | When | Examples |
| --- | --- | --- |
| **major** | A consumer must change their code or markup | Removing or renaming a component, prop, slot or `exports` subpath; changing a prop's meaning; renaming a BEM class or a design token that sites may style against |
| **minor** | New, backwards-compatible capability | New component, prop, variant, export or token |
| **patch** | Fix with no API change | Visual or accessibility fix, markup tweak that keeps class names, type correction |

While the version is `0.x`, breaking changes may ship as a **minor**; from
`1.0.0` they must be a **major**. When unsure, pick the larger bump: a site
that pins `^1.2.0` receives every minor and patch automatically.

### Cutting a release

Maintainers only; the steps are automatic apart from the merge.

1. Merging PRs with changesets to `main` makes the **Release** workflow open or
   update a **Version Packages** PR. It bumps `package.json`, updates
   `package-lock.json` and writes `CHANGELOG.md`.
2. Review the version and changelog, then merge that PR.
3. The workflow builds Storybook, runs `npm run release` (which checks that
   every `exports` entry resolves and has types, then creates the `vX.Y.Z` tag),
   pushes the tag and creates the GitHub Release.

One-time repository setup: **Settings → Actions → General → Workflow
permissions → Allow GitHub Actions to create and approve pull requests**.

To release by hand: `npm run version`, commit, then `npm run release` and
`git push --follow-tags`.
