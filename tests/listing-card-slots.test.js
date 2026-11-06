import { test } from "node:test";
import assert from "node:assert/strict";
import { assertListingCardSlots } from "../src/utils/listing-card-slots.js";

test("accepts a complete card", () => {
  assert.doesNotThrow(() =>
    assertListingCardSlots({ href: "/m/abc/", titleText: "Range Rover Vogue", priceText: "MYR 450,000" }),
  );
});

test("throws without href", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "", titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: "   ", titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: undefined, titleText: "x", priceText: "y" }),
    { message: "ListingCard: `href` is required." },
  );
});

test("throws without title text", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "", priceText: "MYR 1" }),
    { message: "ListingCard: `title` slot is required and must not be empty." },
  );
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "  ", priceText: "MYR 1" }),
    { message: "ListingCard: `title` slot is required and must not be empty." },
  );
});

test("throws without price text", () => {
  assert.throws(
    () => assertListingCardSlots({ href: "/m/a/", titleText: "Car", priceText: "" }),
    { message: "ListingCard: `price` slot is required and must not be empty." },
  );
});
