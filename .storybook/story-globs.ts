/*
  Which Storybook picks up which story file under stories/. Files never move;
  these globs alone decide. The host (.storybook/main.ts) and the Astro
  Storybook (.storybook-astro/main.ts) both import from here, and
  tests/storybook-globs.test.js checks every story matches exactly one list.
  Paths are relative to a config directory, so "../stories" works from both.
*/
export const HOST_STORY_GLOBS = [
  "../stories/create*.stories.ts", // HTML/createDialog, createFooter, createListingCard, createLogo
  "../stories/Button.stories.ts", // HTML/createButton
  "../stories/skin/**/*.stories.ts", // Skin/*
];

export const ASTRO_STORY_GLOBS = [
  "../stories/Footer.stories.ts",
  "../stories/Logo.stories.ts",
  "../stories/SectionHead.stories.ts",
  "../stories/SiteHeader.stories.ts",
  "../stories/ui/*.stories.ts",
];
