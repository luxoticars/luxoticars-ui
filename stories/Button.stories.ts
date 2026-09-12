import { createButton } from "../src/html/button";

/**
 * `createButton` is a plain string builder with no Astro involved, so stories
 * can drive it directly from args.
 */
export default {
  title: "HTML/createButton",
  render: (args: Parameters<typeof createButton>[0]) => {
    const host = document.createElement("div");
    host.style.padding = "2rem";
    host.innerHTML = createButton(args);
    return host;
  },
  argTypes: {
    label: { control: "text" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    ariaLabel: { control: "text" },
    className: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: { label: "Continue", type: "button", disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          "Returns a button element as an HTML string. Note the markup carries " +
          "Tailwind utility classes, so it is only styled in an app that loads Tailwind.",
      },
    },
  },
};

export const Default = {};
export const Disabled = { args: { disabled: true } };
export const Submit = { args: { type: "submit", label: "Save changes" } };
export const WithAriaLabel = {
  args: { label: "×", ariaLabel: "Close dialog" },
};
