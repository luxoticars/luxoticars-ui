import type { Meta, StoryObj } from "@storybook/marko";
import MenuButton, { type Input } from "./index.marko";
import { cases, markoArgTypes } from "../../../stories/menu-button-cases";
import {
  checkBadges,
  checkCheckboxes,
  checkFocusLeaves,
  checkNavigation,
  checkOutsideFocusAfterPress,
  checkOpenAndClose,
  checkRadios,
  checkSemantics,
} from "../../../stories/menu-button-play";

const BLOCK = "lx-menu-button";
type Ctx = { canvasElement: HTMLElement };

/**
 * `<lx-menu-button>` for Marko 6 apps: a button that opens a menu, following the
 * WAI-ARIA menu button pattern. It is discovered through the package's
 * marko.json, so it needs no import:
 *
 * ```marko
 * lx-menu-button label="Condition" type="checkbox" items=[
 *   { value: "any", label: "Any Condition", checked: true },
 *   { value: "used", label: "Used" },
 * ] onSelect(event) { console.log(event.value, event.checked) }
 * ```
 *
 * It keeps its own checked state, and follows `checked` when the parent changes
 * it, so it works with or without a handler. The cases are shared with the Astro
 * stories (stories/menu-button-cases.ts).
 */
export default {
  title: "Components/lx-menu-button",
  component: MenuButton,
  tags: ["autodocs"],
  argTypes: markoArgTypes,
  parameters: { docs: { story: { height: "420px" } } },
} satisfies Meta<Input>;

type Story = StoryObj<Input>;

export const Condition: Story = {
  args: cases.Condition,
  play: async ({ canvasElement }: Ctx) => {
    await checkSemantics(canvasElement, BLOCK);
    await checkOpenAndClose(canvasElement, BLOCK);
    await checkNavigation(canvasElement, BLOCK);
    await checkCheckboxes(canvasElement, BLOCK);
    await checkFocusLeaves(canvasElement, BLOCK);
    await checkOutsideFocusAfterPress(canvasElement, BLOCK);
  },
};
export const Badged: Story = {
  args: cases.Badged,
  play: async ({ canvasElement }: Ctx) => {
    await checkSemantics(canvasElement, BLOCK);
    await checkBadges(canvasElement, BLOCK);
    await checkOpenAndClose(canvasElement, BLOCK);
  },
};
export const CheckboxWithBadges: Story = {
  args: cases.CheckboxWithBadges,
  play: async ({ canvasElement }: Ctx) => {
    await checkBadges(canvasElement, BLOCK);
    await checkCheckboxes(canvasElement, BLOCK);
  },
};
export const Radio: Story = {
  args: cases.Radio,
  play: async ({ canvasElement }: Ctx) => checkRadios(canvasElement, BLOCK),
};
export const Prefix: Story = {
  args: cases.Prefix,
  play: async ({ canvasElement }: Ctx) => checkRadios(canvasElement, BLOCK),
};
export const Links: Story = { args: cases.Links };
export const WithDisabledItem: Story = {
  args: cases.WithDisabledItem,
  play: async ({ canvasElement }: Ctx) => checkNavigation(canvasElement, BLOCK),
};
export const InAForm: Story = { args: cases.InAForm };
export const AlignEnd: Story = { args: cases.AlignEnd };
