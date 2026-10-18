import { test } from "node:test";
import assert from "node:assert/strict";
import { cardKicker, cardLocation, cardMeta, cardPrice, cardTitle, mileageLabel } from "../src/utils/listing-card.js";
import { createListingCard } from "../src/html/listing-card.js";

/* One set of rules for every listing card, so a car reads the same on the
   home page and in the search results. */

const listing = (over = {}) => ({
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
  ...over,
});

test("the kicker is the year and make, and copes with either missing", () => {
  assert.equal(cardKicker(listing()), "2021 · Land Rover");
  assert.equal(cardKicker(listing({ year: null })), "Land Rover");
  assert.equal(cardKicker(listing({ year: null, make: null })), "");
});

test("the title drops the leading year and make the kicker already shows", () => {
  assert.equal(cardTitle(listing()), "Range Rover Vogue P400 SE");
  assert.equal(cardTitle(listing({ title: "2024 Mercedes Benz G63 Pullman", make: "Mercedes-Benz" })), "G63 Pullman");
  assert.equal(cardTitle(listing({ title: "Bmw M4 COUPE COMPETITION", make: "BMW" })), "M4 COUPE COMPETITION");
});

test("the title is never empty", () => {
  assert.equal(cardTitle(listing({ title: "2020 Ferrari", make: "Ferrari" })), "Ferrari");
  assert.equal(cardTitle(listing({ title: "Porsche 911 GT3", make: null })), "Porsche 911 GT3");
});

test("mileage bands read as ranges, and unknown tokens are dropped", () => {
  assert.equal(mileageLabel("5000-10000"), "5,000–10,000 km");
  assert.equal(mileageLabel("200000+"), "200,000+ km");
  assert.equal(mileageLabel(null), null);
  assert.equal(mileageLabel("lots"), null);
});

test("the meta line labels condition and body type; only MPV and SUV are initialisms", () => {
  assert.equal(cardMeta(listing()), "Recon · SUV · 5,000–10,000 km");
  assert.equal(cardMeta(listing({ car_type: "coupe", mileage_band: null })), "Recon · Coupe");
  assert.equal(cardMeta(listing({ condition: "new", car_type: "mpv", mileage_band: null })), "New · MPV");
  assert.equal(cardMeta(listing({ condition: "used", car_type: "van", mileage_band: null })), "Used · Van");
  assert.equal(cardMeta(listing({ condition: null, car_type: null, mileage_band: null })), "");
});

test("price and location have readable fallbacks", () => {
  assert.equal(cardPrice(listing()), "MYR 450,000");
  assert.equal(cardPrice(listing({ price: null })), "Price on request");
  assert.equal(cardLocation(listing()), "Bangsar, W.P. Kuala Lumpur");
  assert.equal(cardLocation(listing({ location_area: null, location_state: null })), "Location not provided");
});

test("the card is one link named by the full title, under the heading level asked for", () => {
  const html = createListingCard({ listing: listing(), imageSrc: "/m/abc123/cover/", headingLevel: 3 });
  assert.match(html, /<h3 class="listing-card__title" id="listing-card-abc123"><a class="listing-card__link" href="\/m\/abc123\/" aria-label="2021 Land Rover Range Rover Vogue P400 SE">Range Rover Vogue P400 SE<\/a><\/h3>/);
  assert.match(html, /aria-labelledby="listing-card-abc123"/);
  assert.equal(html.match(/<a /g).length, 1);
  assert.match(html, /<img class="listing-card__image" src="\/m\/abc123\/cover\/"/);
});

test("no photo, no kicker, no meta: placeholders and no empty lines", () => {
  const html = createListingCard({ listing: listing({ year: null, make: null, condition: null, car_type: null, mileage_band: null }) });
  assert.match(html, /Photo unavailable/);
  assert.doesNotMatch(html, /listing-card__kicker|listing-card__meta/);
  assert.match(html, /<h2 /);
});

test("every value is escaped", () => {
  const html = createListingCard({ listing: listing({ id: 'x"><b>', title: "<script>alert(1)</script>" }), href: '/m/"x' });
  assert.doesNotMatch(html, /<script>|<b>|href="\/m\/"x"/);
});
