import type { FooterContact, FooterLink, FooterSocial } from "../types";

/**
 * Options for {@link createFooter}. Every field mirrors the matching prop on
 * `astro/Footer.astro`, so the two APIs are configured the same way.
 */
export interface FooterOptions {
  /**
   * Prefix for the generated heading ids the column `<nav>` landmarks point at.
   * Only needs changing if a page renders two footers.
   * @default "footer"
   */
  idPrefix?: string;
  /** Wordmark text for the built-in logo fallback. Ignored when `logo` is given. @default "Luxoticars" */
  siteTitle?: string;
  /** Where the built-in wordmark links. Ignored when `logo` is given. @default "/" */
  homeHref?: string;
  /**
   * Markup replacing the built-in wordmark — the string-builder stand-in for the
   * component's `logo` slot. Written out as HTML rather than escaped, so pass
   * markup you control, never user input.
   */
  logo?: string;
  /** Line under the wordmark. Omitted from the markup when empty. */
  tagline?: string;
  /** @default "Shop by Brand" */
  brandsHeading?: string;
  /** The brand column is omitted entirely when this is empty. */
  brandLinks?: FooterLink[];
  /** @default "Luxoticars" */
  companyHeading?: string;
  /** The company column is omitted entirely when this is empty. */
  companyLinks?: FooterLink[];
  /** @default "Enquiries" */
  enquiriesHeading?: string;
  /** Blurb above the contacts. Omitted from the markup when empty. */
  enquiriesText?: string;
  /** The enquiries column is omitted entirely when this is empty. */
  contacts?: FooterContact[];
  /** The social row is omitted entirely when this is empty. */
  socials?: FooterSocial[];
  /** The legal bar is omitted entirely when this is empty. */
  legalLinks?: FooterLink[];
  /** Overrides the whole copyright line. Defaults to "© <year> <siteTitle>. All rights reserved." */
  copyright?: string;
  /** Year in the built-in copyright line. @default the current year */
  year?: number;
  /** Extra classes, appended after `footer`. @default "" */
  className?: string;
}

/**
 * Returns the Luxoticars footer as an HTML string, for contexts that render
 * markup without Astro. Defaults come from `data/footer`, so calling it with no
 * arguments produces the real site footer.
 *
 * Unlike `createButton` this markup carries no Tailwind classes — it is styled
 * by the stylesheet it shares with the Astro component, which the caller loads:
 *
 * ```js
 * import "@luxoticars/ui/styles/footer.css";
 * ```
 *
 * Left with its built-in wordmark it also renders a `createLogo`, whose own
 * stylesheet the caller loads the same way:
 *
 * ```js
 * import "@luxoticars/ui/styles/logo.css";
 * ```
 *
 * Every value except `logo` is HTML-escaped on the way into the markup.
 *
 * Plain JS with a hand-written .d.ts rather than TypeScript, because the
 * package ships unbuilt — the same reason `utils/cn` is written that way.
 */
export declare function createFooter(options?: FooterOptions): string;
