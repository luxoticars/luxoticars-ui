import type { Preview } from "@storybook/html-vite";
import "./preview.css";

/**
 * Tokens resolve off `data-theme` on <html>, so the theme toolbar has to set
 * that attribute rather than only recolouring the Storybook canvas — otherwise
 * the canvas and the component disagree about which theme is active.
 */
const preview: Preview = {
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
  decorators: [
    (story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      const host = document.createElement("div");
      host.className = "bg-base-100 text-base-content";
      host.append(story() as Node);
      return host;
    },
  ],
};

export default preview;
