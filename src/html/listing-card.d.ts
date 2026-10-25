import type { ListingCardFields } from "../utils/listing-card";

export type { ListingCardFields };

export interface ListingCardOptions {
  listing: ListingCardFields;
  /** Where the card links. @default `/m/{id}/` */
  href?: string;
  /** The cover photo. Without one the card shows "Photo unavailable". */
  imageSrc?: string | null;
  /** A state flag shown before the location. Decorative. */
  flagSrc?: string | null;
  /** The title's heading level: 2 on a page of results, 3 inside a titled section. @default 2 */
  headingLevel?: 2 | 3;
  /**
   * Starts the title's element id (`{idPrefix}-{listing id}`), which names the
   * card. Give each row its own when one listing can show twice on a page.
   * @default "listing-card"
   */
  idPrefix?: string;
}

/**
 * Returns one listing card as an HTML string: photo, year and make, short
 * title, price, condition/body/mileage and location. The whole card is one
 * link. Styled by `@luxoticars/ui/styles/listing-card.css`, which the caller
 * loads. Every value is HTML-escaped on the way into the markup.
 */
export declare function createListingCard(options: ListingCardOptions): string;
