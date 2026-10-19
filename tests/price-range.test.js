import { test } from "node:test";
import assert from "node:assert/strict";
import {
  OPEN_END,
  calculateBoundaries,
  closestLowerBoundary,
  compactNumber,
  closestUpperBoundary,
  formatPrice,
  initialKnobs,
  invalidFields,
  isBarEnabled,
  isHyperlink,
  knobNudge,
  labelLeft,
  labelSpread,
  parseAmount,
  parseOptionValue,
  restrictKnob,
  validBuckets,
  validateRange,
  validationMessage,
} from "../src/utils/price-range.js";

const buckets = [
  { min: 0, max: 50, count: 10 },
  { min: 50, max: 100, count: 20 },
  { min: 100, max: 150, count: 5 },
  { min: 150, count: 2 },
];

test("parseAmount: blank is 0, thousands separators are dropped, junk is NaN", () => {
  assert.equal(parseAmount(""), 0);
  assert.equal(parseAmount("1,234.5"), 1234.5);
  assert.equal(parseAmount("1 234"), 1234);
  assert.ok(Number.isNaN(parseAmount("abc")));
});

test("parseAmount: European currencies read . as thousands and , as decimal", () => {
  assert.equal(parseAmount("1.234,5", "€"), 1234.5);
  assert.equal(parseAmount("1.234,5", "EUR"), 1234.5);
  assert.equal(parseAmount("1,234.5", "$"), 1234.5);
});

test("validateRange: blank sides are fine, bad text and inverted ranges are not", () => {
  assert.deepEqual(validateRange("", ""), { success: true, code: "valid", min: "", max: "" });
  assert.equal(validateRange("10", "").success, true);
  assert.equal(validateRange("x", "5").code, "non.numeric.min");
  assert.equal(validateRange("5", "x").code, "non.numeric.max");
  assert.equal(validateRange("50", "10").code, "invalid.range");
  assert.equal(validateRange("10", "10").success, true);
  assert.equal(validateRange(" 5 ", " 9 ").min, "5");
});

test("validationMessage: a string covers every code, a map is looked up, none shows nothing", () => {
  assert.equal(validationMessage("bad", "invalid.range"), "bad");
  assert.equal(validationMessage({ "invalid.range": "r" }, "invalid.range"), "r");
  assert.equal(validationMessage({ "invalid.range": "r" }, "non.numeric.min"), null);
  assert.equal(validationMessage(undefined, "invalid.range"), null);
  assert.equal(validationMessage("bad", "valid"), null);
});

test("invalidFields: a bad range marks both, a bad number marks its own side", () => {
  assert.deepEqual(invalidFields("invalid.range"), { min: true, max: true });
  assert.deepEqual(invalidFields("non.numeric.min"), { min: true, max: false });
  assert.deepEqual(invalidFields("non.numeric.max"), { min: false, max: true });
  assert.deepEqual(invalidFields("valid"), { min: false, max: false });
});

test("parseOptionValue: a range or an open-ended minimum", () => {
  assert.deepEqual(parseOptionValue("25-60"), { min: 25, max: 60 });
  assert.deepEqual(parseOptionValue("60"), { min: 60, max: undefined });
  assert.deepEqual(parseOptionValue("0-25"), { min: 0, max: 25 });
});

test("isHyperlink: only absolute http(s) URLs", () => {
  assert.equal(isHyperlink("https://example.com/x"), true);
  assert.equal(isHyperlink("HTTP://example.com"), true);
  assert.equal(isHyperlink("/search?a=1"), false);
  assert.equal(isHyperlink("a=1&b=2"), false);
  assert.equal(isHyperlink(undefined), false);
});

test("validBuckets: drops entries without a numeric min and count", () => {
  assert.equal(validBuckets(undefined).length, 0);
  assert.equal(validBuckets([{ min: 0, count: 1 }, { min: "1", count: 1 }, null, { count: 3 }]).length, 1);
});

test("calculateBoundaries: every lower edge plus the last upper edge, open-ended when it has none", () => {
  assert.deepEqual(calculateBoundaries(buckets), [0, 50, 100, 150, OPEN_END]);
  assert.deepEqual(calculateBoundaries([{ min: 0, max: 10, count: 1 }]), [0, 10]);
  assert.deepEqual(calculateBoundaries([]), [0]);
});

test("closest boundaries snap a value outwards", () => {
  const edges = [0, 50, 100, 150, OPEN_END];
  assert.equal(closestLowerBoundary(75, edges), 50);
  assert.equal(closestLowerBoundary(50, edges), 50);
  assert.equal(closestUpperBoundary(25, edges), 50);
  assert.equal(closestUpperBoundary(50, edges), 50);
  assert.equal(closestUpperBoundary(500, edges), OPEN_END);
});

test("initialKnobs: no values span the whole graph, values snap to edges", () => {
  const edges = [0, 50, 100, 150, OPEN_END];
  assert.deepEqual(initialKnobs(edges, undefined, undefined), { minIdx: 0, maxIdx: 4 });
  assert.deepEqual(initialKnobs(edges, 0, 25), { minIdx: 0, maxIdx: 1 });
  assert.deepEqual(initialKnobs(edges, 60, 120), { minIdx: 1, maxIdx: 3 });
});

test("restrictKnob: knobs stay at least one bucket apart", () => {
  assert.equal(restrictKnob("min", 3, 0, 4, 4), 3);
  assert.equal(restrictKnob("min", 4, 0, 4, 4), 3);
  assert.equal(restrictKnob("min", 9, 0, 4, 4), 3);
  assert.equal(restrictKnob("max", 2, 1, 4, 4), 2);
  assert.equal(restrictKnob("max", 1, 1, 4, 4), 2);
  assert.equal(restrictKnob("max", 0, 1, 4, 4), 2);
  assert.equal(restrictKnob("min", 0, 3, 4, 4), 0);
});

test("knobNudge: only when the knobs are one or two buckets apart", () => {
  assert.equal(knobNudge(3, 15), null);
  assert.deepEqual(knobNudge(1, 15), { min: -4, max: 4 });
  assert.deepEqual(knobNudge(2, 15), { min: -1, max: 1 });
  assert.deepEqual(knobNudge(1, 16), { min: -6, max: 6 });
});

test("isBarEnabled: lit when the bucket overlaps the selected range", () => {
  assert.equal(isBarEnabled(buckets[0], 0, 50), true);
  assert.equal(isBarEnabled(buckets[1], 0, 50), false);
  assert.equal(isBarEnabled(buckets[3], 100, OPEN_END), true);
  assert.equal(isBarEnabled(buckets[0], 50, OPEN_END), false);
});

test("formatPrice: currency before or after", () => {
  assert.equal(formatPrice(25, "$", "before"), "$25");
  assert.equal(formatPrice(25, "€", "after"), "25 €");
});

test("labelLeft: the labels sit at their knob, shifted apart when the knobs are close", () => {
  // Knobs far apart: the min label is at its knob (offset 8 - 0), the max label too.
  assert.equal(labelLeft("min", 0, 14, 15, 15), "calc(0% + (8px))");
  assert.equal(labelLeft("max", 0, 14, 15, 15), `calc(${(14 / 15) * 100}% + (${8 - (14 / 15) * 100 * 0.15}px))`);
  // Knobs one bucket apart: min shifts left, max shifts right.
  assert.match(labelLeft("min", 0, 1, 15, 15), /^calc\(0% \+ \(-?0px\)\)$|^calc\(0% \+ \(0px\)\)$/);
  assert.equal(labelLeft("max", 0, 1, 15, 15), `calc(${(1 / 15) * 100}% + (${24 - (1 / 15) * 100 * 0.15}px))`);
});

test("compactNumber: thousands as k, millions as M, one decimal at most, small numbers untouched", () => {
  assert.equal(compactNumber(999), "999");
  assert.equal(compactNumber(1000), "1k");
  assert.equal(compactNumber(100000), "100k");
  assert.equal(compactNumber(123456), "123.5k");
  assert.equal(compactNumber(999999), "1000k");
  assert.equal(compactNumber(1_000_000), "1M");
  assert.equal(compactNumber(1_500_000), "1.5M");
  assert.equal(compactNumber("250000"), "250k");
  assert.equal(compactNumber("abc"), "abc");
});

test("formatPrice: compact shortens the number and keeps an open-end plus", () => {
  assert.equal(formatPrice(100000, "RM", "before", true), "RM100k");
  assert.equal(formatPrice("1500000+", "RM", "before", true), "RM1.5M+");
  assert.equal(formatPrice(100000, "RM", "before"), "RM100000");
  assert.equal(formatPrice(300000, "MYR", "after", true), "300k MYR");
});

test("labelSpread: nothing when the labels fit, a push outward when long labels sit close together, capped", () => {
  // The reference's own case: "$0" and "$25" on adjacent knobs already fit with the usual placement.
  assert.equal(labelSpread("$0", "$25", 0, 1, 14, 15), 0);
  assert.equal(labelSpread("$100", "$300", 5, 8, 14, 14), 0);
  const long = labelSpread("RM100000", "RM300000", 5, 8, 14, 14);
  assert.ok(long > 5 && long < 24, `spread ${long}`);
  assert.ok(labelSpread("RM100k", "RM300k", 5, 8, 14, 14) < long);
  assert.equal(labelSpread("R".repeat(40), "R".repeat(40), 5, 6, 14, 14), 24);
  assert.notEqual(labelLeft("max", 5, 8, 14, 14, 10), labelLeft("max", 5, 8, 14, 14, 0));
  assert.equal(labelLeft("min", 5, 8, 14, 14, 0), labelLeft("min", 5, 8, 14, 14));
});
