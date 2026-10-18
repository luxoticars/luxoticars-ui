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
