import type { Preview } from "@storybook/html-vite";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    // The footer is built for a dark page. Default the canvas to match so the
    // component is reviewed against the background it actually ships on.
    backgrounds: {
      options: {
        dark: { name: "Dark", value: "#0a0a0a" },
        light: { name: "Light", value: "#ffffff" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
  },
};

export default preview;
