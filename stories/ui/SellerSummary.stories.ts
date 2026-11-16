import SellerSummary from "../../src/astro/ui/SellerSummary.astro";
/*
  Astro components are prerendered to markup by the Storybook framework, so
  the stylesheets reach the story as modules here, as they do for ProgramBadge.
*/
import "../../src/styles/seller-summary.css";
import "../../src/styles/program-badge.css";

/*
  This Storybook serves no images (as with the ListingCard covers), so the
  photo below never loads. That is the case these stories show: the initials
  stay in place behind a photo that is slow or missing.
*/
const photo = "/dealer-photo.webp";

/**
 * The dealer is sample data. Real ones come from the profile site's dealer
 * list (name, photo, the two verification flags, location) and from the
 * listing (registration number, address).
 */
export default {
  title: "Components/SellerSummary",
  component: SellerSummary,
  tags: ["autodocs"],
};

const dealer = {
  name: "Example Auto Sdn Bhd",
  href: "https://luxoticars.com/exampleauto",
  luxoticarsVerified: true,
  identityVerified: true,
  location: "Petaling Jaya",
  carsForSale: 12,
  registrationNo: "201901012345",
  address: "12, Jalan Contoh 3/1, 47810 Petaling Jaya, Selangor",
};

export const Full = { args: dealer };
export const FullPhotoUnavailable = { args: { ...dealer, avatarUrl: photo } };
// The identity check alone never shows the blue tick.
export const FullIdentityOnly = { args: { ...dealer, luxoticarsVerified: false } };
export const FullUnverified = { args: { ...dealer, luxoticarsVerified: false, identityVerified: false } };
// A seller the dealer list does not know: the listing's own details still show.
export const FullWithoutName = { args: { registrationNo: dealer.registrationNo, address: dealer.address } };
export const FullNameOnly = { args: { name: dealer.name } };
export const FullLongText = {
  args: {
    ...dealer,
    name: "Persatuan Pengimport Dan Peniaga Kenderaan Melayu Malaysia Sdn Bhd",
    location: "Dolomite Business Park, Batu Caves",
    registrationNo: "202403328676 (1574523-U)",
    address: "Lot 70213, Jalan DBP, Dolomite Business Park, 68100 Batu Caves, Selangor Darul Ehsan, Malaysia",
  },
};
export const FullHeadingLevel3 = { args: { ...dealer, headingLevel: 3, id: "seller" } };
export const FullMalayLabels = {
  args: {
    ...dealer,
    labels: {
      heading: "Tentang penjual",
      luxoticarsVerified: "Disahkan oleh Luxoticars",
      identityVerified: "Identiti disahkan",
      carsForSale: "Kereta untuk dijual",
      location: "Lokasi",
      registrationNo: "No. pendaftaran",
      address: "Alamat",
      showroom: "Lihat bilik pameran",
    },
  },
};

export const Compact = { args: { ...dealer, size: "compact", href: "#seller-summary" } };
export const CompactPhotoUnavailable = { args: { ...dealer, size: "compact", avatarUrl: photo } };
export const CompactIdentityOnly = { args: { ...dealer, size: "compact", luxoticarsVerified: false } };
export const CompactOneCar = { args: { ...dealer, size: "compact", carsForSale: 1 } };
export const CompactNameOnly = { args: { name: dealer.name, size: "compact" } };
export const CompactLongText = { args: { ...FullLongText.args, size: "compact" } };
export const CompactWithAttributes = {
  args: { ...dealer, size: "compact", class: "extra", id: "seller-line", "data-test": "seller" },
};
