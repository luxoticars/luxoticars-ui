import Button from "../../src/astro/ui/Button.astro";

const ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

export default {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    slots: { default: "Enquire now" },
  },
  argTypes: {
    slots: { table: { disable: true } },
  },
};

export const Default = {};

export const Variants = {
  args: { variant: "outline" },
};

export const Destructive = {
  args: { variant: "destructive", slots: { default: "Delete listing" } },
};

export const Secondary = { args: { variant: "secondary" } };
export const Ghost = { args: { variant: "ghost", slots: { default: "Dismiss" } } };
export const Link = { args: { variant: "link", slots: { default: "View all cars" } } };
export const Success = { args: { variant: "success", slots: { default: "Published" } } };
export const Warning = { args: { variant: "warning", slots: { default: "Payment due" } } };
export const Info = { args: { variant: "info", slots: { default: "Under review" } } };

export const Large = { args: { size: "xl" } };
export const Small = { args: { size: "xs" } };
export const Pill = { args: { pill: true, slots: { default: "Featured" } } };

export const WithRightIcon = {
  args: { slots: { default: "Continue", "right-icon": ICON } },
};

export const IconOnly = {
  args: {
    iconOnly: true,
    variant: "outline",
    "aria-label": "Next",
    slots: { default: ICON },
  },
};

/** Renders an `<a>`, not a `<button>`. */
export const AsLink = {
  args: { href: "/inventory", variant: "outline", slots: { default: "Browse inventory" } },
};

/**
 * An `<a>` ignores `disabled`, so the component drops `href`, sets
 * `aria-disabled` and dims the link itself. Check the markup, not just the pixels.
 */
export const DisabledLink = {
  args: { href: "/inventory", disabled: true, tabindex: 5, "aria-disabled": "false", slots: { default: "Browse inventory" } },
};

export const DisabledButton = { args: { disabled: true } };
