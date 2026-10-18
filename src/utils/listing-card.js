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
 * Makes are matched loosely on hyphens and spaces, so the make
 * "Mercedes-Benz" strips "Mercedes Benz" too. The make is only dropped when
 * something follows it, so the result is never empty.
 */
export function cardTitle(listing) {
  let title = listing.title.trim().replace(/^\d{4}\s+/, "");
  if (listing.make) {
    const make = listing.make.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[- ]+/g, "[- ]+");
    title = title.replace(new RegExp(`^${make}\\s+`, "i"), "");
  }
  return title || listing.title.trim();
}

/** "suv" → "SUV", "new" → "New". Only the initialisms are upper-cased; "new" is short but a word. */
const label = (value) => (["mpv", "suv"].includes(value) ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1));

/** "5000-10000" → "5,000–10,000 km", "200000+" → "200,000+ km". Anything else is dropped. */
export function mileageLabel(band) {
  const number = (value) => Number(value).toLocaleString("en-MY");
  const open = band?.match(/^(\d+)\+$/);
  if (open) return `${number(open[1])}+ km`;
  const closed = band?.match(/^(\d+)-(\d+)$/);
  return closed ? `${number(closed[1])}–${number(closed[2])} km` : null;
}

/** "Recon · SUV · 5,000–10,000 km". The year is in the kicker, so it is not repeated here. */
export function cardMeta(listing) {
  return [listing.condition && label(listing.condition), listing.car_type && label(listing.car_type), mileageLabel(listing.mileage_band)]
    .filter(Boolean)
    .join(" · ");
}

const amount = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 2 });

/** "MYR 450,000", or "Price on request" when the dealer gave none. */
export function cardPrice(listing) {
  if (listing.price === null || listing.price === undefined) return "Price on request";
  return `${listing.currency ?? "Currency unspecified"} ${amount.format(listing.price)}`;
}

/** "Bangsar, W.P. Kuala Lumpur". */
export function cardLocation(listing) {
  return [listing.location_area, listing.location_state].filter(Boolean).join(", ") || "Location not provided";
}
