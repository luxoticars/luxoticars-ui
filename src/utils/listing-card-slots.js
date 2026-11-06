/**
 * Shared guards for ListingCard / <lx-listing-card>. Both renderers call this
 * before printing markup so a missing href, title or price fails the same way.
 *
 * @param {{ href?: string, titleText?: string, priceText?: string }} input
 */
export function assertListingCardSlots({ href, titleText, priceText }) {
  if (typeof href !== "string" || href.trim() === "") {
    throw new Error("ListingCard: `href` is required.");
  }
  if (typeof titleText !== "string" || titleText.trim() === "") {
    throw new Error("ListingCard: `title` slot is required and must not be empty.");
  }
  if (typeof priceText !== "string" || priceText.trim() === "") {
    throw new Error("ListingCard: `price` slot is required and must not be empty.");
  }
}
