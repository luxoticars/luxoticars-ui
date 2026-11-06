/** Framework-free scroller story metadata and Show-code snippets. */

const listingCardSnippet = (
  id: string,
  title: string,
  price: string,
  image: "priority" | "lazy",
) => `<div class="scrolling-item-cards__item">
    <ListingCard href="/m/${id}/" headingId="card-${id}" headingLevel={3}>
      <img slot="media" class="listing-card__image" src="/m/${id}/cover/" alt="" width="640" height="480" ${
        image === "priority"
          ? 'loading="eager" fetchpriority="high"'
          : 'loading="lazy"'
      } decoding="async" />
      <Fragment slot="title">${title}</Fragment>
      <Fragment slot="price">${price}</Fragment>
    </ListingCard>
  </div>`;

export const scrollerSource = {
  SimilarCars: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
import SectionHead from "@luxoticars/ui/astro/SectionHead";
---
<ScrollingItemCards headingId="similar-cars">
  <SectionHead slot="title" title="Similar cars" headingId="similar-cars" linkHref="/search" linkLabel="View all" />
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
  ${listingCardSnippet("3", "BMW M4", "MYR 520,000", "lazy")}
  ${listingCardSnippet("4", "Mercedes-AMG GT", "MYR 780,000", "lazy")}
</ScrollingItemCards>`,
  Promo: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards label="Featured cars">
  <div slot="titleCard"><h2>This week's picks</h2></div>
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
</ScrollingItemCards>`,
  NoOverflow: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards label="One car">
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
</ScrollingItemCards>`,
  WithFooter: `---
import ScrollingItemCards from "@luxoticars/ui/astro/ui/ScrollingItemCards";
import ListingCard from "@luxoticars/ui/astro/ui/ListingCard";
---
<ScrollingItemCards headingId="with-footer">
  <h2 id="with-footer" slot="title">Just listed</h2>
  ${listingCardSnippet("1", "Range Rover Vogue", "MYR 450,000", "priority")}
  ${listingCardSnippet("2", "Porsche 911", "MYR 890,000", "lazy")}
  <p slot="footer">Prices include taxes.</p>
</ScrollingItemCards>`,
} as const;
