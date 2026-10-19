/** The listing fields a card reads, named as in luxoticars-vi's search feed. */
export interface ListingCardFields {
  id: string;
  title: string;
  make?: string | null;
  year?: number | null;
  condition?: string | null;
  car_type?: string | null;
  mileage_band?: string | null;
  price?: number | null;
  currency?: string | null;
  location_area?: string | null;
  location_state?: string | null;
}

/** "2021 · Land Rover": the line above the title. Empty when neither is known. */
export declare function cardKicker(listing: ListingCardFields): string;
/** The title without its leading year and make. Never empty: a blank title reads "Untitled listing". */
export declare function cardTitle(listing: ListingCardFields): string;
/** As luxoticars-vi shows it: "5000-10000" → "5,001 – 10,000 km", "200000+" → "200,000+ km"; anything else is `null`. */
export declare function mileageLabel(band: string | null | undefined): string | null;
/** "Recon · SUV · 5,001 – 10,000 km". Empty when none is known. */
export declare function cardMeta(listing: ListingCardFields): string;
/** "MYR 450,000", or "Price on request". */
export declare function cardPrice(listing: ListingCardFields): string;
/** "Bangsar, W.P. Kuala Lumpur", or "Location not provided". */
export declare function cardLocation(listing: ListingCardFields): string;
