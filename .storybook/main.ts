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
