/*
  Sample data shared by the price filter stories, one set per part, so the
  composed filter and each part on its own show the same thing.
*/
import type { Input as GraphInput } from "../src/marko/lx-price-distribution-graph/index.marko";
import type { Input as GroupInput } from "../src/marko/lx-selection-group/index.marko";
import type { Input as TextRangeInput } from "../src/marko/lx-text-range/index.marko";

export const priceRanges: GraphInput["priceRanges"] = [
  { min: 0, max: 50, count: 2500 },
  { min: 50, max: 100, count: 633 },
  { min: 100, max: 150, count: 2662 },
  { min: 150, max: 200, count: 440 },
  { min: 200, max: 250, count: 338 },
  { min: 250, max: 300, count: 415 },
  { min: 300, max: 400, count: 763 },
  { min: 400, max: 500, count: 644 },
  { min: 500, max: 600, count: 481 },
  { min: 600, max: 700, count: 423 },
  { min: 700, max: 800, count: 379 },
  { min: 800, max: 900, count: 383 },
  { min: 900, max: 1000, count: 306 },
  { min: 1000, max: 1500, count: 1025 },
  { min: 1500, count: 500 },
];

export const graphLabels: NonNullable<GraphInput["labels"]> = {
  graphTitle: "Price Distribution",
  accessibilityText: "Graph of available inventory between $0 and $1500+",
  minKnobAccessibilityText: "Minimum price selection knob",
  maxKnobAccessibilityText: "Maximum price selection knob",
};

export const graphData: GraphInput = {
  priceRanges,
  minValue: 0,
  maxValue: 25,
  currencyCode: "$",
  currencyPosition: "before",
  labels: graphLabels,
  showKnobs: true,
};

export const selectionGroupData: GroupInput = {
  type: "checkbox",
  fieldsetLabel: "Filter By Price Range",
  options: [
    { label: "Under $25.00", value: "0-25", selected: true },
    { label: "$25.00 to $60.00", value: "25-60" },
    { label: "Over $60.00", value: "60" },
  ],
};

export const textRangeData: TextRangeInput = {
  prefixLabel: "$",
  middleLabel: "to",
  minField: { label: "Min", accessibilityText: "Minimum budget value", value: "" },
  maxField: { label: "Max", accessibilityText: "Maximum budget value", value: "25" },
  submitButtonAccessibilityText: "Apply budget filter",
  validationMessages: {
    "invalid.range": "Minimum budget cannot be greater than maximum budget",
    "non.numeric.min": "Invalid minimum budget format",
    "non.numeric.max": "Invalid maximum budget format",
  },
};
