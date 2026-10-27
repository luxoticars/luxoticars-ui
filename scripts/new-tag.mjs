// Scaffolds a Marko tag in the lx- layout:
//
//   npm run new:tag lx-badge                     src/marko/lx-badge/
//   npm run new:tag lx-site-footer --adaptive    shared base + desktop/tablet/mobile entries
//   npm run new:tag site-header/lx-site-header --adaptive    inside a grouping folder
//
// A grouping folder (one level deep) only groups: it never gets an index.marko.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const [target, ...flags] = process.argv.slice(2);
const adaptive = flags.includes("--adaptive");
const name = target && basename(target);

if (!name || !/^lx-[a-z][a-z0-9-]*$/.test(name) || target.split("/").length > 2) {
  console.error("Usage: npm run new:tag [group/]lx-name [--adaptive]\nThe tag name starts with lx- and is kebab-case; a group folder is one level deep.");
  process.exit(1);
}
const dir = join(root, "src/marko", target);
if (existsSync(dir)) {
  console.error(`${target} already exists`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const write = (file, text) => writeFileSync(join(dir, file), text);
const stamp = `/*\n  Forked from <src/styles/…css, or none> [source-hash: none]\n  Block \`${name}\`, the tag's own name. Needs styles/tokens.css: --lux-* only.\n*/\n`;
const stories = (title) => `import type { Meta, StoryObj } from "@storybook/marko";
import Tag, { type Input } from "./index.marko";

export default { title: "Components/${title}", component: Tag, tags: ["autodocs"] } satisfies Meta<Input>;

export const Default: StoryObj<Input> = { args: {} };
`;

if (!adaptive) {
  write("index.marko", `export interface Input {\n}\n\ndiv.${name}\n`);
  write("style.css", `${stamp}\n.${name} {\n}\n`);
  write("stories.ts", stories(name));
} else {
  write("helper.ts", `export interface Model {\n}\n\nexport interface ModelInput {\n}\n\n/** Pure and synchronous: no fetching, DOM or mutation. */\nexport function buildModel(_input: ModelInput): Model {\n  return {};\n}\n`);
  write("base.marko", `import type { Model } from "./helper"\nimport "./base.css"\n\nexport interface Input {\n  model: Model\n  variant: "desktop" | "tablet" | "mobile"\n}\n\ndiv class=["${name}", \`${name}--\${input.variant}\`]\n`);
  write("base.css", `${stamp}\n.${name} {\n}\n`);
  for (const v of ["desktop", "tablet", "mobile"]) {
    write(`${v}.entry.marko`, `import Base from "./base.marko"\nimport type { Model } from "./helper"\nimport "./${v}.css"\n\nexport interface Input {\n  model: Model\n}\n\nBase model=input.model variant="${v}"\n`);
    write(`${v}.css`, `/* Forked from none [source-hash: none] */\n.${name}--${v} {\n}\n`);
  }
  // Entries are imported by path; only index.marko is discovered as a tag.
  write("index.marko", `import { buildModel } from "./helper"
import type { ModelInput } from "./helper"

export interface Input extends ModelInput {
  /** The entry chosen for this request, loaded by the app: import(".../${name}/desktop.entry.marko"). */
  entry: Marko.Template
}

const/model=buildModel(input)

\${input.entry} model=model
`);
  write("stories.ts", stories(name));
}
console.log(`Created src/marko/${target}/. Next: fill it in, then \`npm test\`.`);
