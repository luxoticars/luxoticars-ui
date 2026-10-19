/*
  Everything the price filter parts decide, as plain functions: parsing and
  validating typed amounts, turning a preset's value into a range, and the
  graph's bucket boundaries, knob snapping and label placement. The Marko tags
  only print and wire up what these return, so the rules live in one place and
  are testable without a browser.
*/

/** The last boundary of a graph whose final bucket has no upper limit. */
export const OPEN_END = Number.POSITIVE_INFINITY;

export const VALID = "valid";

/**
 * Parses a typed amount. European currencies (€, EUR) use `.` for thousands and
 * `,` for decimals; everything else uses `,` for thousands. Blank is 0; text
 * that is not a number is NaN.
 */
export function parseAmount(text, currency = "") {
  if (!text) return 0;
  const raw = String(text);
  if (currency === "€" || currency === "EUR") return Number(raw.replace(/\s|\./g, "").replace(/,/g, "."));
  return Number(raw.replace(/\s|,/g, ""));
}

/**
 * Validates a min/max pair of typed amounts. Blank is allowed on either side.
 * `code` is `valid`, `non.numeric.min`, `non.numeric.max` or `invalid.range`.
 */
export function validateRange(min, max, currency = "") {
  const lo = String(min ?? "").trim();
  const hi = String(max ?? "").trim();
  let code = VALID;
  let numLo = 0;
  let numHi = 0;

  if (lo) {
    numLo = parseAmount(lo, currency);
    if (Number.isNaN(numLo)) code = "non.numeric.min";
  }
  if (hi && code === VALID) {
    numHi = parseAmount(hi, currency);
    if (Number.isNaN(numHi)) code = "non.numeric.max";
  }
  if (code === VALID && lo && hi && numLo > numHi) code = "invalid.range";

  return { success: code === VALID, code, min: lo, max: hi };
}

/**
 * The message for a validation code. `messages` is either one string for every
 * failure or a map by code; with none, no message is shown.
 */
export function validationMessage(messages, code) {
  if (code === VALID || !messages) return null;
  if (typeof messages === "string") return messages;
  return messages[code] || null;
}

/** Whether a failed code marks the min field, the max field, or both as invalid. */
export function invalidFields(code) {
  return {
    min: code === "non.numeric.min" || code === "invalid.range",
    max: code === "non.numeric.max" || code === "invalid.range",
  };
}

/**
 * Turns a preset's value into a range: `"25-60"` is 25 to 60, `"60"` is 60 and
 * up. A value that is not a number gives a min of NaN, as the caller's
 * mistake to see rather than something to hide.
 */
export function parseOptionValue(value) {
  if (typeof value === "string" && value.includes("-")) {
    const [min, max] = value.split("-").map(Number);
    return { min, max };
  }
  return { min: Number(value), max: undefined };
}

/** Whether a link option should render as an anchor: only absolute http(s) URLs do. */
export function isHyperlink(url) {
  return /^https?:\/\//i.test(url || "");
}

/** The buckets that have a numeric `min` and `count`; anything else is dropped. */
export function validBuckets(priceRanges) {
  if (!Array.isArray(priceRanges)) return [];
  return priceRanges.filter((r) => r && typeof r.min === "number" && typeof r.count === "number");
}

/** The edges of every bucket, plus the last bucket's upper edge (or {@link OPEN_END}). */
export function calculateBoundaries(buckets) {
  if (buckets.length === 0) return [0];
  const edges = buckets.map((b) => b.min);
  edges.push(buckets[buckets.length - 1].max ?? OPEN_END);
  return edges;
}

/** The nearest edge at or below `value`. */
export function closestLowerBoundary(value, boundaries) {
  if (!boundaries.length) return 0;
  for (let i = boundaries.length - 1; i >= 0; i--) if (value >= boundaries[i]) return boundaries[i];
  return boundaries[0];
}

/** The nearest edge at or above `value`. */
export function closestUpperBoundary(value, boundaries) {
  if (!boundaries.length) return OPEN_END;
  for (const edge of boundaries) if (value <= edge) return edge;
  return boundaries[boundaries.length - 1];
}

/**
 * Where the two knobs start, as indexes into `boundaries`. A missing
 * `minValue` is the first edge; a missing `maxValue` is the last.
 */
export function initialKnobs(boundaries, minValue, maxValue) {
  const min = minValue ? closestLowerBoundary(minValue, boundaries) : boundaries[0] ?? 0;
  const max = maxValue ? closestUpperBoundary(maxValue, boundaries) : boundaries[boundaries.length - 1];
  return { minIdx: boundaries.indexOf(min), maxIdx: boundaries.indexOf(max) };
}

/**
 * Keeps the knobs at least one bucket apart. Moving the min knob past the max
 * pushes it back to one below the max, and the other way round.
 */
export function restrictKnob(type, idx, minIdx, maxIdx, lastIdx) {
  if (type === "min") return idx >= maxIdx - 1 ? Math.max(0, maxIdx - 1) : idx;
  return idx <= minIdx + 1 ? Math.min(lastIdx, minIdx + 1) : idx;
}

/**
 * When the knobs sit one or two buckets apart their thumbs overlap, so each is
 * nudged outwards. Returns the pixel offsets, or null when they are far enough
 * apart to need none.
 */
export function knobNudge(gap, bucketCount) {
  if (gap !== 1 && gap !== 2) return null;
  const long = bucketCount >= 16;
  return gap === 1 ? { min: long ? -6 : -4, max: long ? 6 : 4 } : { min: long ? -5 : -1, max: long ? 5 : 1 };
}

// How far each value label shifts so the two labels do not collide, by the
// number of buckets between the knobs. "End" is for a knob at the last edge.
const MIN_SHIFT = { 1: -1.5, 2: -1, 3: -0.5 };
const MIN_SHIFT_LONG = { 1: -2, 2: -1.3, 3: -0.8, 4: -0.5 };
const MIN_SHIFT_END = { 1: -1.7, 2: -1.2, 3: -0.6 };
const MIN_SHIFT_END_LONG = { 1: -2.2, 2: -1.5, 3: -1, 4: -0.6 };
const MAX_SHIFT = { 1: 3, 2: 2, 3: 1.5 };
const MAX_SHIFT_LONG = { 1: 3.3, 2: 2.3, 3: 1.8, 4: 1.4 };
const MAX_SHIFT_END = { 1: 2.5, 2: 2.2, 3: 1.6 };
const MAX_SHIFT_END_LONG = { 1: 2.8, 2: 2.5, 3: 1.9, 4: 1.5 };

/** Where a value label sits before any spreading: a percentage of the track, plus a px offset. */
function labelPosition(type, minIdx, maxIdx, lastIdx, bucketCount) {
  const gap = maxIdx - minIdx;
  const long = bucketCount > 16;
  if (type === "min") {
    const pct = (minIdx / lastIdx) * 100;
    const table = maxIdx === lastIdx ? (long ? MIN_SHIFT_END_LONG : MIN_SHIFT_END) : long ? MIN_SHIFT_LONG : MIN_SHIFT;
    const shift = table[gap] ?? 1;
    const base = pct * 0.15;
    return { pct, px: shift < 0 ? shift * base : 8 - base };
  }
  const pct = (maxIdx / lastIdx) * 100;
  const table = maxIdx === lastIdx ? (long ? MAX_SHIFT_END_LONG : MAX_SHIFT_END) : long ? MAX_SHIFT_LONG : MAX_SHIFT;
  const shift = table[gap] ?? 1;
  return { pct, px: 8 * shift - pct * 0.15 };
}

/** The CSS `left` of the min or max value label for the knobs' current indexes; `spread` pushes it further out (see {@link labelSpread}). */
export function labelLeft(type, minIdx, maxIdx, lastIdx, bucketCount, spread = 0) {
  const { pct, px } = labelPosition(type, minIdx, maxIdx, lastIdx, bucketCount);
  return `calc(${pct}% + (${type === "min" ? px - spread : px + spread}px))`;
}

// Rough width of a value label at the graph's 12px type, the width of the
// track the labels are placed along, and the least space left between labels.
const LABEL_CHAR_PX = 7;
const TRACK_PX = 170;
const LABEL_GAP_PX = 6;
const MAX_SPREAD_PX = 24;

/**
 * How far to push the two value labels apart, each way, in px, when long
 * labels (six-digit prices) would run into each other after the usual
 * placement. Zero when they already fit, as with short labels.
 */
export function labelSpread(minText, maxText, minIdx, maxIdx, lastIdx, bucketCount) {
  const centre = (type) => {
    const { pct, px } = labelPosition(type, minIdx, maxIdx, lastIdx, bucketCount);
    return (pct / 100) * TRACK_PX + px;
  };
  const halves = ((String(minText).length + String(maxText).length) * LABEL_CHAR_PX) / 2;
  const overlap = halves + LABEL_GAP_PX - (centre("max") - centre("min"));
  return Math.min(MAX_SPREAD_PX, Math.max(0, overlap / 2));
}

/** A bar is lit when its bucket overlaps the selected range. */
export function isBarEnabled(bucket, minValue, maxValue) {
  return minValue < (bucket.max ?? OPEN_END) && maxValue > (bucket.min ?? 0);
}

/** 100000 as "100k", 1500000 as "1.5M"; below 1,000 it is left alone. */
export function compactNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) < 1000) return String(value);
  const [divisor, suffix] = Math.abs(n) < 1_000_000 ? [1000, "k"] : [1_000_000, "M"];
  return `${Math.round((n / divisor) * 10) / 10}${suffix}`;
}

/**
 * Formats a price with its currency before or after it. With `compact`, the
 * number is shortened (a trailing "+", as on an open-ended last bucket, is kept).
 */
export function formatPrice(value, currency, position, compact = false) {
  const text = compact ? (typeof value === "string" && value.endsWith("+") ? `${compactNumber(value.slice(0, -1))}+` : compactNumber(value)) : value;
  return position === "before" ? `${currency}${text}` : `${text} ${currency}`;
}
