import type { Meta, StoryObj } from "@storybook/marko";
import PriceDistributionGraph, { type Input } from "../src/marko/price-distribution-graph.marko";
import { graphData } from "./price-filter-data";

/**
 * `<price-distribution-graph>` for Marko 6 apps: a histogram of listings by
 * price with two knobs. The knobs snap to the edges of the buckets and stay at
 * least one bucket apart. `onChange` fires when a knob is released.
 *
 * ```marko
 * price-distribution-graph priceRanges=buckets minValue=0 maxValue=250 onChange(range) { … }
 * ```
 */
export default {
  title: "Controls/price-distribution-graph",
  component: PriceDistributionGraph,
  tags: ["autodocs"],
  argTypes: {
    priceRanges: { control: "object", description: "One bucket per bar. Leave `max` off the last for an open end." },
    minValue: { control: "number", description: "The current minimum." },
    maxValue: { control: "number", description: "The current maximum; leave out for the open end." },
    currencySymbol: { control: "text", description: "Shown instead of `currencyCode` when set." },
    currencyCode: { control: "text", description: "The currency shown in the labels." },
    compactLabels: { control: "boolean", description: "Shortens the labels, for example RM100k instead of RM100000. Useful for large prices, which would run into each other." },
    currencyPosition: { control: "inline-radio", options: ["before", "after"], description: "Whether the currency goes before or after the value." },
    labels: { control: "object", description: "The title and the screen reader text." },
    showKnobs: { control: "boolean", description: "Shows the draggable knobs. Off, the graph is read-only." },
    onChange: { action: "change", description: "Fires when the user releases a knob." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const InteractiveGraph: Story = {
  args: { ...graphData, minValue: 0, maxValue: undefined, currencyCode: "USD", currencyPosition: "after" },
};

export const InteractiveGraphNoMax: Story = {
  args: { ...graphData, minValue: 200, maxValue: undefined },
};

export const ReadOnlyGraph: Story = {
  args: { ...graphData, showKnobs: false },
};

// Bucket edges in ringgit, as a car listing site would use them.
const edges = [0, 20_000, 40_000, 60_000, 80_000, 100_000, 150_000, 200_000, 300_000, 400_000, 500_000, 700_000, 1_000_000, 1_500_000];
const counts = [120, 340, 410, 380, 290, 260, 310, 180, 150, 90, 60, 40, 25, 12];
const largePrices = {
  ...graphData,
  priceRanges: edges.map((min, i) => ({ min, max: edges[i + 1], count: counts[i] })),
  currencySymbol: "RM",
  minValue: 100000,
  maxValue: 300000,
};

/** Six-digit prices with the knobs close together: the labels would run into each other. */
export const LargePrices: Story = { args: largePrices };

export const LargePricesCompactLabels: Story = { args: { ...largePrices, compactLabels: true } };
