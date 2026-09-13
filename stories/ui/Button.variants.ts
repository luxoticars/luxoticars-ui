import type { Variant } from "../../.storybook/astro-stories.ts";

const ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

const variants: Record<string, Variant> = {
  Default: { slots: { default: "Enquire now" } },
  Destructive: { props: { variant: "destructive" }, slots: { default: "Delete listing" } },
  Outline: { props: { variant: "outline" }, slots: { default: "Cancel" } },
  Secondary: { props: { variant: "secondary" }, slots: { default: "Save draft" } },
  Ghost: { props: { variant: "ghost" }, slots: { default: "Dismiss" } },
  Link: { props: { variant: "link" }, slots: { default: "View all cars" } },
  Success: { props: { variant: "success" }, slots: { default: "Published" } },
  Warning: { props: { variant: "warning" }, slots: { default: "Payment due" } },
  Info: { props: { variant: "info" }, slots: { default: "Under review" } },

  WithRightIcon: {
    slots: { default: "Continue", "right-icon": ICON },
  },
  IconOnly: {
    props: { iconOnly: true, variant: "outline" },
    slots: { default: ICON },
  },
  Pill: { props: { pill: true }, slots: { default: "Featured" } },

  /** The `href` branch: renders an <a>, not a <button>. */
  AsLink: {
    props: { href: "/inventory", variant: "outline" },
    slots: { default: "Browse inventory" },
  },

  /**
   * The regression this component previously had: an <a> ignores `disabled`,
   * so the link stayed clickable and fully opaque. Check the markup here has
   * no `href`, carries `aria-disabled="true"`, and renders dimmed.
   */
  DisabledLink: {
    props: { href: "/inventory", disabled: true },
    slots: { default: "Browse inventory" },
  },
  DisabledButton: {
    props: { disabled: true },
    slots: { default: "Enquire now" },
  },
};

export default variants;
