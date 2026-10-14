/*
  Story cases shared by the Astro stories (stories/ui/), the Marko stories
  (stories-marko/) and the parity test, so both renderers are shown, and
  checked, with the same inputs. Framework-free: it imports no component.
*/
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../src/types";

export interface ProgramBadgeCase {
  text?: string;
  icon?: ProgramBadgeIcon;
  size?: ProgramBadgeSize;
  iconLabel?: string;
  class?: string;
  id?: string;
  "data-test"?: string;
}

export const cases = {
  Default: { icon: "top-rated-seller", text: "Top rated seller" },
  TextOnly: { text: "Free inspection" },
  IconOnly: { icon: "top-rated-seller" },
  Large: { icon: "top-rated-seller", text: "Top rated seller", size: 24 },
  IconOnlyMalayLabel: { icon: "top-rated-seller", iconLabel: "Penjual terbaik" },
  WithAttributes: {
    icon: "top-rated-seller",
    text: "Top rated seller",
    class: "extra",
    id: "badge-1",
    "data-test": "badge",
  },
} satisfies Record<string, ProgramBadgeCase>;

/**
 * Controls for the Marko stories. @storybook/marko has no docgen, so these are
 * written out, with the descriptions of the JSDoc on the tag's `Input`. The
 * Astro stories get theirs from `Props` instead.
 */
export const markoArgTypes = {
  text: { control: "text", description: "Visible label." },
  icon: {
    control: "select",
    options: ["top-rated-seller", "none"],
    mapping: { none: undefined },
    description: "A built-in icon.",
  },
  size: {
    control: "inline-radio",
    options: [16, 24],
    description: "Icon size in px; also sets the text size and gap.",
    table: { defaultValue: { summary: "16" } },
  },
  iconLabel: {
    control: "text",
    description: "What screen readers hear for an icon-only badge. Ignored when `text` is set.",
    table: { defaultValue: { summary: "the icon's own label" } },
  },
} as const;
