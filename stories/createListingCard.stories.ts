import { createListingCard } from "../src/html/listing-card";
import type { ListingCardOptions } from "../src/html/listing-card";
/*
  The builder ships markup only, so the story loads the stylesheet the way a
  consumer would (`@luxoticars/ui/styles/listing-card.css`).
*/
import "../src/styles/listing-card.css";

const listing = {
  id: "abc123",
  title: "2021 Land Rover Range Rover Vogue P400 SE",
  make: "Land Rover",
  year: 2021,
  condition: "recon",
  car_type: "suv",
  mileage_band: "5000-10000",
  price: 450000,
  currency: "MYR",
  location_area: "Bangsar",
  location_state: "W.P. Kuala Lumpur",
};

/**
 * One listing as a card, the same on the home page and in the search results.
 * The whole card is one link, named by the listing's full title.
 */
export default {
  title: "HTML/createListingCard",
  tags: ["autodocs"],
  render: (args: ListingCardOptions) => {
    const host = document.createElement("div");
    host.style.cssText = "max-width:18rem;padding:2rem";
    host.innerHTML = createListingCard(args);
    return host;
  },
  argTypes: {
    listing: { control: "object" },
    href: { control: "text" },
    imageSrc: { control: "text" },
    headingLevel: { control: "inline-radio", options: [2, 3] },
  },
};

/** No photo given: the card says so instead of showing a broken image. */
export const WithoutPhoto = { args: { listing } };

/** No price, no year or make, no condition: the readable fallbacks. */
export const SparseListing = {
  args: { listing: { id: "x1", title: "Porsche 911 GT3", price: null } },
};
