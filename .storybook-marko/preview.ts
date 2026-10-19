import type { Decorator, Preview } from "@storybook/marko";
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
  decorators: [withTheme],
} satisfies Preview;
