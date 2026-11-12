import type { Meta, StoryObj } from "@storybook/marko";
import ProgramBadge, { type Input } from "./index.marko";
import { cases, markoArgTypes } from "../../../stories/program-badge-cases";

/**
 * `<lx-program-badge>` for Marko 6 apps. It is discovered through the package's
 * marko.json, so it needs no import:
 *
 * ```marko
 * lx-program-badge icon="top-rated-seller" text="Top rated seller"
 * ```
 *
 * The cases are shared with the Astro stories (stories/program-badge-cases.ts).
 */
export default {
  title: "Components/program-badge",
  component: ProgramBadge,
  tags: ["autodocs"],
  argTypes: markoArgTypes,
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const Default: Story = { args: cases.Default };
export const BlueTick: Story = { args: cases.BlueTick };
export const BlueTickIconOnly: Story = { args: cases.BlueTickIconOnly };
export const Star: Story = { args: cases.Star };
export const StarIconOnly: Story = { args: cases.StarIconOnly };
export const Verified: Story = { args: cases.Verified };
export const VerifiedIconOnly: Story = { args: cases.VerifiedIconOnly };
export const Pin: Story = { args: cases.Pin };
export const PinIconOnly: Story = { args: cases.PinIconOnly };
export const TextOnly: Story = { args: cases.TextOnly };
export const IconOnly: Story = { args: cases.IconOnly };
export const Large: Story = { args: cases.Large };
export const IconOnlyMalayLabel: Story = { args: cases.IconOnlyMalayLabel };
export const WithAttributes: Story = { args: cases.WithAttributes };
