/*
  The text a listing card shows, decided once for every app that shows one
  (the search results, the home page's Just listed row), so a listing reads
  the same everywhere. Fields are named as in luxoticars-vi's search feed.
*/

/** "2021 · Land Rover": the line above the title. */
export function cardKicker(listing) {
  return [listing.year, listing.make].filter(Boolean).join(" · ");
}

/**
 * The title without its leading year and make, which the kicker already
 * shows: "2021 Land Rover Range Rover Vogue" becomes "Range Rover Vogue".
 * Only the listing's own year is dropped, so a model number such as the
 * Peugeot "3008" stays. Makes are matched loosely on hyphens and spaces, so
 * the make "Mercedes-Benz" strips "Mercedes Benz" too, and only when the
 * kicker shows it. Each is only dropped when something follows it, and a
 * blank title reads "Untitled listing", so the card's link always has a name.
 */
export function cardTitle(listing) {
  const full = listing.title.trim();
  if (!full) return "Untitled listing";
  let title = full;
  if (listing.year) title = title.replace(new RegExp(`^${listing.year}\\s+`), "");
  if (listing.make) {
    const make = listing.make.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[- ]+/g, "[- ]+");
    title = title.replace(new RegExp(`^${make}\\s+`, "i"), "");
  }
  return title || full;
}

/** "suv" → "SUV", "new" → "New". Only the initialisms are upper-cased; "new" is short but a word. */
const label = (value) => (["mpv", "suv"].includes(value) ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1));

/**
 * The mileage band as luxoticars-vi's listing page shows it (formatMileageBand
 * in its src/utils/specs.ts), so the card and the page agree: bands are
 * exclusive on the low side except the first, which starts at 0.
 * "5000-10000" → "5,001 – 10,000 km", "0-5000" → "0 – 5,000 km",
 * "200000+" → "200,000+ km". Anything else, a reversed band included, is dropped.
 */
export function mileageLabel(band) {
  const km = (value) => value.toLocaleString("en-MY");
  const open = band?.match(/^(\d+)\+$/);
  if (open) return `${km(Number(open[1]))}+ km`;
  const closed = band?.match(/^(\d+)-(\d+)$/);
  if (!closed) return null;
  const min = Number(closed[1]);
  const max = Number(closed[2]);
  return min < max ? `${km(min === 0 ? 0 : min + 1)} – ${km(max)} km` : null;
}

/** "Recon · SUV · 5,001 – 10,000 km". The year is in the kicker, so it is not repeated here. */
export function cardMeta(listing) {
  return [listing.condition && label(listing.condition), listing.car_type && label(listing.car_type), mileageLabel(listing.mileage_band)]
    .filter(Boolean)
    .join(" · ");
}

const amount = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 2 });

/** "MYR 450,000", or "Price on request" when the dealer gave none (or 0). */
export function cardPrice(listing) {
  if (!listing.price) return "Price on request";
  return `${listing.currency?.trim() || "Currency unspecified"} ${amount.format(listing.price)}`;
}

/** "Bangsar, W.P. Kuala Lumpur". */
export function cardLocation(listing) {
  return [listing.location_area, listing.location_state].filter(Boolean).join(", ") || "Location not provided";
}
