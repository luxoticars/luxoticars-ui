import type { Meta, StoryObj } from "@storybook/marko";
import TextRange, { type Input } from "../src/marko/text-range.marko";
import { textRangeData } from "./price-filter-data";

/**
 * `<text-range>` for Marko 6 apps: a min and a max field with a submit button.
 * Leaving a field with a valid range fires `onBlur`; the button or Enter fires
 * `onChange`. An invalid range shows its message and does not fire.
 *
 * ```marko
 * text-range minField=min maxField=max prefixLabel="$" onChange(range) { … }
 * ```
 */
export default {
  title: "Controls/text-range",
  component: TextRange,
  tags: ["autodocs"],
  argTypes: {
    minField: { control: "object", description: "The min field: `label` (placeholder), `value`, `accessibilityText`." },
    maxField: { control: "object", description: "The max field, as `minField`." },
    middleLabel: { control: "text", description: "Shown between the fields." },
    prefixLabel: { control: "text", description: "Shown before each value, for example `$`." },
    suffixLabel: { control: "text", description: "Shown after each value. Ignored when `prefixLabel` is set." },
    submitButtonAccessibilityText: { control: "text", description: "The submit button's title and accessible name." },
    validationMessages: { control: "object", description: "One message, or one per validation code." },
    action: { control: "text", description: "Makes the range a GET form that submits to this URL, each field under its `key`. The button stays enabled so it works without JS." },
    hiddenFields: { control: "object", description: "`[name, value]` pairs sent along with the range. Form mode only." },
    onBlur: { action: "blur", description: "Fires when a field loses focus and the range is valid." },
    onChange: { action: "change", description: "Fires when the range is submitted and valid." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const Default: Story = {
  args: { ...textRangeData, maxField: { ...textRangeData.maxField, value: "" } },
};

export const WithInitialValues: Story = {
  args: {
    ...textRangeData,
    minField: { ...textRangeData.minField, value: "10" },
    maxField: { ...textRangeData.maxField, value: "500" },
  },
};

export const WithSuffixLabel: Story = {
  args: { ...Default.args, prefixLabel: undefined, suffixLabel: "€" } as Input,
};

export const WithoutCurrency: Story = {
  args: { ...Default.args, prefixLabel: undefined } as Input,
};

export const WithStringValidation: Story = {
  args: { ...Default.args, validationMessages: "Enter a valid price range" } as Input,
};

export const WithoutValidationMessages: Story = {
  args: { ...Default.args, validationMessages: undefined } as Input,
};

export const AsForm: Story = {
  args: {
    ...Default.args,
    action: "/search",
    hiddenFields: [["q", "proton"]],
    minField: { ...textRangeData.minField, key: "price_min" },
    maxField: { ...textRangeData.maxField, value: "", key: "budget" },
  } as Input,
};
