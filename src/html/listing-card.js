import { escapeHtml } from "./utils.js";
import { cardKicker, cardLocation, cardMeta, cardPrice, cardTitle } from "../utils/listing-card.js";

/*
  One listing as a card. The title link is stretched over the whole card
  (styles/listing-card.css), so the photo, the price and the text all open
  the listing while the card keeps one link and one name for a screen reader.
  The caller loads the stylesheet:

      import "@luxoticars/ui/styles/listing-card.css";
*/
export const createListingCard = ({
  listing,
  href = `/m/${listing.id}/`,
  imageSrc,
  flagSrc,
  headingLevel = 2,
  idPrefix = "listing-card",
}) => {
  const id = `${idPrefix}-${listing.id}`;
  const kicker = cardKicker(listing);
  const meta = cardMeta(listing);
  const h = headingLevel === 3 ? "h3" : "h2";
  const media = imageSrc
    ? `<img class="listing-card__image" src="${escapeHtml(imageSrc)}" alt="" loading="lazy" decoding="async" width="640" height="480" referrerpolicy="no-referrer">`
    : `<span class="listing-card__no-photo">Photo unavailable</span>`;
  // Decorative: the state is named in the text beside it.
  const flag = flagSrc
    ? `<img class="listing-card__flag" src="${escapeHtml(flagSrc)}" alt="" width="24" height="12" loading="lazy" decoding="async">`
    : "";
  return `<article class="listing-card" aria-labelledby="${escapeHtml(id)}">
  <div class="listing-card__media" aria-hidden="true">${media}</div>
  <div class="listing-card__body">${kicker ? `
    <p class="listing-card__kicker">${escapeHtml(kicker)}</p>` : ""}
    <${h} class="listing-card__title" id="${escapeHtml(id)}"><a class="listing-card__link" href="${escapeHtml(href)}" aria-label="${escapeHtml(listing.title.trim() || cardTitle(listing))}">${escapeHtml(cardTitle(listing))}</a></${h}>
    <p class="listing-card__price">${escapeHtml(cardPrice(listing))}</p>${meta ? `
    <p class="listing-card__meta">${escapeHtml(meta)}</p>` : ""}
    <p class="listing-card__location">${flag}<span>${escapeHtml(cardLocation(listing))}</span></p>
  </div>
</article>`;
};
