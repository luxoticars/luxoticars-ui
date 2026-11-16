import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSellerSummary, SELLER_SUMMARY_LABELS } from "../src/utils/seller-summary.js";

/* The resolver decides everything a seller summary renders, so the Astro
   component only prints its answer. */

const dealer = {
  name: "Example Auto Sdn Bhd",
  href: "https://luxoticars.com/exampleauto",
  avatarUrl: "https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/avatars/u/1.webp",
  luxoticarsVerified: true,
  identityVerified: true,
  location: "Petaling Jaya",
  carsForSale: 12,
  registrationNo: "201901012345",
  address: "12, Jalan Contoh 3/1, 47810 Petaling Jaya, Selangor",
};

test("full: everything it is given, in a fixed order", () => {
  assert.deepEqual(resolveSellerSummary(dealer), {
    size: "full",
    className: "seller-summary seller-summary--full",
    id: "seller-summary",
    headingId: "seller-summary-heading",
    headingLevel: 2,
    heading: "About the seller",
    sellerLabel: "Seller",
    name: "Example Auto Sdn Bhd",
    initials: "EA",
    avatarUrl: dealer.avatarUrl,
    href: dealer.href,
    showroomLabel: "View showroom",
    badges: [
      { key: "luxoticarsVerified", icon: "verified", text: "Verified by Luxoticars" },
      { key: "identityVerified", icon: undefined, text: "Identity verified" },
    ],
    meta: [],
    facts: [
      { key: "carsForSale", label: "Cars for sale", value: "12", wide: false },
      { key: "location", label: "Location", value: "Petaling Jaya", wide: false },
      { key: "registrationNo", label: "Registration no.", value: "201901012345", wide: true },
      { key: "address", label: "Address", value: dealer.address, wide: true },
    ],
  });
});

test("compact: one badge, the short facts as text, no fact list", () => {
  const seller = resolveSellerSummary({ ...dealer, size: "compact" });
  assert.equal(seller.className, "seller-summary seller-summary--compact");
  assert.deepEqual(seller.badges, [{ key: "luxoticarsVerified", icon: "verified", text: "Verified by Luxoticars" }]);
  assert.deepEqual(seller.meta, ["Petaling Jaya", "12 cars for sale"]);
  assert.deepEqual(seller.facts, []);
});

test("compact: the identity check shows when there is no blue tick", () => {
  const seller = resolveSellerSummary({ ...dealer, size: "compact", luxoticarsVerified: false });
  assert.deepEqual(seller.badges, [{ key: "identityVerified", icon: undefined, text: "Identity verified" }]);
});

test("compact: one car is singular; none says nothing", () => {
  assert.deepEqual(resolveSellerSummary({ name: "x", size: "compact", carsForSale: 1 }).meta, ["1 car for sale"]);
  assert.deepEqual(resolveSellerSummary({ name: "x", size: "compact", carsForSale: 0 }).meta, []);
  assert.deepEqual(resolveSellerSummary({ name: "x", size: "compact" }).meta, []);
});

test("verification: the two flags are separate, and only `true` counts", () => {
  assert.deepEqual(resolveSellerSummary({ name: "x", identityVerified: true }).badges.map((b) => b.key), ["identityVerified"]);
  assert.deepEqual(resolveSellerSummary({ name: "x", luxoticarsVerified: true }).badges.map((b) => b.key), ["luxoticarsVerified"]);
  for (const value of [false, null, undefined, "true", 1, "yes"]) {
    assert.deepEqual(resolveSellerSummary({ name: "x", luxoticarsVerified: value, identityVerified: value }).badges, []);
  }
});

test("nothing to show renders nothing", () => {
  assert.equal(resolveSellerSummary(), null);
  assert.equal(resolveSellerSummary({}), null);
  assert.equal(resolveSellerSummary({ name: "  " }), null);
  assert.equal(resolveSellerSummary({ name: false, location: "" }), null);
  // The compact line names the seller, so facts alone are not enough.
  assert.equal(resolveSellerSummary({ size: "compact", location: "Petaling Jaya", carsForSale: 3 }), null);
});

test("full without a name: the facts still show, with no link, badge or avatar", () => {
  const seller = resolveSellerSummary({ ...dealer, name: "" });
  assert.equal(seller.name, undefined);
  assert.equal(seller.initials, undefined);
  assert.equal(seller.avatarUrl, undefined);
  assert.equal(seller.href, undefined);
  assert.deepEqual(seller.badges, []);
  assert.equal(seller.facts.length, 4);
});

test("facts: blank ones are left out, and text is trimmed", () => {
  const seller = resolveSellerSummary({ name: " Example Auto ", location: "  ", registrationNo: " 762368-A ", address: false, carsForSale: 0 });
  assert.equal(seller.name, "Example Auto");
  assert.deepEqual(seller.facts, [{ key: "registrationNo", label: "Registration no.", value: "762368-A", wide: true }]);
});

test("initials: the first two words that start with a letter or digit", () => {
  const initials = (name) => resolveSellerSummary({ name }).initials;
  assert.equal(initials("RED ATOM AUTO SDN BHD"), "RA");
  assert.equal(initials("eltas"), "E");
  assert.equal(initials("  al   hafiz recond"), "AH");
  assert.equal(initials("(M) Motors"), "MM");
  assert.equal(initials("960506106039"), "9");
  assert.equal(initials("Élan Über"), "ÉÜ");
  assert.equal(initials("𝒜uto 𝒷"), "𝒜𝒷".toUpperCase());
  assert.equal(initials("—"), undefined);
});

test("avatarUrl: https or a same-site path; anything else is dropped", () => {
  const avatar = (avatarUrl) => resolveSellerSummary({ name: "x", avatarUrl }).avatarUrl;
  assert.equal(avatar("https://example.com/a.webp"), "https://example.com/a.webp");
  assert.equal(avatar("/_astro/a.hash.webp"), "/_astro/a.hash.webp");
  for (const bad of ["http://example.com/a.jpg", "//example.com/a.jpg", "javascript:alert(1)", "data:image/png;base64,AA", "https://exa mple.com/a", "a.jpg", "", false, null]) {
    assert.equal(avatar(bad), undefined, String(bad));
  }
});

test("carsForSale: a whole number, as a number or a numeric string", () => {
  assert.equal(resolveSellerSummary({ name: "x", carsForSale: "7" }).facts[0].value, "7");
  for (const bad of [-1, 1.5, "many", NaN]) {
    assert.throws(() => resolveSellerSummary({ name: "x", carsForSale: bad }), /SellerSummary: `carsForSale` must be a whole number/);
  }
});

test("headingLevel: 2 to 6, default 2", () => {
  assert.equal(resolveSellerSummary({ name: "x", headingLevel: 3 }).headingLevel, 3);
  assert.equal(resolveSellerSummary({ name: "x", headingLevel: "4" }).headingLevel, 4);
  assert.equal(resolveSellerSummary({ name: "x", headingLevel: false }).headingLevel, 2);
  assert.throws(() => resolveSellerSummary({ name: "x", headingLevel: 1 }), {
    message: 'SellerSummary: unknown headingLevel "1". Use one of: 2, 3, 4, 5, 6.',
  });
});

test("size: full is the default; an unknown size is rejected", () => {
  assert.equal(resolveSellerSummary({ name: "x", size: false }).size, "full");
  assert.throws(() => resolveSellerSummary({ name: "x", size: "large" }), {
    message: 'SellerSummary: unknown size "large". Use one of: full, compact.',
  });
});

test("id: sets the root id and the heading id together", () => {
  const seller = resolveSellerSummary({ name: "x", id: "seller" });
  assert.equal(seller.id, "seller");
  assert.equal(seller.headingId, "seller-heading");
});

test("labels: overrides replace the English text; a blank one keeps the default", () => {
  const seller = resolveSellerSummary({ ...dealer, labels: { heading: "Tentang penjual", location: "Lokasi", showroom: "  ", bogus: "x" } });
  assert.equal(seller.heading, "Tentang penjual");
  assert.equal(seller.facts[1].label, "Lokasi");
  assert.equal(seller.showroomLabel, "View showroom");
  assert.ok(Object.isFrozen(SELLER_SUMMARY_LABELS));
});

test("className: the caller's classes follow the component's own", () => {
  assert.equal(
    resolveSellerSummary({ name: "x", size: "compact", className: ["mt-2", { ring: true }] }).className,
    "seller-summary seller-summary--compact mt-2 ring",
  );
});
