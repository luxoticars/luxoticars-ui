import type { ClassValue } from "clsx";
import type { SellerSummaryLabels, SellerSummarySize } from "../types";

export interface SellerSummaryOptions {
  /** The seller's display name. Trimmed; blank counts as not set. */
  name?: string | false | null;
  /** @default "full" */
  size?: SellerSummarySize | false | null;
  /** Where the seller's own page is. Ignored without a `name`. */
  href?: string | false | null;
  /** The seller's photo or logo: an `https` URL or a same-site path. Anything else is dropped. */
  avatarUrl?: string | false | null;
  /** The Luxoticars blue tick. Only `true` shows it. */
  luxoticarsVerified?: boolean | null;
  /** The identity check. Only `true` shows it. */
  identityVerified?: boolean | null;
  location?: string | false | null;
  /** A whole number, 0 or more. 0 shows nothing. */
  carsForSale?: number | `${number}` | false | null;
  registrationNo?: string | false | null;
  address?: string | false | null;
  /** @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | `${2 | 3 | 4 | 5 | 6}` | false | null;
  /** Replacements for the built-in English text. A blank value keeps the default. */
  labels?: Partial<SellerSummaryLabels> | null;
  /** The root element's id; the heading's id is derived from it. @default "seller-summary" */
  id?: string | false | null;
  /** The caller's classes, in any form `cn()` accepts. */
  className?: ClassValue;
}

export interface ResolvedSellerBadge {
  key: "luxoticarsVerified" | "identityVerified";
  /** The ProgramBadge icon, when the badge has one. */
  icon: "verified" | undefined;
  text: string;
}

export interface ResolvedSellerFact {
  key: "carsForSale" | "location" | "registrationNo" | "address";
  label: string;
  value: string;
  /** Long values take the full row. */
  wide: boolean;
}

export interface ResolvedSellerSummary {
  size: SellerSummarySize;
  className: string;
  id: string;
  headingId: string;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  heading: string;
  /** Spoken before the name in the compact size, which has no heading. */
  sellerLabel: string;
  name: string | undefined;
  /** Shown when there is no photo, and behind the photo while it loads or if it fails. */
  initials: string | undefined;
  avatarUrl: string | undefined;
  href: string | undefined;
  showroomLabel: string;
  badges: ResolvedSellerBadge[];
  /** Compact only. */
  meta: string[];
  /** Full only. */
  facts: ResolvedSellerFact[];
}

/** The built-in English text. Frozen. */
export declare const SELLER_SUMMARY_LABELS: Readonly<SellerSummaryLabels>;

/**
 * Validates a seller summary's options and decides its markup. `null` when
 * there is nothing to show: a compact summary with no name, or a full one with
 * neither a name nor a fact. Throws on an unknown size or heading level, and on
 * a `carsForSale` that is not a whole number.
 */
export declare function resolveSellerSummary(options?: SellerSummaryOptions): ResolvedSellerSummary | null;
