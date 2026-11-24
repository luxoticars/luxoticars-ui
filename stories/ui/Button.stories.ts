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
export const Success = {
  args: { variant: "success", slots: { default: "Published" } },
};
export const Warning = {
  args: { variant: "warning", slots: { default: "Payment due" } },
};
export const Info = { args: { variant: "info", slots: { default: "Under review" } } };

export const Large = { args: { size: "xl" } };
export const Small = { args: { size: "xs" } };
export const Pill = { args: { radius: "full", slots: { default: "Featured" } } };

/** Square corners, for a button that sits flush against a hard edge. */
export const SquareCorners = { args: { radius: "none" } };

/** A fixed step of the radius scale, instead of the theme's control radius. */
export const LargeRadius = { args: { radius: "xl" } };

/** `pill` still works as shorthand for `radius="full"`; `radius` wins when both are set. */
export const LegacyPill = { args: { pill: true, slots: { default: "Featured" } } };

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

const CHEVRON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

/**
 * The trigger of an accordion or disclosure. `aria-expanded` is printed as the
 * string `"false"`, so a closed one still says so (Astro would leave out a
 * plain `false` attribute); `aria-controls` names the panel it shows and hides.
 * The component does not keep the state: flip `aria-expanded` when the panel
 * opens or closes.
 */
export const AccordionTrigger = {
  args: {
    variant: "outline",
    "aria-expanded": false,
    "aria-controls": "faq-answer-1",
    slots: { default: "What does the inspection cover?", "right-icon": CHEVRON },
  },
};

/**
 * The same trigger while open: `aria-expanded="true"` also keeps the pressed
 * look. It has no `aria-controls` here on purpose: while a button is expanded
 * its `aria-controls` must name an element that is in the page (axe fails the
 * story otherwise), and a story of one button has no panel to point at. The
 * gallery shows the pair.
 */
export const AccordionTriggerOpen = {
  args: { ...AccordionTrigger.args, "aria-expanded": true, "aria-controls": undefined },
};

/** A button that opens a menu: `aria-haspopup="menu"`, closed, and the id of the menu it opens. */
export const MenuTrigger = {
  args: {
    variant: "outline",
    "aria-haspopup": "menu",
    "aria-expanded": false,
    "aria-controls": "actions-menu",
    slots: { default: "Actions", "right-icon": CHEVRON },
  },
};

/** A button that opens a modal: `aria-haspopup="dialog"` and the id of the dialog. */
export const DialogTrigger = {
  args: { "aria-haspopup": "dialog", "aria-controls": "filters-dialog", slots: { default: "Filters" } },
};

/** Renders an `<a>`, not a `<button>`. */
export const AsLink = {
  args: { href: "/inventory", variant: "outline", slots: { default: "Browse inventory" } },
};

/**
 * An `<a>` ignores `disabled`, so the component drops `href`, sets
 * `aria-disabled` and dims the link itself. Check the markup, not just the
 * pixels — and note the deliberately conflicting `tabindex`/`aria-disabled`
 * args: they regression-test that a caller cannot re-enable a disabled link.
 * Astro renders a spread attribute and an explicit one of the same name as two
 * attributes and an HTML parser keeps the first, so the component has to drop
 * the caller's key rather than write the enforced value after it.
 */
export const DisabledLink = {
  args: {
    href: "/inventory",
    disabled: true,
    tabindex: 5,
    "aria-disabled": "false",
    slots: { default: "Browse inventory" },
  },
};

export const DisabledButton = { args: { disabled: true } };

/**
 * `type` is forwarded, for the same duplicate-attribute reason as above: the
 * built-in `type="button"` must not shadow a caller's own, or a Button inside
 * a form never submits it.
 */
export const Submit = {
  args: { type: "submit", slots: { default: "Save changes" } },
};
