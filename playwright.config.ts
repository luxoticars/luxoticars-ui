import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.VRT_PORT ?? 6100);

/*
  Visual regression tests: every story in both Storybooks, in both themes, at a
  desktop and a mobile size. Baselines are committed under vrt/__screenshots__/
  and are only valid when taken in the Playwright Linux image (scripts/vrt.sh),
  so a Mac's own font rendering never produces a diff.
*/
export default defineConfig({
  testDir: "./vrt",
  snapshotDir: "./vrt/__screenshots__",
  snapshotPathTemplate: "{snapshotDir}/{arg}-{projectName}-{platform}{ext}",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: `http://localhost:${PORT}`, reducedMotion: "reduce" },
  projects: [
    { name: "dweb", use: { ...devices["Desktop Chrome"] } },
    { name: "mweb", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/vrt-serve.mjs",
    url: `http://localhost:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
});
