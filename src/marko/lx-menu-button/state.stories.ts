import type { Meta, StoryObj } from "@storybook/marko";
import ParentDemo from "../../../stories-marko/menu-button-parent-demo.marko";
import { frame, parts } from "../../../stories/menu-button-play";

const BLOCK = "lx-menu-button";
type Ctx = { canvasElement: HTMLElement };

/**
 * A parent that owns `checked`, as a page driven by the URL or a store does. What the parent
 * says replaces what the user chose, and going back to an earlier answer must not bring an
 * earlier choice back with it.
 */
export default { title: "Components/lx-menu-button-parent-driven", component: ParentDemo } satisfies Meta;

export const ParentDrivenState: StoryObj = {
  play: async ({ canvasElement }: Ctx) => {
    const { button } = parts(canvasElement, BLOCK);
    const checkedLabels = () =>
      [...canvasElement.querySelectorAll(`.${BLOCK}__item[aria-checked="true"]`)].map((el) => el.querySelector(`.${BLOCK}__text`)?.textContent);
    const press = async (selector: string) => {
      canvasElement.querySelector<HTMLElement>(selector)!.click();
      await frame();
    };
    const expect = (wanted: string[], when: string) => {
      if (checkedLabels().join() !== wanted.join()) throw new Error(`${when}: expected ${wanted.join()}, got ${checkedLabels().join()}`);
    };
    expect(["Any Condition"], "start");
    button.click();
    await frame();
    canvasElement.querySelectorAll<HTMLElement>(`.${BLOCK}__item`)[2].click();
    await frame();
    expect(["Used"], "the user checks Used, which unchecks the exclusive Any");
    await press(".parent-only-used");
    expect(["Used"], "the parent replaces the choice");
    await press(".parent-back-to-any");
    expect(["Any Condition"], "the parent goes back: the old choice does not return");
  },
};
