import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { compileFileSync } from "@marko/compiler";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { getViteConfig } from "astro/config";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { _content, _html, _scope_id, _scope_reason, attrTag } from "marko/html";
import { cases } from "../stories/listing-card-cases.ts";

/*
  node --test cannot import `.marko` or `.astro`. Marko is compiled with the
  tags-api HTML runtime (MARKO_DEBUG off, so the output is not the debug
  build). Astro is loaded through Vite the same way the container API expects
  a compiled component. Slot HTML is not a string `content`: Marko reads that
  as a tag name. `attrTag` + `_content` + `_html` is the runtime shape a
  compiled `@title` / `@media` body has.
*/
process.env.MARKO_DEBUG = "false";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith(".marko")) return nextLoad(url, context);
    const code = compileFileSync(fileURLToPath(url), { output: "html", sourceMaps: false }).code.replace(
      /import\s+["'][^"']+\.css["'];?\n/g,
      "",
    );
    return { format: "module", source: code, shortCircuit: true };
  },
});

const { default: ListingCardMarko } = await import("../src/marko/lx-listing-card/index.marko");

let slotId = 0;
const htmlBody = (html) =>
  attrTag({
    content: _content(`listing-card-slot-${slotId++}`, () => {
      _scope_reason();
      _scope_id();
      _html(html);
    }),
  });

function dump(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

function slotsToAstro(c) {
  const slots = { title: c.slots.title, price: c.slots.price };
  if (c.slots.media) slots.media = c.slots.media;
  if (c.slots.kicker) slots.kicker = c.slots.kicker;
  if (c.slots.meta) slots.meta = c.slots.meta;
  if (c.slots.location) slots.location = c.slots.location;
  if (c.slots.action) slots.action = c.slots.action;
  return slots;
}

/*
  Marko omits quotes on safe attribute values and does not use Astro's
  attribute order. Spreading `...attrs` also appends a hydration comment and
  runtime script. Canonical tags compare the element tree, not the serializer.
*/
function canonTag(tag) {
  const close = tag.match(/^<\/\s*([^\s>]+)\s*>$/);
  if (close) return `</${close[1].toLowerCase()}>`;
  const open = tag.match(/^<\s*([^\s/>]+)([\s\S]*?)>$/);
  if (!open) return tag;
  const attrs = [];
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(open[2]))) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs.push([key, key === "class" ? value.split(/\s+/).filter(Boolean).sort().join(" ") : value]);
  }
  attrs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return `<${open[1].toLowerCase()}${attrs.map(([key, value]) => ` ${key}="${value}"`).join("")}>`;
}

const normalize = (html) =>
  dump(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "")).replace(
    /<[^>]+>/g,
    canonTag,
  );

test("Astro and Marko listing cards match for every shared case", async () => {
  const factory = getViteConfig(
    { server: { middlewareMode: true }, appType: "custom" },
    { root: fileURLToPath(new URL("..", import.meta.url)) },
  );
  const server = await createServer(await factory({ mode: "development", command: "serve" }));
  try {
    const astroMod = await server.ssrLoadModule(
      fileURLToPath(new URL("../src/astro/ui/ListingCard.astro", import.meta.url)),
    );
    const container = await AstroContainer.create();
    for (const name of Object.keys(cases)) {
      const c = cases[name];
      const astroHtml = await container.renderToString(astroMod.default, {
        props: {
          href: c.href,
          headingLevel: c.headingLevel,
          headingId: c.headingId,
          linkLabel: c.linkLabel,
          class: c.class,
        },
        slots: slotsToAstro(c),
      });

      const markoResult = await ListingCardMarko.render({
        href: c.href,
        headingLevel: c.headingLevel,
        headingId: c.headingId,
        linkLabel: c.linkLabel,
        class: c.class,
        media: c.slots.media ? htmlBody(c.slots.media) : undefined,
        kicker: c.slots.kicker ? htmlBody(c.slots.kicker) : undefined,
        title: htmlBody(c.slots.title),
        price: htmlBody(c.slots.price),
        meta: c.slots.meta ? htmlBody(c.slots.meta) : undefined,
        location: c.slots.location ? htmlBody(c.slots.location) : undefined,
        action: c.slots.action ? htmlBody(c.slots.action) : undefined,
      });
      const markoHtml = typeof markoResult === "string" ? markoResult : markoResult.toString();

      assert.equal(normalize(astroHtml), normalize(markoHtml), name);
    }
  } finally {
    await server.close();
  }
});
