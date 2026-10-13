import type { ClassValue } from "clsx";
import type { ProgramBadgeIcon, ProgramBadgeSize } from "../types";
import type { ProgramBadgePath } from "../data/program-badge-icons";

export interface ProgramBadgeOptions {
  /** Visible label. Trimmed; whitespace-only counts as no text. `false` counts as not set, so `text={cond && "…"}` works. */
  text?: string | false | null;
  /** A built-in icon. `""` and `false` count as no icon, so `icon={cond && "…"}` works. */
  icon?: ProgramBadgeIcon | "" | false | null;
  /** `false` counts as not set. @default 16 */
  size?: ProgramBadgeSize | `${ProgramBadgeSize}` | false | null;
  /** The icon's accessible name when the badge has no text. `false` counts as not set. @default the icon's own label */
  iconLabel?: string | false | null;
  /** The caller's classes, in any form `cn()` accepts (Marko's `class` may be an array or object). */
  className?: ClassValue;
}

export interface ResolvedProgramBadgeIcon {
  paths: readonly ProgramBadgePath[];
  /** `"img"` when the icon is the badge's only content; `undefined` when text names the badge. */
  role: "img" | undefined;
  /** `aria-label`, alongside `role="img"`. */
  label: string | undefined;
  /** `aria-hidden`, as the string ARIA expects. */
  hidden: "true" | undefined;
}

export interface ResolvedProgramBadge {
  /** `program-badge`, then the size modifier, then the caller's classes. */
  className: string;
  text: string | undefined;
  icon: ResolvedProgramBadgeIcon | null;
}

/**
 * Validates a program badge's options and decides its markup. `null` when there
 * is neither an icon nor text, so nothing renders. Throws on an unknown icon or
 * size, and on an icon-only badge whose `iconLabel` is empty.
 */
export declare function resolveProgramBadge(options?: ProgramBadgeOptions): ResolvedProgramBadge | null;
