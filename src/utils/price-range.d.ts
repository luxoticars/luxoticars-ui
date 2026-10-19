export declare const OPEN_END: number;
export declare const VALID: "valid";

export type ValidationCode = "invalid.range" | "non.numeric.min" | "non.numeric.max";
export type ValidationMessages = Record<ValidationCode, string> | string;

export interface RangeValidation {
  success: boolean;
  /** `"valid"` or the failing {@link ValidationCode}. */
  code: "valid" | ValidationCode;
  /** The trimmed min text. */
  min: string;
  /** The trimmed max text. */
  max: string;
}

export interface PriceBucket {
  /** Number of listings in the bucket. */
  count: number;
  /** Upper edge; leave out on the last bucket for an open-ended range. */
  max?: number;
  /** Lower edge. */
  min: number;
  /** What screen readers hear for the bar. */
  accessibilityText?: string;
}

export type CurrencyPosition = "before" | "after";

/** Parses a typed amount; blank is 0 and non-numeric text is NaN. € and EUR use European separators. */
export declare function parseAmount(text: string | undefined, currency?: string): number;
/** Validates a min/max pair of typed amounts; blank is allowed on either side. */
export declare function validateRange(min: string | undefined, max: string | undefined, currency?: string): RangeValidation;
/** The message for a validation code, or null when there is none to show. */
export declare function validationMessage(messages: ValidationMessages | undefined, code: string): string | null;
/** Which fields a failed code marks invalid. */
export declare function invalidFields(code: string): { min: boolean; max: boolean };
/** `"25-60"` is 25 to 60; `"60"` is 60 and up. */
export declare function parseOptionValue(value: string | undefined): { min: number; max: number | undefined };
/** True for absolute http(s) URLs only. */
export declare function isHyperlink(url: string | undefined): boolean;
export declare function validBuckets(priceRanges: unknown): PriceBucket[];
export declare function calculateBoundaries(buckets: PriceBucket[]): number[];
export declare function closestLowerBoundary(value: number, boundaries: number[]): number;
export declare function closestUpperBoundary(value: number, boundaries: number[]): number;
export declare function initialKnobs(
  boundaries: number[],
  minValue: number | undefined,
  maxValue: number | undefined,
): { minIdx: number; maxIdx: number };
export declare function restrictKnob(
  type: "min" | "max",
  idx: number,
  minIdx: number,
  maxIdx: number,
  lastIdx: number,
): number;
export declare function knobNudge(gap: number, bucketCount: number): { min: number; max: number } | null;
/** How far to push the two value labels apart, each way, in px, when long labels would run into each other; 0 when they fit. */
export declare function labelSpread(
  minText: string | number,
  maxText: string | number,
  minIdx: number,
  maxIdx: number,
  lastIdx: number,
  bucketCount: number,
): number;
export declare function labelLeft(
  type: "min" | "max",
  minIdx: number,
  maxIdx: number,
  lastIdx: number,
  bucketCount: number,
  spread?: number,
): string;
export declare function isBarEnabled(bucket: PriceBucket, minValue: number, maxValue: number): boolean;
/** 100000 as "100k", 1500000 as "1.5M"; below 1,000 it is left alone. */
export declare function compactNumber(value: string | number): string;
/** Formats a price with its currency before or after it; `compact` shortens the number. */
export declare function formatPrice(value: string | number, currency: string, position: CurrencyPosition, compact?: boolean): string;
