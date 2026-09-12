import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import { createServer, type Plugin, type ViteDevServer } from "vite";
import path from "node:path";
import url from "node:url";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PREFIX = "virtual:astro-story/";

/**
 * Astro components have no browser runtime: `astro/container` renders them to a
 * string in Node, and their scoped CSS is emitted by Astro's Vite pipeline
 * rather than inlined into that string. Storybook's preview, meanwhile, is a
 * browser bundle. So the component cannot render inside a story.
 *
 * This plugin bridges the two. For each component it boots Astro's own Vite
 * pipeline in Node, renders every declared variant to HTML, pulls the matching
 * scoped CSS out of Astro's virtual style module, and hands both to the story
 * as a plain data module. What the maintainer sees is the real compiled markup
 * with the real scoped styles, not an approximation.
 *
 * A component's variants live next to its story, in `<Name>.variants.ts`.
 */
export interface Variant {
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
}

export function astroStories(): Plugin {
  let server: ViteDevServer | undefined;

  async function astroServer() {
    if (server) return server;
    const factory = getViteConfig(
      // Astro insists on a pages directory. Point it at a throwaway one so the
      // package's own `src/` stays free of Storybook scaffolding.
      { srcDir: path.join(HERE, "astro-root") },
    );
    const config =
      typeof factory === "function"
        ? await factory({ command: "serve", mode: "development" })
        : await factory;
    server = await createServer({
      ...config,
      configFile: false,
      server: { middlewareMode: true, hmr: false },
      optimizeDeps: { noDiscovery: true },
      logLevel: "silent",
    });
    return server;
  }

  /** Astro emits one virtual style module per `<style>` block in the component. */
  async function collectCss(vite: ViteDevServer, file: string) {
    const blocks: string[] = [];
    for (let index = 0; index < 20; index++) {
      const id = `${file}?astro&type=style&index=${index}&lang.css&direct`;
      let result;
      try {
        result = await vite.transformRequest(id, { ssr: false });
      } catch {
        break;
      }
      if (!result?.code) break;
      blocks.push(result.code);
    }
    return blocks.join("\n");
  }

  return {
    name: "luxoticars:astro-stories",

    resolveId(id) {
      if (id.startsWith(PREFIX)) return "\0" + id;
      return null;
    },

    async load(id) {
      if (!id.startsWith("\0" + PREFIX)) return null;
      const name = id.slice(("\0" + PREFIX).length);
      const componentFile = path.join(ROOT, "src", "astro", `${name}.astro`);
      const variantsFile = path.join(ROOT, "stories", `${name}.variants.ts`);

      const vite = await astroServer();
      const mod = await vite.ssrLoadModule(componentFile);
      const component = mod.default;
      if (!component) throw new Error(`${name}.astro has no default export`);

      const variants: Record<string, Variant> =
        (await vite.ssrLoadModule(variantsFile)).default ?? {};

      const container = await AstroContainer.create();
      const rendered: Record<string, string> = {};
      for (const [key, variant] of Object.entries(variants)) {
        rendered[key] = await container.renderToString(component, {
          props: variant.props ?? {},
          slots: variant.slots ?? {},
        });
      }

      const css = await collectCss(vite, componentFile);

      // Watch the sources so editing either one refreshes the story in dev.
      this.addWatchFile(componentFile);
      this.addWatchFile(variantsFile);

      return [
        `export const css = ${JSON.stringify(css)};`,
        `export const variants = ${JSON.stringify(rendered)};`,
        `export const variantNames = ${JSON.stringify(Object.keys(rendered))};`,
      ].join("\n");
    },

    async closeBundle() {
      await server?.close();
      server = undefined;
    },
  };
}
