/*
  Story cases shared by the Astro stories (stories/ui/), the Marko stories
  (src/marko/lx-menu-button/stories.ts) and the unit tests, so both renderers are
  shown, and checked, with the same inputs. Framework-free: it imports no component.
*/
import type { MenuButtonAlign, MenuButtonItem, MenuButtonType } from "../src/types";

export interface MenuButtonCase {
  label: string;
  items: MenuButtonItem[];
  type?: MenuButtonType;
  name?: string;
  align?: MenuButtonAlign;
  id?: string;
}

export const cases = {
  /** The Condition filter, for the search results toolbar. "Any Condition" is exclusive. */
  Condition: {
    id: "condition",
    label: "Condition",
    type: "checkbox",
    items: [
      { value: "any", label: "Any Condition", checked: true, exclusive: true },
      { value: "new", label: "New" },
      { value: "used", label: "Used" },
      { value: "recon", label: "Recon" },
    ],
  },
  /** Counts in the badges, as in eBay's badged menu button. */
  Badged: {
    id: "badged",
    label: "eBay Menu",
    items: [
      { label: "item 1 that has very long text", badge: 1, badgeLabel: "1 new message" },
      { label: "item 2", badge: 99, badgeLabel: "99 new messages" },
      { label: "item 3", badge: 10, badgeLabel: "10 new messages" },
    ],
  },
  /** A filter whose options show how many cars match. */
  CheckboxWithBadges: {
    id: "makes",
    label: "Make",
    type: "checkbox",
    items: [
      { value: "bmw", label: "BMW", badge: 24, badgeLabel: "24 cars" },
      { value: "mercedes", label: "Mercedes-Benz", badge: 31, badgeLabel: "31 cars", checked: true },
      { value: "porsche", label: "Porsche", badge: 7, badgeLabel: "7 cars" },
    ],
  },
  /** Pick one of several. */
  Radio: {
    id: "sort",
    label: "Sort",
    type: "radio",
    items: [
      { value: "best", label: "Best match", checked: true },
      { value: "price-asc", label: "Price: lowest first" },
      { value: "price-desc", label: "Price: highest first" },
      { value: "newest", label: "Newest listed" },
    ],
  },
  /** A prefix before each label. It is decorative unless it has a `prefixLabel`. */
  Prefix: {
    id: "budget",
    label: "Budget",
    type: "radio",
    items: [
      { value: "under-100", label: "Under 100,000", prefix: "RM", prefixLabel: "Ringgit" },
      { value: "100-300", label: "100,000 to 300,000", prefix: "RM", prefixLabel: "Ringgit", checked: true },
      { value: "over-300", label: "Over 300,000", prefix: "RM", prefixLabel: "Ringgit" },
    ],
  },
  /** Items that navigate. */
  Links: {
    id: "account",
    label: "Account",
    items: [
      { label: "Saved cars", href: "/account/saved" },
      { label: "Saved searches", href: "/account/searches" },
      { label: "Sign out", href: "/sign-out" },
    ],
  },
  WithDisabledItem: {
    id: "fuel",
    label: "Fuel",
    type: "checkbox",
    items: [
      { value: "petrol", label: "Petrol" },
      { value: "diesel", label: "Diesel", disabled: true },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  /** Each checked item submits as `condition=<value>` with the form. */
  InAForm: {
    id: "form-condition",
    label: "Condition",
    type: "checkbox",
    name: "condition",
    items: [
      { value: "new", label: "New" },
      { value: "used", label: "Used", checked: true },
      { value: "recon", label: "Recon" },
    ],
  },
  AlignEnd: {
    id: "align-end",
    label: "Condition",
    type: "checkbox",
    align: "end",
    items: [
      { value: "new", label: "New" },
      { value: "used", label: "Used" },
    ],
  },
} satisfies Record<string, MenuButtonCase>;

/**
 * Controls for the Marko stories. @storybook/marko has no docgen, so these are
 * written out, with the descriptions of the JSDoc on the tag's `Input`. The
 * Astro stories get theirs from `Props` instead.
 */
export const markoArgTypes = {
  label: { control: "text", description: "The button's visible text and accessible name." },
  type: {
    control: "inline-radio",
    options: ["none", "checkbox", "radio"],
    mapping: { none: undefined },
    description: "`checkbox`: each item toggles. `radio`: choose one. None: plain actions or links.",
  },
  align: {
    control: "inline-radio",
    options: ["start", "end"],
    description: "Which edge of the button the menu lines up with.",
    table: { defaultValue: { summary: "start" } },
  },
  name: { control: "text", description: "A form field name. Each checked item submits under it." },
  items: {
    control: "object",
    description: "The entries: `label`, and optionally `value`, `checked`, `exclusive`, `disabled`, `href`, `badge`, `badgeLabel`, `prefix`, `prefixLabel`.",
  },
} as const;
