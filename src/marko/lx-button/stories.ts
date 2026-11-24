import type { Meta, StoryObj } from "@storybook/marko";
import Button, { type Input } from "./index.marko";
import StoryButton, { type Input as StoryInput } from "./story-button.stories.marko";
import Gallery, { type Input as GalleryInput } from "./gallery.stories.marko";

/**
 * `<lx-button>` for Marko 6 apps, the twin of the Astro `Button`. It is
 * discovered through the package's marko.json, so it needs no import, and it
 * needs no Tailwind:
 *
 * ```marko
 * lx-button variant="outline" radius="full" aria-expanded=open aria-controls="faq-1"
 *   -- What does the inspection cover?
 *   @right-icon
 *     my-chevron
 * ```
 *
 * With `href` it is an `<a>`, without a `<button>`. `radius` sets the corner
 * radius per button; `aria-expanded`, `aria-haspopup` and `aria-controls` are
 * printed as the strings ARIA expects.
 *
 * Storybook args cannot pass a tag body, so each story renders
 * `story-button.stories.marko`, which turns `label` into the body.
 */
export default {
  title: "Components/lx-button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive", "success", "warning", "info"],
    },
    size: { control: "inline-radio", options: ["xs", "sm", "default", "lg", "xl"] },
    radius: { control: "select", options: ["field", "none", "sm", "md", "lg", "xl", "2xl", "full"] },
    pill: { control: "boolean" },
    iconOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    href: { control: "text" },
    "aria-expanded": { control: "inline-radio", options: [undefined, false, true] },
    "aria-haspopup": { control: "select", options: [undefined, true, "menu", "listbox", "tree", "grid", "dialog"] },
    "aria-controls": { control: "text" },
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
    content: { table: { disable: true } },
  },
} satisfies Meta<Input>;

type Story = StoryObj<StoryInput>;

const render = (args: StoryInput) => ({ component: StoryButton, input: args });

export const Default: Story = { render, args: { label: "Enquire now" } };

export const Outline: Story = { render, args: { variant: "outline", label: "Enquire now" } };

/** `radius` sets the corner radius for this button; `full` is a pill. */
export const Radius: Story = { render, args: { radius: "xl", label: "Enquire now" } };

/** A closed accordion trigger: `aria-expanded` prints `"false"`, `aria-controls` names its panel. */
export const AccordionTrigger: Story = {
  render,
  args: { variant: "outline", "aria-expanded": false, "aria-controls": "faq-answer-1", label: "What does the inspection cover?", chevron: true },
};

/** The same trigger while open: `aria-expanded="true"` also keeps the pressed look. */
export const AccordionTriggerOpen: Story = {
  render,
  args: {
    variant: "outline",
    "aria-expanded": true,
    "aria-controls": "faq-answer-1",
    label: "What does the inspection cover?",
    chevron: true,
    panel: "Bodywork, mechanicals and paperwork, each checked and written up on the listing.",
  },
};

/** A button that opens a menu. */
export const MenuTrigger: Story = {
  render,
  args: { variant: "outline", "aria-haspopup": "menu", "aria-expanded": false, "aria-controls": "actions-menu", label: "Actions", chevron: true },
};

/** A button that opens a modal. */
export const DialogTrigger: Story = {
  render,
  args: { "aria-haspopup": "dialog", "aria-controls": "filters-dialog", label: "Filters" },
};

/** Renders an `<a>`, not a `<button>`. */
export const AsLink: Story = { render, args: { href: "/inventory", variant: "outline", label: "Browse inventory" } };

export const DisabledLink: Story = { render, args: { href: "/inventory", variant: "outline", disabled: true, label: "Browse inventory" } };

/** Every variant, size and radius, and the ARIA states, side by side. */
export const AllVariants: StoryObj<GalleryInput> = {
  render: () => ({ component: Gallery, input: {} }),
};
