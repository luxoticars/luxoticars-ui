import type { Meta, StoryObj } from "@storybook/marko";
import BusyDemo from "../../../stories-marko/menu-button-busy-demo.marko";
import { checkBusyState } from "../../../stories/menu-button-play";

type Ctx = { canvasElement: HTMLElement };

/**
 * A parent that turns `busy` on and off. The waiting state follows the prop: a bright arc runs around the button, and a
 * border animates and a status region says `busyLabel`, then everything goes back.
 */
export default { title: "Components/lx-menu-button-busy", component: BusyDemo } satisfies Meta;

export const FollowsTheProp: StoryObj = {
  play: async ({ canvasElement }: Ctx) => {
    const press = async (selector: string) => {
      canvasElement.querySelector<HTMLElement>(selector)!.click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    };
    await checkBusyState(canvasElement, "lx-menu-button", null);
    await press(".start");
    await checkBusyState(canvasElement, "lx-menu-button", "Updating results…");
    await press(".stop");
    await checkBusyState(canvasElement, "lx-menu-button", null);
  },
};
