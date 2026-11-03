import type { FooterLink } from "../types";

/** Buy, Services, Reviews, About. */
export declare const SITE_HEADER_LINKS: readonly FooterLink[];

export interface ResolvedSiteHeaderLink extends FooterLink {
  target?: "_blank";
  rel?: "noopener noreferrer";
}

export interface ResolvedSiteHeader {
  links: ResolvedSiteHeaderLink[];
  /** `null` when the label is empty: no button is rendered. */
  cta: { first: string; rest: string; label?: string } | null;
}

export declare function resolveSiteHeader(input?: {
  links?: readonly FooterLink[];
  ctaLabel?: string;
}): ResolvedSiteHeader;
