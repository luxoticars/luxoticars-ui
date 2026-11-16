/*
  The one place a seller summary's options are validated and turned into
  markup facts: which size it is, what the avatar shows, which badges and
  facts appear, and every piece of visible or spoken text.
  `astro/ui/SellerSummary.astro` prints exactly what this returns.

  It shows only what it is given. There is no rating, review count or response
  rate here, because nothing collects them yet: a number the site cannot stand
  behind would cost more trust than it earns.
  Internal: not in package.json#exports.
*/
import { cn } from "./cn.js";

const SIZES = ["full", "compact"];
const HEADING_LEVELS = [2, 3, 4, 5, 6];

export const SELLER_SUMMARY_LABELS = Object.freeze({
  heading: "About the seller",
  seller: "Seller",
  luxoticarsVerified: "Verified by Luxoticars",
  identityVerified: "Identity verified",
  carsForSale: "Cars for sale",
  location: "Location",
  registrationNo: "Registration no.",
  address: "Address",
  showroom: "View showroom",
});

const fail = (message) => {
  throw new Error(`SellerSummary: ${message}`);
};

/* `false` means "not set", as in ProgramBadge: `x={cond && "…"}` leaves `false` behind. */
const isUnset = (value) => value == null || value === false;
const text = (value) => (isUnset(value) ? "" : String(value).trim());

/* Up to two initials, from the first two words that start with a letter or digit.
   Array.from, so a letter outside the BMP is not cut in half. */
function initialsOf(name) {
  const letters = name
    .split(/\s+/)
    .map((word) => Array.from(word).find((char) => /[\p{L}\p{N}]/u.test(char)))
    .filter(Boolean);
  return letters.slice(0, 2).join("").toUpperCase();
}

/* The photo is rendered as `<img src>`, so only an https URL or a path on the
   same site (what a bundler gives for an imported asset) is used. Anything
   else is dropped and the initials show instead. */
const safeAvatar = (value) => {
  const url = text(value);
  return /^https:\/\/[^\s]+$/.test(url) || /^\/(?!\/)[^\s]*$/.test(url) ? url : undefined;
};

function carsCount(value) {
  if (isUnset(value) || value === "") return 0;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0) fail(`\`carsForSale\` must be a whole number, 0 or more. Got "${value}".`);
  return count;
}

export function resolveSellerSummary({
  name,
  size,
  href,
  avatarUrl,
  luxoticarsVerified,
  identityVerified,
  location,
  carsForSale,
  registrationNo,
  address,
  headingLevel,
  labels,
  id,
  className,
} = {}) {
  const variant = isUnset(size) ? "full" : String(size);
  if (!SIZES.includes(variant)) fail(`unknown size "${size}". Use one of: ${SIZES.join(", ")}.`);

  /* A numeric string counts: an HTML attribute or a Storybook control may send "3". */
  const level = Number(isUnset(headingLevel) ? 2 : headingLevel);
  if (!HEADING_LEVELS.includes(level)) fail(`unknown headingLevel "${headingLevel}". Use one of: ${HEADING_LEVELS.join(", ")}.`);

  /* A blank label override falls back to the default: an empty heading or an
     empty term would leave a region or a fact with no name. */
  const words = { ...SELLER_SUMMARY_LABELS };
  for (const key of Object.keys(SELLER_SUMMARY_LABELS)) {
    const override = text(labels?.[key]);
    if (override) words[key] = override;
  }

  const sellerName = text(name);
  const place = text(location);
  const cars = carsCount(carsForSale);

  /* The two flags are separate claims and are never merged: the blue tick is
     granted by hand, the identity check is automatic. Without a name there is
     nobody to attach either to. */
  const badges = [];
  if (sellerName && luxoticarsVerified === true) badges.push({ key: "luxoticarsVerified", icon: "verified", text: words.luxoticarsVerified });
  if (sellerName && identityVerified === true) badges.push({ key: "identityVerified", icon: undefined, text: words.identityVerified });

  const facts = [];
  if (cars > 0) facts.push({ key: "carsForSale", label: words.carsForSale, value: String(cars), wide: false });
  if (place) facts.push({ key: "location", label: words.location, value: place, wide: false });
  if (text(registrationNo)) facts.push({ key: "registrationNo", label: words.registrationNo, value: text(registrationNo), wide: true });
  if (text(address)) facts.push({ key: "address", label: words.address, value: text(address), wide: true });

  /* The compact line names the seller, so it needs a name. The full card can
     still carry the registration number and address of a seller it cannot name. */
  if (variant === "compact" && !sellerName) return null;
  if (!sellerName && facts.length === 0) return null;

  const rootId = text(id) || "seller-summary";
  const link = sellerName ? text(href) || undefined : undefined;

  return {
    size: variant,
    className: cn("seller-summary", `seller-summary--${variant}`, className),
    id: rootId,
    headingId: `${rootId}-heading`,
    headingLevel: level,
    heading: words.heading,
    sellerLabel: words.seller,
    name: sellerName || undefined,
    initials: sellerName ? initialsOf(sellerName) || undefined : undefined,
    avatarUrl: sellerName ? safeAvatar(avatarUrl) : undefined,
    href: link,
    showroomLabel: words.showroom,
    /* Compact has room for one badge. The blue tick comes first, so it wins. */
    badges: variant === "compact" ? badges.slice(0, 1) : badges,
    /* Compact shows the short facts as a line of text; the long ones stay in the full card. */
    meta: variant === "compact" ? [place, cars > 0 ? `${cars} ${cars === 1 ? "car" : "cars"} for sale` : ""].filter(Boolean) : [],
    facts: variant === "full" ? facts : [],
  };
}
