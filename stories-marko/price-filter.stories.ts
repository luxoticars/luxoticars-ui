import type { Meta, StoryObj } from "@storybook/marko";
import PriceFilter, { type Input } from "../src/marko/price-filter.marko";
import { graphData, selectionGroupData, textRangeData } from "./price-filter-data";

/**
 * `<price-filter>` for Marko 6 apps. It composes `<selection-group>`,
 * `<text-range>` and `<price-distribution-graph>` around one shared range, so
 * picking a preset, submitting the text range or releasing a knob updates all
 * three. Each part is also a tag of its own.
 *
 * ```marko
 * price-filter
 *   selectionGroupData=presets
 *   textRangeData=fields
 *   priceGraphData=graph
 *   onPriceRangeChange(params) { … }
 * ```
 *
 * `onPriceRangeChange` reports `[{ paramKey, paramValue }, …]` under each
 * field's `key` (`price_min` and `price_max` by default). The filter knows
 * nothing about URLs; the parent decides what to do with the range.
 */
export default {
  title: "Controls/price-filter",
  component: PriceFilter,
  tags: ["autodocs"],
  argTypes: {
    selectionGroupData: { control: "object", description: "The preset ranges, as `<selection-group>` takes them. An option's `value` is `min-max`, or `min` for an open end." },
    textRangeData: { control: "object", description: "The min and max fields, as `<text-range>` takes them." },
    priceGraphData: { control: "object", description: "The graph, as `<price-distribution-graph>` takes it. Its `minValue` and `maxValue` are the starting range." },
    onSelectionChange: { action: "selection-change", description: "Fires when a preset is picked or cleared." },
    onPriceRangeChange: { action: "price-range-change", description: "Fires when the text range is submitted or a graph knob is released." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const Default: Story = { args: { selectionGroupData, textRangeData, priceGraphData: graphData } };

export const WithReadonlyPriceGraph: Story = {
  args: { selectionGroupData, textRangeData, priceGraphData: { ...graphData, showKnobs: false } },
};

export const WithoutPriceGraph: Story = {
  args: { selectionGroupData, textRangeData: { ...textRangeData, maxField: { ...textRangeData.maxField, value: "" } } },
};
