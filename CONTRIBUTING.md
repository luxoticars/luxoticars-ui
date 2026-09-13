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

1. Add `src/astro/<Name>.astro`, or `src/astro/ui/<Name>.astro` for a
   design-system primitive.
2. Document it in the component itself. The props table and descriptions on its
   docs page are generated from the `Props` type and the JSDoc above each field,
   so a prop is documented by writing JSDoc next to it. Do not add a props table
   to `README.md` — it only duplicates the types and then drifts.
3. Add `stories/<path>/<Name>.stories.ts` with `component` set to the imported
   `.astro` file and `tags: ["autodocs"]`.
4. Export shared prop types from `src/types.d.ts`.
5. No `package.json` change is needed. The `exports` map uses a wildcard, so
   `@luxoticars/ui/astro/<Name>` resolves automatically.

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

## Publishing

There is nothing to publish. The package is marked `private` and is consumed by
Git URL, so merging to `main` is the release. Consumers pick up changes when
they re-resolve the dependency, which means a change here can reach production
sites without a version bump. Pin a tag in the consuming app if you need that
not to happen.
