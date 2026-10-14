import type { ProgramBadgeIcon } from "../types";

export interface ProgramBadgePath {
  readonly d: string;
  readonly fillRule?: "evenodd";
}

export interface ProgramBadgeArtwork {
  /** The default accessible name of an icon-only badge. */
  readonly label: string;
  /** Drawn on a `0 0 24 24` viewBox and filled with `currentColor`. */
  readonly paths: readonly ProgramBadgePath[];
}

export declare const PROGRAM_BADGE_ICONS: Readonly<Record<ProgramBadgeIcon, ProgramBadgeArtwork>>;
