import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

interface Entry {
  id: string;
  type: string;
  title: string;
  name: string;
}

// The Astro Storybook is the root build; the Marko one is nested under /marko/.
const storybooks = [
  { renderer: "astro", base: "", dir: "storybook-static" },
  { renderer: "marko", base: "/marko", dir: "storybook-static/marko" },
];
const themes = ["dark", "light"];

for (const { renderer, base, dir } of storybooks) {
  const index = JSON.parse(readFileSync(join(import.meta.dirname, "..", dir, "index.json"), "utf8"));
  const stories = (Object.values(index.entries) as Entry[]).filter((entry) => entry.type === "story");

  for (const story of stories) {
    for (const theme of themes) {
      test(`${renderer} ${story.title} ${story.name} (${theme})`, async ({ page }) => {
        const params = new URLSearchParams({ id: story.id, viewMode: "story", globals: `theme:${theme}` });
        await page.goto(`${base}/iframe.html?${params}`);
        await page.waitForLoadState("networkidle");
        await page.waitForSelector("#storybook-root > *, #storybook-root:not(:empty)");
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot([renderer, `${story.id}-${theme}.png`], {
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  }
}
