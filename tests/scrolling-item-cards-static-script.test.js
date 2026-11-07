import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

/*
  Vitest story tests render through the Storybook dev server, which can answer
  `Component.astro?astro&type=script`. The published static build cannot: 1.12
  leaves that src as an absolute path on the build machine, the module 404s,
  and prev/next stay hidden. This builds the Astro Storybook and opens the
  static iframe the way the docs site does. It must not call
  initScrollingItemCards itself.
*/

test(
  "static Astro Storybook reveals the next control when ScrollingItemCards overflows",
  { timeout: 300_000 },
  async () => {
    const outDir = await mkdtemp(join(tmpdir(), "sic-astro-storybook-"));
    let server;
    let browser;
    try {
      await buildAstroStorybook(outDir);
      const html = await prerenderedHtml(outDir, "components-scrollingitemcards--similar-cars");
      const scriptSrcs = scriptSources(html);
      const served = await serveDir(outDir);
      server = served.server;
      browser = await chromium.launch({ headless: true });

      const similar = await readStory(browser, served.port, "components-scrollingitemcards--similar-cars");
      assert.ok(
        similar.overflow > 1,
        `Similar cars must overflow so a hidden control is the bug, not a wide track (client=${similar.clientWidth} scroll=${similar.scrollWidth})`,
      );
      assert.equal(
        similar.nextHidden,
        false,
        `next should be shown when the scroller overflows (hidden=${similar.nextHidden}, scripts=${scriptSrcs.join(" | ") || "none"}, responses=${JSON.stringify(similar.scriptResponses)})`,
      );
      assert.ok(
        scriptSrcs.every((src) => src.startsWith("./_astro/") && src.endsWith(".js")),
        `component script must be a built chunk, not a source path (${scriptSrcs.join(" | ") || "none"})`,
      );
      for (const src of scriptSrcs) {
        const path = src.replace(/^\.\//, "/");
        const hit = similar.scriptResponses.find((response) => response.url.includes(path));
        assert.equal(hit?.status, 200, `built script did not load (${src}; ${JSON.stringify(similar.scriptResponses)})`);
      }

      const idle = await readStory(browser, served.port, "components-scrollingitemcards--no-overflow");
      assert.equal(idle.prevHidden, true, "prev should stay hidden when there is no overflow");
      assert.equal(idle.nextHidden, true, "next should stay hidden when there is no overflow");
      assert.equal(idle.tabindex, "-1", "the component script should still install when nothing overflows");
    } finally {
      await browser?.close();
      if (server) await new Promise((resolveClose) => server.close(resolveClose));
      await rm(outDir, { recursive: true, force: true });
    }
  },
);

function scriptSources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map((match) => match[1]);
}

async function prerenderedHtml(outDir, storyId) {
  const payload = JSON.parse(await readFile(join(outDir, "astro-prerendered-stories.json"), "utf8"));
  const html = payload[storyId];
  assert.equal(typeof html, "string", `missing prerendered HTML for ${storyId}`);
  return html;
}

async function readStory(browser, port, storyId) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const scriptResponses = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/_astro/") || url.includes("type=script") || url.includes("ScrollingItemCards.astro")) {
      scriptResponses.push({ status: response.status(), url });
    }
  });
  try {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${storyId}&viewMode=story`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const root = document.querySelector(".scrolling-item-cards");
      const track = root?.querySelector(".scrolling-item-cards__track");
      const next = root?.querySelector(".scrolling-item-cards__control--next");
      const prev = root?.querySelector(".scrolling-item-cards__control--prev");
      return {
        clientWidth: track?.clientWidth ?? null,
        scrollWidth: track?.scrollWidth ?? null,
        overflow: track ? track.scrollWidth - track.clientWidth : 0,
        nextHidden: next ? next.hasAttribute("hidden") : null,
        prevHidden: prev ? prev.hasAttribute("hidden") : null,
        tabindex: root?.getAttribute("tabindex") ?? null,
      };
    });
    return { ...state, scriptResponses };
  } finally {
    await page.close();
  }
}

function serveDir(rootDir) {
  const root = resolve(rootDir);
  const types = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = normalize(join(root, pathname));
      if (file !== root && !file.startsWith(`${root}/`)) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(file);
      response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolveListen) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveListen({ server, port: typeof address === "object" && address ? address.port : 0 });
    });
  });
}

function buildAstroStorybook(outDir) {
  return new Promise((resolveBuild, reject) => {
    const child = spawn(
      process.execPath,
      [join(repoRoot, "node_modules/storybook/dist/bin/dispatcher.js"), "build", "-c", ".storybook-astro", "-o", outDir],
      {
        cwd: repoRoot,
        env: { ...process.env, CI: "1", STORYBOOK_DISABLE_TELEMETRY: "1" },
      },
    );
    let log = "";
    const capture = (chunk) => {
      log = (log + chunk.toString()).slice(-12_000);
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolveBuild();
      else reject(new Error(`storybook build exited ${code}\n${log}`));
    });
  });
}
