import type { Meta, StoryObj } from "@storybook/marko";
import SelectionGroup, { type Input } from "../src/marko/selection-group.marko";
import { selectionGroupData } from "./price-filter-data";

/**
 * `<selection-group>` for Marko 6 apps: checkboxes or radios. It is controlled,
 * so each option's `selected` is the source of truth and `onSelect` reports a
 * change for the parent to apply.
 *
 * ```marko
 * selection-group type="checkbox" options=options onSelect(event) { … }
 * ```
 *
 * An option whose `url` is an absolute http(s) address renders as a link, with
 * the box drawn but not interactive.
 */
export default {
  title: "Controls/selection-group",
  component: SelectionGroup,
  tags: ["autodocs"],
  argTypes: {
    options: { control: "object", description: "The options, in order." },
    type: { control: "inline-radio", options: ["checkbox", "radio"], description: "Checkboxes or radios." },
    fieldsetLabel: { control: "text", description: "A name for the group, read by screen readers." },
    onSelect: { action: "select", description: "Fires when the user changes an option that is not a link." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const DefaultCheckbox: Story = { args: selectionGroupData };

export const DefaultRadio: Story = { args: { ...selectionGroupData, type: "radio" } };

export const DefaultAnchorTag: Story = {
  args: {
    ...selectionGroupData,
    options: selectionGroupData.options.map((option, i) => ({
      ...option,
      url: `https://example.com/search?range=${option.value}`,
      disabled: i === 2,
    })),
  },
};

const counted = selectionGroupData.options.map((option, i) => ({
  ...option,
  count: ["(120)", "(48)", "(9)"][i],
  countAccessibilityText: ["120 results", "48 results", "9 results"][i],
  accessoryLabel: i === 1 ? "Most popular" : undefined,
}));

export const CountWithAccessoryLabel: Story = { args: { ...selectionGroupData, options: counted } };

export const CountWithAccessoryLabelRadio: Story = {
  args: { ...selectionGroupData, type: "radio", options: counted },
};
