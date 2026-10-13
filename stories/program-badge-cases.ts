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
