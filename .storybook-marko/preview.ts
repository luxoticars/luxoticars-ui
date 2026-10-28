import type { Decorator, Preview } from "@storybook/marko";
import { DOCS_RENDERED } from "storybook/internal/core-events";
import { SNIPPET_RENDERED } from "storybook/internal/docs-tools";
import { addons } from "storybook/preview-api";
import { markoSnippet, tagNameFromFile } from "./marko-source";
import "./preview.css";

/*
  Applies the toolbar theme to the story's canvas element and returns the
  story untouched, the mechanism @storybook/addon-themes uses.

  A decorator that wraps the story in a theme template, as the Astro preview's
  ThemeFrame does, is not an option: @storybook/marko 10.1 throws "Decorators
  are not yet supported in Tags API templates" for any decorator that returns a
  Marko 6 component. Touching the DOM is safe here, unlike in the Astro
  preview, because this renderer only runs in the browser; there is no static
  prerender in Node.
*/
const withTheme: Decorator = (story, context) => {
  context.canvasElement.dataset.theme = context.globals.theme;
  context.canvasElement.classList.add("lux-canvas");
  // A page-wide part (a header) is drawn edge to edge, as on a real page.
  context.canvasElement.classList.toggle("lux-canvas--bleed", context.parameters.bleed === true);
  return story();
};

/*
  Feeds the docs "Show code" panel. @storybook/marko produces no snippet itself,
  so each story reports one on the channel, keyed by its current args, as the
  HTML renderer's decorator does. Stories render before the docs page listens,
  so the snippets are kept and sent again once the docs page has rendered.
*/
type Snippet = { id: string; source: string; format: false };
const snippets = new Map<string, Snippet>();

// Registered at load, not on the first story: the docs page can finish rendering before
// the first story has run its decorator.
const channel = addons.getChannel();
channel.on(DOCS_RENDERED, () => snippets.forEach((kept) => channel.emit(SNIPPET_RENDERED, kept)));

const withSource: Decorator = (story, context) => {
  const tag = tagNameFromFile(context.parameters.fileName);
  if (tag) {
    // No `args` in the payload: the docs page would look the snippet up by a hash of its
    // own args, which include the actions addon's handlers, and miss. Without them the
    // panel falls back to the story's latest snippet.
    const snippet = { id: context.id, source: markoSnippet(tag, context.args), format: false };
    snippets.set(context.id, snippet);
    channel.emit(SNIPPET_RENDERED, snippet);
  }
  return story();
};

export default {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Luxoticars theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  decorators: [withTheme, withSource],
} satisfies Preview;
